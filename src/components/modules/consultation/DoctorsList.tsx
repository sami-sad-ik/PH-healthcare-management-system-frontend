"use client";

import DataTableFilters from "@/components/shared/table/DataTableFilters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useManagementTable } from "@/hooks/useManagementTable";
import { getDoctors } from "@/services/doctor.service";
import { getAllSpecialities } from "@/services/speciality.service";
import { IDoctor } from "@/types/doctor.types";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, LoaderCircle, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DoctorCard = ({ doctor }: { doctor: IDoctor }) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewDetails = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(`/consultation/doctor/${doctor.id}`);
  };

  return (
    <Card className="h-full border-0 shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-primary/10">
            <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{doctor.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0"><h2 className="truncate text-lg font-semibold">{doctor.name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{doctor.designation || "Medical professional"}</p><div className="mt-2 flex items-center gap-1 text-sm font-medium"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{(doctor.averageRating ?? 0).toFixed(1)}</div></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">{doctor.specialities?.length ? doctor.specialities.map(({ speciality }) => <Badge key={speciality.id} variant="secondary">{speciality.title}</Badge>) : <span className="text-sm text-muted-foreground">Speciality not provided</span>}</div>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm"><div><dt className="text-muted-foreground">Experience</dt><dd className="mt-1 font-medium">{doctor.experience ?? 0} years</dd></div><div><dt className="text-muted-foreground">Consultation fee</dt><dd className="mt-1 font-medium">{doctor.appointmentFee ?? 0}</dd></div><div className="col-span-2 flex items-center gap-2 text-muted-foreground"><BriefcaseBusiness className="h-4 w-4" /><span className="truncate">{doctor.currentWorkingPlace || "Independent practice"}</span></div></dl>
      </CardContent>
      <CardFooter className="p-5 pt-0"><Button className="w-full" disabled={isNavigating} onClick={handleViewDetails} aria-label={`View details for ${doctor.name}`}>{isNavigating ? <><LoaderCircle className="animate-spin" />Loading doctor...</> : "View doctor details"}</Button></CardFooter>
    </Card>
  );
};

const DoctorsList = ({ queryString }: { queryString: string }) => {
  const { data: specialityResponse } = useQuery({ queryKey: ["specialities"], queryFn: getAllSpecialities, staleTime: 1000 * 60 * 60 });
  const specialities = Array.isArray(specialityResponse?.data) ? specialityResponse.data : [];
  const table = useManagementTable<IDoctor>({ queryKey: ["doctors"], queryFn: getDoctors, initialQueryString: queryString });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-medium text-primary">Find your care team</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Consult a doctor</h1><p className="mt-2 max-w-xl text-muted-foreground">Browse qualified doctors and find the right specialist for your next consultation.</p></div><div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"><label className="relative min-w-0 flex-1 sm:min-w-72"><Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" /><input value={table.searchTerm} onChange={(event) => table.handleSearchChange(event.target.value)} placeholder="Search doctors" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /></label><DataTableFilters value={table.filterValues} specialities={specialities} onChange={table.handleFilterChange} disabled={table.isLoading || table.isPending} /></div></div>
      {table.isError ? <p className="py-16 text-center text-destructive">Unable to load doctors. Please try again.</p> : table.isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-80" />)}</div> : table.data.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{table.data.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}</div> : <p className="py-16 text-center text-muted-foreground">No doctors match your search.</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5"><label className="flex items-center gap-2 text-sm text-muted-foreground">Doctors per page<select value={table.pageSize} onChange={(event) => table.handlePageSizeChange(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-foreground"><option value="6">6</option><option value="12">12</option><option value="24">24</option></select></label><nav aria-label="Doctors pagination" className="flex items-center gap-1"><Button variant="outline" size="sm" disabled={table.currentPage === 1 || table.isPending} onClick={() => table.handlePageChange(table.currentPage - 1)}><ChevronLeft />Previous</Button>{table.pageItems.map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span> : <Button key={item} size="sm" variant={item === table.currentPage ? "default" : "outline"} aria-current={item === table.currentPage ? "page" : undefined} onClick={() => table.handlePageChange(item)}>{item}</Button>)}<Button variant="outline" size="sm" disabled={table.currentPage === table.totalPages || table.isPending} onClick={() => table.handlePageChange(table.currentPage + 1)}>Next<ChevronRight /></Button></nav></div>
    </main>
  );
};

export default DoctorsList;
