"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctor } from "@/types/doctor.types";
import type { DoctorDetailsData } from "@/components/modules/Admin/DoctorsManagement/DoctorDetails";
import {
  ICreateDoctorPayload,
  IUpdateDoctorPayload,
} from "@/zod/doctor.validation";

export const getDoctors = async (queryString: string) => {
  const queryParams = new URLSearchParams(queryString);
  const normalizedQueryString = queryParams.toString();
  const doctors = await httpClient.get<IDoctor[]>(
    normalizedQueryString ? `/doctor?${normalizedQueryString}` : "/doctor",
  );
  return doctors;
};

export const getDoctorById = async (id: string) => {
  return httpClient.get<DoctorDetailsData>(`/doctor/${id}`);
};

export const createDoctor = async (payload: ICreateDoctorPayload) => {
  return httpClient.post<IDoctor>("/user/create-doctor", payload);
};

export const updateDoctor = async (
  id: string,
  payload: IUpdateDoctorPayload,
) => {
  return httpClient.patch<IDoctor>(`/doctor/${id}`, payload);
};

export const deleteDoctor = async (id: string) => {
  return httpClient.delete(`/doctor/${id}`);
};
