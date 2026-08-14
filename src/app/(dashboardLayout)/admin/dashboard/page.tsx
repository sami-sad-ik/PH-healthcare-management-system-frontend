import AdminDashboardContent from "@/components/modules/Dashboard/AdminDashboardContent";
import { getDashboardData } from "@/services/dashboard.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    staleTime: 1000 * 30, // 30 seconds : data stays fresh for 30 seconds if this data is requested again within 30 seconds,
    //  it will be served from cache instead of making a new request
    gcTime: 1000 * 60 * 5, // 5 minutes : data will be garbage collected (cached data will be removed) after 5 minutes if not used
  });

  // const dashboardData = queryClient.getQueryData(["admin-dashboard-data"]);
  // console.log(dashboardData, "Dashboard data from page component");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardContent />
    </HydrationBoundary>
  );
};

export default AdminDashboardPage;
