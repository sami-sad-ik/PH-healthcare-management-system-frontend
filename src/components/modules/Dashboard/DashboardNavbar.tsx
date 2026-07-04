import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getNavItemsByRole } from "@/lib/navItems";
import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/navItems.types";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
  const userInfo = await getUserInfo();
  const navItems: NavSection[] = getNavItemsByRole(userInfo?.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo?.role);
  return (
    <DashboardNavbarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardNavbar;
