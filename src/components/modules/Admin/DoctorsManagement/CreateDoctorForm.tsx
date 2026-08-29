"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createDoctor, updateDoctor } from "@/services/doctor.service";
import {
  createDoctorZodSchema,
  ICreateDoctorPayload,
  IUpdateDoctorPayload,
  updateDoctorZodSchema,
} from "@/zod/doctor.validation";
import { IDoctor } from "@/types/doctor.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

interface CreateDoctorFormProps {
  specialities: Array<{ id: string; title: string }>;
  onSuccess: () => void;
  doctor?: IDoctor;
}

type DoctorFormValues = {
  password: string;
  name: string;
  email: string;
  contactNumber: string;
//   profilePhoto: string;
  address: string;
  registrationNumber: string;
  qualification: string;
  experience: string;
  gender: "" | "MALE" | "FEMALE";
  appointmentFee: string;
  currentWorkingPlace: string;
  designation: string;
  specialities: string[];
};

const initialValues: DoctorFormValues = {
  password: "",
  name: "",
  email: "",
  contactNumber: "",
//   profilePhoto: "",
  address: "",
  registrationNumber: "",
  qualification: "",
  experience: "",
  gender: "",
  appointmentFee: "",
  currentWorkingPlace: "",
  designation: "",
  specialities: [],
};

const getInitialValues = (doctor?: IDoctor): DoctorFormValues => ({
  ...initialValues,
  name: doctor?.name ?? "",
  email: doctor?.email ?? "",
  contactNumber: doctor?.contactNumber ?? "",
  address: doctor?.address ?? "",
  registrationNumber: doctor?.registrationNumber ?? "",
  qualification: doctor?.qualification ?? "",
  experience: doctor?.experience?.toString() ?? "",
  gender: doctor?.gender ?? "",
  appointmentFee: doctor?.appointmentFee?.toString() ?? "",
  currentWorkingPlace: doctor?.currentWorkingPlace ?? "",
  designation: doctor?.designation ?? "",
  specialities:
    doctor?.specialities?.map((item) => item.speciality.id) ?? [],
});

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;
    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;
      if (data && typeof data === "object" && "message" in data) {
        return String(data.message);
      }
    }
  }
  return error instanceof Error ? error.message : "Unable to create doctor.";
};

const CreateDoctorForm = ({
  specialities,
  onSuccess,
  doctor,
}: CreateDoctorFormProps) => {
  const isEdit = Boolean(doctor);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [specialityError, setSpecialityError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: ICreateDoctorPayload | IUpdateDoctorPayload) =>
      doctor ? updateDoctor(String(doctor.id), payload as IUpdateDoctorPayload) : createDoctor(payload as ICreateDoctorPayload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
      onSuccess();
    },
  });

  const form = useForm({
    defaultValues: getInitialValues(doctor),
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSpecialityError(null);

      const payload = isEdit
        ? {
          name: value.name,
          contactNumber: value.contactNumber,
          address: value.address || undefined,
          registrationNumber: value.registrationNumber,
          qualification: value.qualification,
          experience: value.experience ? Number(value.experience) : undefined,
          gender: value.gender,
          appointmentFee: Number(value.appointmentFee),
          currentWorkingPlace: value.currentWorkingPlace,
          designation: value.designation,
          specialities: value.specialities,
        }
        : {
            password: value.password,
            doctor: {
              name: value.name,
              email: value.email,
              contactNumber: value.contactNumber,
              address: value.address || undefined,
              registrationNumber: value.registrationNumber,
              qualification: value.qualification,
              experience: value.experience ? Number(value.experience) : undefined,
              gender: value.gender,
              appointmentFee: Number(value.appointmentFee),
              currentWorkingPlace: value.currentWorkingPlace,
              designation: value.designation,
            },
            specialities: value.specialities,
          };
      const result = isEdit
        ? updateDoctorZodSchema.safeParse(payload)
        : createDoctorZodSchema.safeParse(payload);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue?.path[0] === "specialities") {
          setSpecialityError(firstIssue.message);
        } else {
          setServerError(
            firstIssue?.message ?? "Please check the form fields.",
          );
        }
        return;
      }

      try {
        await mutateAsync(result.data);
      } catch (error) {
        setServerError(getErrorMessage(error));
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <AppField field={field} label="Name" placeholder="Doctor name" />
          )}
        </form.Field>
        {!isEdit && <form.Field name="email">
          {(field) => (
            <AppField
              field={field}
              label="Email"
              type="email"
              placeholder="doctor@example.com"
            />
          )}
        </form.Field>}
        {!isEdit && <form.Field name="password">
          {(field) => (
            <AppField
              field={field}
              label="Temporary password"
              type="password"
              placeholder="At least 6 characters"
            />
          )}
        </form.Field>}
        <form.Field name="contactNumber">
          {(field) => (
            <AppField
              field={field}
              label="Contact number"
              placeholder="01XXXXXXXXX"
            />
          )}
        </form.Field>
        {/* <form.Field name="profilePhoto">
          {(field) => <AppField field={field} label="Profile photo URL" placeholder="https://..." />}
        </form.Field> */}
        <form.Field name="registrationNumber">
          {(field) => (
            <AppField
              field={field}
              label="Registration number"
              placeholder="BMDC registration number"
            />
          )}
        </form.Field>
        <form.Field name="qualification">
          {(field) => (
            <AppField
              field={field}
              label="Qualification"
              placeholder="MBBS, FCPS"
            />
          )}
        </form.Field>
        <form.Field name="designation">
          {(field) => (
            <AppField
              field={field}
              label="Designation"
              placeholder="Consultant"
            />
          )}
        </form.Field>
        <form.Field name="currentWorkingPlace">
          {(field) => (
            <AppField
              field={field}
              label="Current working place"
              placeholder="Hospital or clinic"
            />
          )}
        </form.Field>
        <form.Field name="experience">
          {(field) => (
            <AppField
              field={field}
              label="Experience (years)"
              type="number"
              placeholder="0"
            />
          )}
        </form.Field>
        <form.Field name="appointmentFee">
          {(field) => (
            <AppField
              field={field}
              label="Appointment fee"
              type="number"
              placeholder="0"
            />
          )}
        </form.Field>
        <form.Field name="gender">
          {(field) => (
            <div className="space-y-2">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(
                    event.target.value as DoctorFormValues["gender"],
                  )
                }
                onBlur={field.handleBlur}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          )}
        </form.Field>
        <form.Field name="address">
          {(field) => (
            <AppField
              field={field}
              label="Address"
              placeholder="Doctor address (optional)"
            />
          )}
        </form.Field>
      </div>

      <form.Field name="specialities">
        {(field) => (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Specialities</legend>
            <div className="grid max-h-32 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
              {specialities.map((speciality) => (
                <label
                  key={speciality.id}
                  className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.state.value.includes(speciality.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...field.state.value, speciality.id]
                        : field.state.value.filter(
                            (id) => id !== speciality.id,
                          );
                      field.handleChange(next);
                      setSpecialityError(null);
                    }}
                  />
                  {speciality.title}
                </label>
              ))}
              {!specialities.length && (
                <span className="text-sm text-muted-foreground">
                  No specialities found.
                </span>
              )}
            </div>
            {specialityError && (
              <p className="text-sm text-destructive">{specialityError}</p>
            )}
          </fieldset>
        )}
      </form.Field>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onSuccess}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <AppSubmitButton
              isPending={isSubmitting || isPending}
              pendingLabel={isEdit ? "Updating doctor..." : "Creating doctor..."}
              className="w-auto">
              {isEdit ? "Update doctor" : "Create doctor"}
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateDoctorForm;
