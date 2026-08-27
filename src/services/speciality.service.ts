"use server";

import { httpClient } from "@/lib/axios/httpClient";

export interface ISpeciality {
  id: string;
  title: string;
  icon?: string;
}

export const getAllSpecialities = async () => {
  const response = await httpClient.get<ISpeciality[]>("/speciality");
  return response;
};