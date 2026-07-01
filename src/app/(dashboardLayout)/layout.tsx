import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";

const RootDashboardLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* dashboard sidebar */}
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* dashboard navbar */}
        <DashboardNavbar />
        {/* dashboard content */}
        <main className="flex-1  overflow-y-auto bg-muted/10 p-4 md:p-6">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RootDashboardLayout;
