import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
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
    if (isAuth && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
    return NextResponse.next();
  } catch (error) {}
};

const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)",
  ],
};
