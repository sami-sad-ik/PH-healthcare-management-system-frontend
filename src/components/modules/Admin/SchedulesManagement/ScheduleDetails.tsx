"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getScheduleById } from "@/services/schedule.service";
import { useQuery } from "@tanstack/react-query";
import { differenceInMinutes, format } from "date-fns";
import { CalendarDays, Clock3, Users } from "lucide-react";

export type ScheduleDetailsData = {
  id: string;
  startDateTime: string | Date;
  endDateTime: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  appointments?: Array<Record<string, unknown>>;
  doctorSchedules?: Array<Record<string, unknown>>;
};

type ScheduleDetailsProps = {
  scheduleId: string;
};

const formatDateTime = (value: string | Date | undefined, pattern = "PPP p") => {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return format(date, pattern);
};

const ScheduleDetails = ({ scheduleId }: ScheduleDetailsProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["schedule", String(scheduleId)],
    queryFn: () => getScheduleById(String(scheduleId)),
  });

  const schedule = data?.data as ScheduleDetailsData | undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    );
  }

  if (isError || !schedule) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        Unable to load schedule details. Please try again.
      </p>
    );
  }

  const appointments = schedule.appointments ?? [];
  const doctorSchedules = schedule.doctorSchedules ?? [];
  const durationMinutes = differenceInMinutes(
    new Date(schedule.endDateTime),
    new Date(schedule.startDateTime),
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Schedule overview</CardTitle>
          <CardDescription>Availability and booking summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {formatDateTime(schedule.startDateTime, "MMM dd, yyyy")}
            </Badge>
            <Badge variant="secondary">
              {durationMinutes} minutes
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Start
              </p>
              <p className="font-medium">{formatDateTime(schedule.startDateTime)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                End
              </p>
              <p className="font-medium">{formatDateTime(schedule.endDateTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Created:</span>{" "}
              {formatDateTime(schedule.createdAt, "PPP p")}
            </p>
            <p>
              <span className="font-medium">Updated:</span>{" "}
              {formatDateTime(schedule.updatedAt, "PPP p")}
            </p>
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {appointments.length} appointment(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned doctors</CardTitle>
          </CardHeader>
          <CardContent>
            {doctorSchedules.length ? (
              <div className="space-y-2">
                {doctorSchedules.map((item, index) => (
                  <div key={String(item.id ?? index)} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">Doctor link {index + 1}</p>
                    <p className="text-muted-foreground">
                      {item.isBooked ? "Booked" : "Available"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No doctors assigned to this slot.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleDetails;
