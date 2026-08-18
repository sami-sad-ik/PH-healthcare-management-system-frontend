"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";

export const getDoctors = async () => {
  const doctors = await httpClient.get<IDoctor[]>("/doctor");
  return doctors;
};
