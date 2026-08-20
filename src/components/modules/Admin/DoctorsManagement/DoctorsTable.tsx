"use client";

import DataTable from "@/components/shared/table/DataTable";
import { getDoctors } from "@/services/doctor.service";
import { IDoctor } from "@/types/doctor.types";
import { useQuery } from "@tanstack/react-query";

const DoctorsTable = () => {
  const doctorColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "experience", header: "Experience" },
  ];

  const { data: doctorDataResponse, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
  });

  const { data: doctors } = doctorDataResponse! || {};

  console.log(doctors);

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
      data={doctors}
      columns={doctorColumns}
      emptyMessage="No doctors found."
      isLoading={isLoading}
      actions={{
        onView: onViewDoctor,
        onEdit: onEditDoctor,
        onDelete: onDeleteDoctor,
      }}
    />
  );
};

export default DoctorsTable;
