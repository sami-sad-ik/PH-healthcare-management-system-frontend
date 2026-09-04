"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { bookAppointment, bookAppointmentWithPayLater } from "@/services/appointment.service";
import type { DoctorDetailsData } from "@/components/modules/Admin/DoctorsManagement/DoctorDetails";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, CreditCard, LoaderCircle } from "lucide-react";

type BookingReviewProps = { doctor: DoctorDetailsData; scheduleId: string };

const BookingReview = ({ doctor, scheduleId }: BookingReviewProps) => {
  const router = useRouter();
  const schedule = (doctor.doctorSchedules ?? []).find((item) => String(item.scheduleId ?? item.id) === scheduleId);
  const nestedSchedule = (schedule?.schedule ?? schedule) as Record<string, unknown> | undefined;
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  const submit = async (payLater: boolean) => {
    setError(undefined);
    setIsPending(true);
    try {
      const response = payLater ? await bookAppointmentWithPayLater({ doctorId: String(doctor.id), scheduleId }) : await bookAppointment({ doctorId: String(doctor.id), scheduleId });
      const paymentUrl = response.data.paymentUrl;
      if (paymentUrl) window.location.assign(paymentUrl);
      else router.push("/dashboard/my-appointments");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to book this appointment.");
      setIsPending(false);
    }
  };

  if (!schedule || !nestedSchedule?.startDateTime) {
    return <Card><CardContent className="py-12 text-center text-sm text-destructive">This schedule is no longer available. Please choose another time.</CardContent></Card>;
  }

  const start = new Date(String(nestedSchedule.startDateTime));
  const end = new Date(String(nestedSchedule.endDateTime));
  return <Card className="mx-auto max-w-2xl"><CardHeader><CardTitle>Confirm your appointment</CardTitle><CardDescription>Review the consultation details before continuing.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="rounded-lg border bg-muted/30 p-5"><h2 className="text-lg font-semibold">Dr. {doctor.name}</h2><p className="mt-1 text-sm text-muted-foreground">{doctor.designation || "Medical professional"}</p><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{start.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p><p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} - {end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p></div></div><div className="flex items-center justify-between border-t pt-4"><span className="text-sm text-muted-foreground">Consultation fee</span><span className="text-xl font-semibold">৳{doctor.appointmentFee ?? 0}</span></div>{error && <p className="text-sm text-destructive">{error}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" disabled={isPending} onClick={() => router.back()}>Change time</Button><Button variant="secondary" disabled={isPending} onClick={() => submit(true)}>Pay later</Button><Button disabled={isPending} onClick={() => submit(false)}>{isPending ? <LoaderCircle className="animate-spin" /> : <CreditCard />}Pay now</Button></div></CardContent></Card>;
};

export default BookingReview;
