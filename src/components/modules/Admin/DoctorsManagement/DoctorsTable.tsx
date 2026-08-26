"use client";

import DataTable from "@/components/shared/table/DataTable";
import { getDoctors } from "@/services/doctor.service";
import { IDoctor } from "@/types/doctor.types";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { doctorColumns } from "./doctorsColumns";

const DoctorsTable = ({ queryString }: { queryString: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { data: doctorDataResponse, isLoading, isFetching } = useQuery({
    queryKey: ["doctors", queryString],
    queryFn: () => getDoctors(queryString),
  });

  const { data: doctors } = doctorDataResponse! || {};

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortOrder === "desc" }]
    : [];

  const handleSortingChange = (nextSorting: SortingState) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSort = nextSorting[0];

    if (nextSort) {
      params.set("sortBy", nextSort.id);
      params.set("sortOrder", nextSort.desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const onViewDoctor = (doctor: IDoctor) => {
    console.log("View doctor:", doctor);
  };
  const onEditDoctor = (doctor: IDoctor) => {
    console.log("Edit doctor:", doctor);
  };
  const onDeleteDoctor = (doctor: IDoctor) => {
    console.log("Delete doctor:", doctor);
  };

  return (
    <DataTable
      data={doctors ?? []}
      columns={doctorColumns}
      emptyMessage="No doctors found."
      isLoading={isLoading || isFetching || isPending}
      sorting={{ state: sorting, onSortingChange: handleSortingChange }}
      actions={{
        onView: onViewDoctor,
        onEdit: onEditDoctor,
        onDelete: onDeleteDoctor,
      }}
    />
  );
};

export default DoctorsTable;
