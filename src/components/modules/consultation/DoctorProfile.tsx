import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorDetailsData } from "@/components/modules/Admin/DoctorsManagement/DoctorDetails";
import {
  Award,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

type DoctorProfileProps = { doctor: DoctorDetailsData };

const displayValue = (value: unknown, fallback = "Not provided") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const formatDate = (value: unknown) => {
  if (!value) return "Date not provided";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? displayValue(value) : date.toLocaleDateString();
};

const relationValue = (item: Record<string, unknown>, keys: string[]) =>
  keys.map((key) => item[key]).find((value) => value !== null && value !== undefined && value !== "");

const DoctorProfile = ({ doctor }: DoctorProfileProps) => {
  const specialities = doctor.specialities ?? [];
  const schedules = doctor.doctorSchedules ?? [];
  const reviews = doctor.reviews ?? [];
  const rating = Number(doctor.averageRating ?? 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit overflow-hidden border-0 bg-primary text-primary-foreground shadow-md">
          <div className="flex justify-center bg-primary/90 px-6 pt-8">
            <Avatar className="h-40 w-40 border-4 border-primary-foreground/20">
              <AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
              <AvatarFallback className="bg-primary-foreground/15 text-4xl text-primary-foreground">
                {doctor.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardContent className="space-y-4 p-6 text-center">
            <div>
              <h1 className="text-2xl font-semibold">{doctor.name}</h1>
              <p className="mt-1 text-primary-foreground/75">{displayValue(doctor.designation)}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-primary-foreground/70">({reviews.length} reviews)</span>
            </div>
            <div className="border-t border-primary-foreground/20 pt-4 text-left text-sm text-primary-foreground/80">
              <p className="flex gap-2"><Award className="h-4 w-4 shrink-0" />{doctor.experience ?? 0} years of experience</p>
              <p className="mt-3 flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{displayValue(doctor.currentWorkingPlace)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-primary">Doctor profile</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">About {doctor.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {specialities.length ? specialities.map((speciality) => (
                <Badge key={speciality.id} variant="secondary">{speciality.title}</Badge>
              )) : <span className="text-sm text-muted-foreground">Specialities not provided</span>}
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Professional information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Qualification:</span> {displayValue(doctor.qualification)}</p>
              <p><span className="font-medium">Registration:</span> {displayValue(doctor.registrationNumber)}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{displayValue(doctor.email)}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{displayValue(doctor.contactNumber)}</p>
              <p className="flex items-center gap-2 sm:col-span-2"><MapPin className="h-4 w-4 text-muted-foreground" />{displayValue(doctor.address)}</p>
              <p><span className="font-medium">Consultation fee:</span> {displayValue(doctor.appointmentFee, "Not specified")}</p>
              <p><span className="font-medium">Gender:</span> {displayValue(doctor.gender)}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>Available schedules</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {schedules.length ? schedules.map((schedule, index) => (
              <div key={String(schedule.id ?? index)} className="rounded-md border p-3 text-sm">
                <p className="flex items-center gap-2 font-medium"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(relationValue(schedule, ["date", "scheduleDate"]))}</p>
                <p className="mt-2 flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" />{displayValue(relationValue(schedule, ["startTime", "start"]))} - {displayValue(relationValue(schedule, ["endTime", "end"]))}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No schedules are currently available.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Patient reviews ({reviews.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviews.length ? reviews.map((review, index) => (
              <article key={String(review.id ?? index)} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{displayValue(relationValue(review, ["patientName", "patientId"]), "Patient")}</p>
                  <span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{displayValue(relationValue(review, ["rating", "score"]))}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{displayValue(relationValue(review, ["comment", "review"]), "No written comment")}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </article>
            )) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DoctorProfile;