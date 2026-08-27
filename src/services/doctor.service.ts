"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";

export const getDoctors = async (queryString: string) => {
  const queryParams = new URLSearchParams(queryString);
  const searchTerm = queryParams.get("searchterm");

  if (searchTerm !== null) {
    queryParams.delete("searchterm");
    queryParams.set("searchTerm", searchTerm);
  }

  const normalizedQueryString = queryParams.toString();
  const doctors = await httpClient.get<IDoctor[]>(
    normalizedQueryString ? `/doctor?${normalizedQueryString}` : "/doctor",
  );
  return doctors;
};
