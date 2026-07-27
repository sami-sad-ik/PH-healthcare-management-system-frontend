import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChartData } from "@/types/dashboard.types";

interface AppointmentBarChartProps {
  data: BarChartData[];
  title?: string;
  description?: string;
}

const AppointmentBarChart = ({ data }: AppointmentBarChartProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Appointment Trends</CardTitle>
          <CardDescription>Monthly Appointment Statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-sm text-muted-foreground">
            No appointment data available to display the chart
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    month:
      typeof item.month === "string"
        ? format(new Date(item.month), "MMM yyyy")
        : format(item.month, "MMM yyyy"),
    appointments: item.count,
  }));

  if (
    !formattedData ||
    formattedData.every((item) => item.appointments === 0)
  ) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Appointment Trends</CardTitle>
          <CardDescription>Monthly Appointment Statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-sm text-muted-foreground">
            No appointment data available to display the chart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
        <CardDescription>Monthly Appointment Statistics</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-72">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis tickLine={false} axisLine={false} dataKey="month" />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="appointments"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentBarChart;
