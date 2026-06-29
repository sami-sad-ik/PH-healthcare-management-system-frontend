import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/authUtils";
import {
  getNewTokensWithRefreshToken,
  getUserInfo,
} from "./services/auth.service";
import { isTokenExpiringSoon } from "./lib/tokenUtils";

export const refreshTokenMiddleware = async (
  token: string,
): Promise<boolean> => {
  try {
    const refresh = await getNewTokensWithRefreshToken(token);
    if (!refresh) return false;
    return true;
  } catch (error) {
    console.log("Error refreshing token", error);
    return false;
  }
};

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
    userRole = unifySuperAdminAndAdminRole;
    const isAuth = isAuthRoute(pathname);

    //proactively refresh token if refresh token exists and access token is expired or about to expire
    if (
      isValidAccessToken &&
      refreshToken &&
      (await isTokenExpiringSoon(accessToken as string))
    ) {
      const requestHeaders = new Headers(request.headers);
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      try {
        const refreshed = await refreshTokenMiddleware(refreshToken);
        if (refreshed) {
          requestHeaders.set("x-token-refreshed", "1");
        }

        return NextResponse.next({
          request: { headers: requestHeaders },
          headers: response.headers,
        });
      } catch (error) {
        console.log("Error refreshing token", error);
      }
    }

    //rule 1 : user is logged in and trying to access auth routes -> don't allow
    if (isAuth && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }

    //rule 2 : user trying to access reset-password
    if (pathname === "reset-password") {
      const email = request.nextUrl.searchParams.get("email");
      //case 1 : user has needPasswordChange true
      if (accessToken && email) {
        const userInfo = await getUserInfo();
        if (userInfo.needPasswordChange) {
          return NextResponse.next();
        } else {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
      }
      //case 2 : user coming from forgot password
      if (email) {
        return NextResponse.next();
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    //rule 3 : user trying to access public routes -> allow
    if (routeOwner === null) {
      return NextResponse.next();
    }

    //rule 4 : user has no access token and trying to access private route -> redirect to login page
    if (!isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    //rule 5 : enforcing to reset-password if needPasswordChange is true
    if (accessToken) {
      const userInfo = await getUserInfo();
      if (userInfo.needPasswordChange) {
        if (pathname !== "/reset-password") {
          const resetPasswordUrl = new URL("/reset-password", request.url);
          resetPasswordUrl.searchParams.set("email", userInfo.email);
          return NextResponse.redirect(resetPasswordUrl);
        }
        return NextResponse.next();
      }
      if (
        userInfo &&
        !userInfo.needPasswordChange &&
        pathname === "/reset-password"
      ) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
        );
      }
    }

    //rule 5 : user has access token and trying to access common protected route -> allow
    if (routeOwner === "COMMON") {
      return NextResponse.next();
    }

    //rule 6 : user tries to access role based protected route but doesn't have required role -> redirect to default dashboard
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
