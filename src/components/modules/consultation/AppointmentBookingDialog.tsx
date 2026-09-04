"use client";

import type { DoctorDetailsData } from "@/components/modules/Admin/DoctorsManagement/DoctorDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDoctorById } from "@/services/doctor.service";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ScheduleRecord = Record<string, unknown> & {
  id?: string;
  scheduleId?: string;
  isBooked?: boolean;
  schedule?: { id?: string; startDateTime?: string | Date; endDateTime?: string | Date };
};

type AppointmentBookingDialogProps = {
  doctorId: string | number;
  doctorName: string;
  schedules?: ScheduleRecord[];
  triggerLabel?: string;
  className?: string;
};

const getSchedule = (item: ScheduleRecord) => item.schedule ?? item;

const getScheduleId = (item: ScheduleRecord) => item.scheduleId ?? item.schedule?.id ?? item.id;

const formatDate = (value: unknown) => {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const formatTime = (value: unknown) => {
  if (!value) return "Time unavailable";
  if (value instanceof Date) {
    return value.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  const text = String(value).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i.test(text)) {
    return text;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const AppointmentBookingDialog = ({ doctorId, doctorName, schedules: initialSchedules, triggerLabel = "Book appointment", className }: AppointmentBookingDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const { data, isLoading } = useQuery({
    queryKey: ["doctor", String(doctorId), "booking-schedules"],
    queryFn: () => getDoctorById(String(doctorId)),
    enabled: open && !initialSchedules?.length,
  });

  const schedules = useMemo(() => {
    const source = initialSchedules?.length ? initialSchedules : ((data?.data as DoctorDetailsData | undefined)?.doctorSchedules ?? []) as ScheduleRecord[];
    const now = new Date();
    return source
      .filter((item) => !item.isBooked)
      .map((item) => ({ item, schedule: getSchedule(item) }))
      .filter(({ schedule }) => {
        const start = new Date(String(schedule.startDateTime));
        return !Number.isNaN(start.getTime()) && start >= now;
      })
      .sort((left, right) => new Date(String(left.schedule.startDateTime)).getTime() - new Date(String(right.schedule.startDateTime)).getTime());
  }, [data?.data, initialSchedules]);

  const proceed = () => {
    if (!selectedScheduleId) return;
    router.push(`/dashboard/book-appointments?doctorId=${doctorId}&scheduleId=${selectedScheduleId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className={className} onClick={() => setOpen(true)}><CalendarDays />{triggerLabel}</Button>
      <DialogContent>
        <DialogHeader><DialogTitle>Choose a consultation time</DialogTitle><DialogDescription>Select an available schedule with Dr. {doctorName}.</DialogDescription></DialogHeader>
        {isLoading ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" />Loading schedules...</div> : schedules.length ? <div className="grid gap-3 sm:grid-cols-2">{schedules.map(({ item, schedule }) => {
          const id = getScheduleId(item);
          if (!id) return null;
          const selected = selectedScheduleId === id;
          return <button key={id} type="button" onClick={() => setSelectedScheduleId(id)} className={`rounded-lg border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "hover:border-primary/50"}`}><p className="font-medium">{formatDate(schedule.startDateTime)}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="h-4 w-4" />{formatTime(schedule.startDateTime)} - {formatTime(schedule.endDateTime)}</p></button>;
        })}</div> : <p className="py-10 text-center text-sm text-muted-foreground">No future schedules are available for this doctor.</p>}
        <div className="mt-2 flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!selectedScheduleId} onClick={proceed}>Continue</Button></div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingDialog;
