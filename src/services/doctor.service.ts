"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";
import { ICreateDoctorPayload } from "@/zod/doctor.validation";

export const getDoctors = async (queryString: string) => {
  const queryParams = new URLSearchParams(queryString);
  const normalizedQueryString = queryParams.toString();
  const doctors = await httpClient.get<IDoctor[]>(
    normalizedQueryString ? `/doctor?${normalizedQueryString}` : "/doctor",
  );
  return doctors;
};

export const createDoctor = async (payload: ICreateDoctorPayload) => {
  return httpClient.post<IDoctor>("/user/create-doctor", payload);
};
