export interface ISchedule {
  id: string;
  startDateTime: string | Date;
  endDateTime: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  doctorSchedules?: Array<{
    id: string;
    doctorId: string;
    scheduleId: string;
    isBooked: boolean;
  }>;
  appointments?: Array<Record<string, unknown>>;
}

export interface ICreateSchedulePayload {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface IUpdateSchedulePayload {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}
