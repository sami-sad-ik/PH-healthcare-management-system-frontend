"use client";

import AppointmentBarChart from "@/components/shared/AppointmentBarChart";
import AppointmentPieChart from "@/components/shared/AppointmentPieChart";
import StatsCard from "@/components/shared/form/StatsCard";
import { getDashboardData } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

const AdminDashboardContent = () => {
  const { data: adminDashboardData } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: "always",
  });

  const { data } = adminDashboardData || {};

  return (
    <div>
      <StatsCard
        title="Total Appointments"
        value={data?.appointmentCount || 0}
        iconName="CalendarDays"
        description="Number of appointments scheduled"
      />
      <StatsCard
        title="Total Patients"
        value={data?.patientCount || 0}
        iconName="User"
        description="Number of patients registered"
      />
      <AppointmentBarChart data={data?.barChartData || []} />
      <AppointmentPieChart data={data?.pieChartData || []} />
    </div>
  );
};

export default AdminDashboardContent;
