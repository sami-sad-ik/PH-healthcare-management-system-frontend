import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/authUtils";

export const proxy = async (request: NextRequest) => {
  try {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const decodedAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
        .data;

    const isValidAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
        .success;

    let userRole: UserRole | null = null;

    if (decodedAccessToken) {
      userRole = decodedAccessToken.role as UserRole;
    }
    const routeOwner = getRouteOwner(pathname);
    const unifySuperAdminAndAdminRole =
      userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;
    const isAuth = unifySuperAdminAndAdminRole;
    //rule 1 : user is logged in and trying to access auth routes -> don't allow
    if (isAuth && isValidAccessToken && isAuthRoute(pathname)) {
      //!: isAuthRoute is not used in if by mentor
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
    //rule 2 : user trying to access public routes -> allow
    if (routeOwner === null) {
      return NextResponse.next();
    }

    //rule 3 : user has no access token and trying to access private route -> redirect to login page
    if (!isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    //rule 4 : user has access token and trying to access common protected route -> allow
    if (routeOwner === "COMMON") {
      return NextResponse.next();
    }

    //rule 5 : user tries to access role based protected route but doesn't have required role -> redirect to default dashboard
    if (
      routeOwner === "ADMIN" ||
      routeOwner === "DOCTOR" ||
      routeOwner === "PATIENT"
    ) {
      if (routeOwner !== userRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
        );
      }
    }
    return NextResponse.next();
  } catch (error) {
    console.log(`Error occured in proxy middleware ${error}`);
  }
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|verify-email|reset-password|forgot-password).*)",
  ],
};
