"use server";

import { httpClient } from "@/lib/axios/httpClient";

export interface IBookAppointmentPayload {
  doctorId: string;
  scheduleId: string;
}

export interface AppointmentRecord {
  id: string;
  status?: string;
  paymentStatus?: string;
  videoCallingId?: string;
  createdAt?: string;
  doctor?: {
    id?: string;
    name?: string;
    profilePhoto?: string | null;
    designation?: string | null;
    appointmentFee?: number | null;
  };
  patient?: { name?: string; email?: string };
  schedule?: { id?: string; startDateTime?: string; endDateTime?: string };
  payment?: { id?: string; status?: string; amount?: number; invoiceUrl?: string | null } | null;
}

export interface BookingResult {
  appointment: AppointmentRecord;
  payment?: { id?: string; status?: string; amount?: number };
  paymentUrl?: string | null;
}

export const bookAppointment = async (payload: IBookAppointmentPayload) =>
  httpClient.post<BookingResult>("/appointment/book-appointment", payload);

export const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload) =>
  httpClient.post<BookingResult>("/appointment/book/pay-later", payload);

export const getMyAppointments = async () =>
  httpClient.get<AppointmentRecord[]>("/appointment/my-appointments");

export const initiatePayment = async (appointmentId: string) =>
  httpClient.post<{ paymentUrl?: string | null }>(`/appointment/initiate-payment/${appointmentId}`);
