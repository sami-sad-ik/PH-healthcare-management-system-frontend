import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getNavItemsByRole } from "@/lib/NavItems";
import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/navItems.types";

const DashboardSidebar = async () => {
  const userInfo = await getUserInfo();
  const navItems: NavSection[] = getNavItemsByRole(userInfo?.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo?.role);
  return <div>dashboard sidebar</div>;
};

export default DashboardSidebar;
