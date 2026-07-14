import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

interface PieChartData {
  status: string;
  count: number;
}

interface AppointmentPieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
}

const CHART_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.488 0.243 264.376)",
  " oklch(0.696 0.17 162.48)",
];

const AppointmentPieChart = ({
  data,
  title,
  description,
}: AppointmentPieChartProps) => {
  const formattedData = data.map((item) => ({
    name: item.status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: Number(item.count),
  }));

  if (!formattedData || formattedData.every((item) => item.value === 0)) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={"value"}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentPieChart;
