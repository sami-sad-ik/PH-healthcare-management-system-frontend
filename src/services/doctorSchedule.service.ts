"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ISchedule } from "@/types/schedule.types";

export interface IDoctorSchedule {
  id: string;
  doctorId: string;
  scheduleId: string;
  isBooked?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  schedule?: ISchedule;
  doctor?: {
    id?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  };
  bookedBy?: {
    id?: string;
    name?: string;
    user?: {
      id?: string;
      name?: string;
    };
  } | null;
  patient?: {
    id?: string;
    name?: string;
    user?: {
      id?: string;
      name?: string;
    };
  } | null;
  appointment?: {
    id?: string;
    patient?: {
      id?: string;
      name?: string;
      user?: {
        id?: string;
        name?: string;
      };
    } | null;
  } | null;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export const getMyDoctorSchedules = async (queryString: string) => {
  const queryParams = new URLSearchParams(queryString);
  const normalizedQueryString = queryParams.toString();

  return httpClient.get<IDoctorSchedule[]>(
    normalizedQueryString
      ? `/doctor-schedule/my-schedule?${normalizedQueryString}`
      : "/doctor-schedule/my-schedule",
  );
};

export const bookDoctorSchedules = async (scheduleIds: string[]) => {
  return httpClient.post<{ count: number }>("/doctor-schedule", {
    scheduleIds,
  });
};

export const bookDoctorSchedule = async (scheduleId: string) => {
  return bookDoctorSchedules([scheduleId]);
};

export const deleteDoctorSchedule = async (scheduleId: string) => {
  return httpClient.delete(`/doctor-schedule/${scheduleId}`);
};
