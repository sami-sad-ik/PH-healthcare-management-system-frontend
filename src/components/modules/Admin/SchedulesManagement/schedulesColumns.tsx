import Datecell from "@/components/shared/cell/Datecell";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ISchedule } from "@/types/schedule.types";

const formatTimeRange = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${format(startDate, "MMM dd, yyyy")} • ${format(startDate, "hh:mm a")} - ${format(endDate, "hh:mm a")}`;
};

export const scheduleColumns: ColumnDef<ISchedule>[] = [
  {
    id: "slot",
    accessorKey: "startDateTime",
    header: "Schedule Slot",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium text-foreground">
          {formatTimeRange(row.original.startDateTime, row.original.endDateTime)}
        </p>
      </div>
    ),
  },
  {
    id: "startDateTime",
    accessorKey: "startDateTime",
    header: "Start",
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <Datecell date={row.original.startDateTime} formatString="MMM dd, yyyy" />
        <p className="text-muted-foreground">
          {format(new Date(row.original.startDateTime), "hh:mm a")}
        </p>
      </div>
    ),
  },
  {
    id: "endDateTime",
    accessorKey: "endDateTime",
    header: "End",
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <Datecell date={row.original.endDateTime} formatString="MMM dd, yyyy" />
        <p className="text-muted-foreground">
          {format(new Date(row.original.endDateTime), "hh:mm a")}
        </p>
      </div>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created On",
    cell: ({ row }) => (
      <Datecell date={row.original.createdAt} formatString="MMM dd, yyyy" />
    ),
  },
];
