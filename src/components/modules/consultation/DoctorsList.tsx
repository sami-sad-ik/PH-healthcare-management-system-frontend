/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getDoctors } from "@/services/doctor.service";
import { useQuery } from "@tanstack/react-query";

const DoctorsList = (queryString: string) => {
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(queryString),
  });

  // console.log(data);
  return (
    <div>
      {data.data.map((doctor: any) => (
        <div key={doctor.id}>{doctor.name}</div>
      ))}
    </div>
  );
};

export default DoctorsList;
