"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSchedule, updateSchedule } from "@/services/schedule.service";
import { ISchedule } from "@/types/schedule.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

interface ScheduleFormValues {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface CreateScheduleFormProps {
  schedule?: ISchedule;
  onSuccess: () => void;
}

const getInputDateValue = (value?: string | Date) => {
  if (!value) return "";
  return format(new Date(value), "yyyy-MM-dd");
};

const getInputTimeValue = (value?: string | Date) => {
  if (!value) return "09:00";
  return format(new Date(value), "HH:mm");
};

const getInitialValues = (schedule?: ISchedule): ScheduleFormValues => ({
  startDate: getInputDateValue(schedule?.startDateTime ?? ""),
  endDate: getInputDateValue(schedule?.endDateTime ?? ""),
  startTime: getInputTimeValue(schedule?.startDateTime ?? ""),
  endTime: getInputTimeValue(schedule?.endDateTime ?? ""),
});

const CreateScheduleForm = ({ schedule, onSuccess }: CreateScheduleFormProps) => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ScheduleFormValues>(() =>
    getInitialValues(schedule),
  );
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(schedule);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (isEditMode && schedule) {
        return updateSchedule(schedule.id, values);
      }

      return createSchedule(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedules"] });
      onSuccess();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save schedule.",
      );
    },
  });

  const handleChange = (
    field: keyof ScheduleFormValues,
    value: string,
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.startDate || !values.endDate || !values.startTime || !values.endTime) {
      setError("All fields are required.");
      return;
    }

    if (new Date(`${values.startDate}T${values.startTime}`) >= new Date(`${values.endDate}T${values.endTime}`)) {
      setError("End date/time must be after the start date/time.");
      return;
    }

    mutate();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            type="date"
            value={values.startDate}
            onChange={(event) => handleChange("startDate", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            type="date"
            value={values.endDate}
            onChange={(event) => handleChange("endDate", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            type="time"
            value={values.startTime}
            onChange={(event) => handleChange("startTime", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End time</Label>
          <Input
            id="endTime"
            type="time"
            value={values.endTime}
            onChange={(event) => handleChange("endTime", event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save changes" : "Create schedule"}
        </Button>
      </div>
    </form>
  );
};

export default CreateScheduleForm;
