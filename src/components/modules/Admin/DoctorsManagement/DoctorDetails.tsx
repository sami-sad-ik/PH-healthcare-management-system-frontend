"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDoctorById } from "@/services/doctor.service";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, Mail, MapPin, Phone, Star } from "lucide-react";

export type DoctorDetailsData = {
  id: string | number;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  registrationNumber?: string | null;
  qualification?: string | null;
  experience?: number | null;
  gender?: string | null;
  appointmentFee?: number | null;
  currentWorkingPlace?: string | null;
  designation?: string | null;
  averageRating?: number | null;
  user?: Record<string, unknown> | null;
  specialities?: Array<{ id: string; title: string }>;
  appointments?: Array<Record<string, unknown>>;
  doctorSchedules?: Array<Record<string, unknown>>;
  reviews?: Array<Record<string, unknown>>;
};

type DoctorDetailsProps = {
  doctorId: string | number;
};

const textValue = (value: unknown, fallback = "Not provided") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const formatDate = (value: unknown) => {
  if (!value) return "Not provided";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? textValue(value) : date.toLocaleString();
};

const relationValue = (item: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return item[key];
    }
  }
  return undefined;
};

const RelationList = ({
  items,
  emptyMessage,
  renderItem,
}: {
  items?: Array<Record<string, unknown>>;
  emptyMessage: string;
  renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode;
}) => {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return <div className="space-y-2">{items.map(renderItem)}</div>;
};

const DoctorDetails = ({ doctorId }: DoctorDetailsProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctor", String(doctorId)],
    queryFn: () => getDoctorById(String(doctorId)),
  });
  const doctor = data?.data;

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

  if (isError || !doctor) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        Unable to load doctor details. Please try again.
      </p>
    );
  }

  const user = doctor.user ?? {};
  const specialities = doctor.specialities ?? [];
  const appointments = doctor.appointments ?? [];
  const schedules = doctor.doctorSchedules ?? [];
  const reviews = doctor.reviews ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
            <AvatarFallback className="text-2xl">
              {doctor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold">{doctor.name}</h3>
              {doctor.gender && <Badge variant="outline">{doctor.gender}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {textValue(doctor.designation)} at {textValue(doctor.currentWorkingPlace)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {specialities.length ? (
                specialities.map((speciality) => (
                  <Badge key={speciality.id} variant="secondary">
                    {speciality.title}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No specialities</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {doctor.averageRating?.toFixed(1) ?? "0.0"}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User information</CardTitle>
            <CardDescription>Account and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{doctor.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{textValue(doctor.contactNumber)}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{textValue(doctor.address)}</p>
            <p><span className="font-medium">Status:</span> {textValue(user.status)}</p>
            <p><span className="font-medium">Role:</span> {textValue(user.role, "DOCTOR")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor information</CardTitle>
            <CardDescription>Professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Qualification:</span> {textValue(doctor.qualification)}</p>
            <p><span className="font-medium">Registration:</span> {textValue(doctor.registrationNumber)}</p>
            <p><span className="font-medium">Experience:</span> {doctor.experience ?? 0} years</p>
            <p><span className="font-medium">Appointment fee:</span> {doctor.appointmentFee ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Appointments ({appointments.length})</CardTitle></CardHeader>
          <CardContent>
            <RelationList
              items={appointments}
              emptyMessage="No appointments found."
              renderItem={(item, index) => (
                <div key={String(item.id ?? index)} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{textValue(relationValue(item, ["status", "appointmentStatus"]))}</p>
                  <p className="text-muted-foreground">{formatDate(relationValue(item, ["createdAt", "date", "appointmentDate"]))}</p>
                  <p className="text-muted-foreground">Patient: {textValue(relationValue(item, ["patientName", "patientId"]))}</p>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Schedules ({schedules.length})</CardTitle></CardHeader>
          <CardContent>
            <RelationList
              items={schedules}
              emptyMessage="No schedules found."
              renderItem={(item, index) => (
                <div key={String(item.id ?? index)} className="rounded-md border p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium"><CalendarDays className="h-4 w-4" />{formatDate(relationValue(item, ["date", "scheduleDate"]))}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" />{textValue(relationValue(item, ["startTime", "start"]))} - {textValue(relationValue(item, ["endTime", "end"]))}</p>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reviews ({reviews.length})</CardTitle></CardHeader>
          <CardContent>
            <RelationList
              items={reviews}
              emptyMessage="No reviews found."
              renderItem={(item, index) => (
                <div key={String(item.id ?? index)} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center gap-1 font-medium"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{textValue(relationValue(item, ["rating", "score"]))}</div>
                  <p className="mt-1 text-muted-foreground">{textValue(relationValue(item, ["comment", "review"]))}</p>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDetails;
