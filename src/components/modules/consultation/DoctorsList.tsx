/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getDoctors } from "@/src/app/(commonLayout)/consultation/_actions";
import { useQuery } from "@tanstack/react-query";

const DoctorsList = () => {
  const { data } = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ["doctors"],
    queryFn: async () =>
      (await getDoctors()) as { data: { id: string; name: string }[] },
  });

  console.log(data);
  return (
    <div>
      {data?.data.map((doctor) => (
        <div key={doctor.id}>{doctor.name}</div>
      ))}
    </div>
  );
};

export default DoctorsList;
