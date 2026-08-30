"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICreateSchedulePayload,
  ISchedule,
  IUpdateSchedulePayload,
} from "@/types/schedule.types";

export const getSchedules = async (queryString: string) => {
  const queryParams = new URLSearchParams(queryString);
  const normalizedQueryString = queryParams.toString();

  return httpClient.get<ISchedule[]>(
    normalizedQueryString ? `/schedule?${normalizedQueryString}` : "/schedule",
  );
};


export const getScheduleById = async (id: string) => {
  return httpClient.get<ISchedule>(`/schedule/${id}`);
};

export const createSchedule = async (payload: ICreateSchedulePayload) => {
  return httpClient.post<ISchedule>("/schedule", payload);
};

export const updateSchedule = async (
  id: string,
  payload: IUpdateSchedulePayload,
) => {
  return httpClient.patch<ISchedule>(`/schedule/${id}`, payload);
};

export const deleteSchedule = async (id: string) => {
  return httpClient.delete(`/schedule/${id}`);
};
