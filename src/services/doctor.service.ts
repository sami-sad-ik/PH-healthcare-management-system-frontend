"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";

export const getDoctors = async (queryString: string) => {
  const doctors = await httpClient.get<IDoctor[]>(
    queryString ? `/doctor?${queryString}` : "/doctor",
  );
  return doctors;
};
