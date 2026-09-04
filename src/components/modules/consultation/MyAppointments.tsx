"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyAppointments, initiatePayment, type AppointmentRecord } from "@/services/appointment.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, CreditCard, LoaderCircle } from "lucide-react";

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Date unavailable";
const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "Time unavailable";

const AppointmentCard = ({ appointment }: { appointment: AppointmentRecord }) => {
  const paymentMutation = useMutation({
    mutationFn: () => initiatePayment(appointment.id),
    onSuccess: ({ data }) => { if (data.paymentUrl) window.location.assign(data.paymentUrl); },
  });
  const start = appointment.schedule?.startDateTime;
  const end = appointment.schedule?.endDateTime;
  return <Card><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Dr. {appointment.doctor?.name ?? "Doctor"}</h2><p className="text-sm text-muted-foreground">{appointment.doctor?.designation ?? "Medical professional"}</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(start)}</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{formatTime(start)} - {formatTime(end)}</span></div></div><div className="flex items-center gap-3"><div className="text-right"><p className="font-semibold">৳{appointment.payment?.amount ?? appointment.doctor?.appointmentFee ?? 0}</p><p className="text-xs text-muted-foreground">{appointment.paymentStatus ?? appointment.payment?.status ?? appointment.status ?? "Pending"}</p></div>{appointment.paymentStatus !== "PAID" && appointment.payment?.status !== "PAID" && <Button size="sm" disabled={paymentMutation.isPending} onClick={() => paymentMutation.mutate()}>{paymentMutation.isPending ? <LoaderCircle className="animate-spin" /> : <CreditCard />}Pay now</Button>}</div></CardContent></Card>;
};

const MyAppointments = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ["my-appointments"], queryFn: getMyAppointments });
  const appointments = data?.data ?? [];
  return <main className="mx-auto max-w-5xl space-y-6"><div><p className="text-sm font-medium text-primary">Your care schedule</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">My appointments</h1><p className="mt-2 text-muted-foreground">Keep track of upcoming consultations and outstanding payments.</p></div>{isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><LoaderCircle className="animate-spin" /></div> : isError ? <p className="py-16 text-center text-destructive">Unable to load your appointments.</p> : appointments.length ? <div className="space-y-3">{appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</div> : <Card><CardHeader><CardTitle>No appointments yet</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Choose a doctor and book your first consultation.</CardContent></Card>}</main>;
};

export default MyAppointments;
