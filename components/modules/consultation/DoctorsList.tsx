"use client";

import { getDoctors } from "@/app/(commonLayout)/consultation/_actions";
import { useQuery } from "@tanstack/react-query";

const DoctorsList = () => {
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
  });

  console.log(data);
  return (
    <div>
      <h1>Doctors List</h1>
    </div>
  );
};

export default DoctorsList;
