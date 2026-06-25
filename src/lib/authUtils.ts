export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "verify-email",
];

export const isAuthRoute = (pathName: string) => {
  return authRoutes.some((route: string) => route === pathName);
};

export type RouteConfig = {
  pattern: RegExp[];
  exact: string[];
};

const commonProtectedRoutes: RouteConfig = {
  pattern: [],
  exact: ["my-profile", "/change-password"],
};

const doctorProtectedRoutes: RouteConfig = {
  pattern: [/^\/doctor\/dashboard/],
  exact: [],
};

const adminOrSuperAdminProtectedRoutes: RouteConfig = {
  pattern: [/^\/admin\/dashboard/],
  exact: [],
};

const patientProtectedRoutes: RouteConfig = {
  pattern: [/^\/dashboard/],
  exact: ["/payment/success"],
};

const isRouteMatches = (pathName: string, routes: RouteConfig) => {
  if (routes.exact.includes(pathName)) return true;
  return routes.pattern.some((route) => route.test(pathName));
};

export const getRouteOwner = (
  pathName: string,
): "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
  if (isRouteMatches(pathName, commonProtectedRoutes)) return "COMMON";
  if (isRouteMatches(pathName, doctorProtectedRoutes)) return "DOCTOR";
  if (isRouteMatches(pathName, adminOrSuperAdminProtectedRoutes))
    return "ADMIN";
  if (isRouteMatches(pathName, patientProtectedRoutes)) return "PATIENT";
  return null;
};

export const getDefaultDashboardRoute = (role: string) => {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin/dashboard";
  if (role === "DOCTOR") return "/doctor/dashboard";
  if (role === "PATIENT") return "/dashboard";
  return "/dashboard";
};
