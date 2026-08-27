"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";

export const getDoctors = async (queryString: string) => {
  const queryParams = new URLSearchParams(queryString);
  const normalizedQueryString = queryParams.toString();
  const doctors = await httpClient.get<IDoctor[]>(
    normalizedQueryString ? `/doctor?${normalizedQueryString}` : "/doctor",
  );
  return doctors;
};
