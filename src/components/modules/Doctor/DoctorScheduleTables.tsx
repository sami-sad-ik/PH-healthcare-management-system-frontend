"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useManagementTable } from "@/hooks/useManagementTable";
import {
  bookDoctorSchedule,
  deleteDoctorSchedule,
  getMyDoctorSchedules,
  IDoctorSchedule,
} from "@/services/doctorSchedule.service";
import { getSchedules } from "@/services/schedule.service";
import { ISchedule } from "@/types/schedule.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

const formatScheduleRange = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${format(startDate, "MMM dd, yyyy")} • ${format(startDate, "hh:mm a")} - ${format(endDate, "hh:mm a")}`;
};

const formatListDate = (date: string | Date) =>
  format(new Date(date), "EEE, MMM dd, yyyy");

const formatListTime = (date: string | Date) =>
  format(new Date(date), "hh:mm a");

const getBookedPersonName = (schedule: IDoctorSchedule | null) => {
  if (!schedule) return "Not assigned";

  const candidateNames = [
    schedule.patient?.name,
    schedule.patient?.user?.name,
    schedule.appointment?.patient?.name,
    schedule.appointment?.patient?.user?.name,
    schedule.bookedBy?.name,
    schedule.bookedBy?.user?.name,
    schedule.user?.name,
  ];

  const foundName = candidateNames.find((name) => {
    return typeof name === "string" && name.trim().length > 0;
  });

  return foundName ? foundName : "Not assigned";
};

const DoctorScheduleTables = ({ queryString }: { queryString: string }) => {
  const queryClient = useQueryClient();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] =
    useState<IDoctorSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] =
    useState<IDoctorSchedule | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: doctorSchedules,
    isLoading,
    isFetching,
    isError,
    isPending,
    searchTerm,
    sorting,
    currentPage,
    pageSize,
    totalPages,
    pageItems,
    handleSortingChange,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
  } = useManagementTable<IDoctorSchedule>({
    queryKey: ["myDoctorSchedules"],
    queryFn: getMyDoctorSchedules,
    initialQueryString: queryString,
  });

  const { data: scheduleResponse } = useQuery({
    queryKey: ["availableSchedulesForBooking"],
    queryFn: () => getSchedules(""),
    staleTime: 1000 * 60 * 60,
  });


  const allSchedules = useMemo(() => {
    if (!scheduleResponse) return [];

    const candidate = (scheduleResponse as { data?: unknown })?.data ?? scheduleResponse;

    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = candidate as { data?: unknown; results?: unknown };
      if (Array.isArray(nested.data)) return nested.data;
      if (Array.isArray(nested.results)) return nested.results;
    }

    return [];
  }, [scheduleResponse]);

  const bookedScheduleIds = useMemo(() => {
    const ids = new Set<string>();

    (doctorSchedules ?? []).forEach((item) => {
      const scheduleId = item.scheduleId ?? item.schedule?.id;
      if (scheduleId) ids.add(scheduleId);
    });

    return ids;
  }, [doctorSchedules]);

  const availableToBook = useMemo(() => {
    const now = new Date();

    return (allSchedules ?? []).filter((schedule: ISchedule) => {
      const startDate = new Date(schedule.startDateTime);
      return !Number.isNaN(startDate.getTime()) && startDate >= now && !bookedScheduleIds.has(schedule.id);
    });
  }, [allSchedules, bookedScheduleIds]);

  const onViewSchedule = (schedule: IDoctorSchedule) => {
    setViewingSchedule(schedule);
  };

  const onDeleteSchedule = (schedule: IDoctorSchedule) => {
    setDeleteError(null);
    setDeletingSchedule(schedule);
  };

  const { mutate: confirmBooking, isPending: isBooking } = useMutation({
    mutationFn: (scheduleId: string) => bookDoctorSchedule(scheduleId),
    onSuccess: async () => {
      setBookingError(null);
      setIsBookingOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["myDoctorSchedules"] });
      await queryClient.invalidateQueries({
        queryKey: ["availableSchedulesForBooking"],
      });
    },
    onError: (error) => {
      setBookingError(
        error instanceof Error ? error.message : "Unable to book this schedule.",
      );
    },
  });

  const { mutate: confirmCancelBooking, isPending: isCanceling } = useMutation({
    mutationFn: (scheduleId: string) => deleteDoctorSchedule(scheduleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myDoctorSchedules"] });
      await queryClient.invalidateQueries({
        queryKey: ["availableSchedulesForBooking"],
      });
      setDeletingSchedule(null);
      setDeleteError(null);
    },
    onError: (error) => {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to remove this schedule.",
      );
    },
  });

  const columns: ColumnDef<IDoctorSchedule>[] = [
    {
      accessorKey: "schedule.startDateTime",
      header: "Schedule",
      cell: ({ row }) => {
        const schedule = row.original.schedule ?? null;
        const start = schedule?.startDateTime ?? row.original.scheduleId;
        const end = schedule?.endDateTime ?? row.original.scheduleId;

        return (
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {schedule
                ? formatScheduleRange(
                    schedule.startDateTime,
                    schedule.endDateTime,
                  )
                : "Slot scheduled"}
            </p>
            {schedule && (
              <p className="text-sm text-muted-foreground">
                {formatListDate(start)} • {formatListTime(start)} -{" "}
                {formatListTime(end)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isBooked",
      header: "Status",
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {row.original.isBooked === false ? "Pending" : "Booked"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Booked On",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt
            ? format(new Date(row.original.createdAt), "MMM dd, yyyy")
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My schedules
          </h1>
          <p className="text-sm text-muted-foreground">
            View your booked availability and add more future slots.
          </p>
        </div>

        <Dialog
          open={isBookingOpen}
          onOpenChange={(open, details) => {
            if (open || details.reason === "close-press") {
              setIsBookingOpen(open);
              setBookingError(null);
            }
          }}>
          <DialogTrigger
            render={
              <Button type="button">
                <Plus className="mr-2 h-4 w-4" />
                Book schedule
              </Button>
            }
          />
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Book available schedule</DialogTitle>
              <DialogDescription>
                Select a future time slot to add to your schedule list.
              </DialogDescription>
            </DialogHeader>

            {bookingError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {bookingError}
              </p>
            )}

            {availableToBook.length ? (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {availableToBook.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {formatScheduleRange(
                          schedule.startDateTime,
                          schedule.endDateTime,
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatListDate(schedule.startDateTime)} •{" "}
                        {formatListTime(schedule.startDateTime)} -{" "}
                        {formatListTime(schedule.endDateTime)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => confirmBooking(schedule.id)}
                      disabled={isBooking}>
                      {isBooking ? "Booking..." : "Book slot"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No future schedule slots are currently available to book.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(viewingSchedule)}
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press") {
            setViewingSchedule(null);
          }
        }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule details</DialogTitle>
            <DialogDescription>
              Review the details for this booked availability slot.
            </DialogDescription>
          </DialogHeader>

          {viewingSchedule && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Schedule</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {viewingSchedule.schedule
                    ? formatScheduleRange(
                        viewingSchedule.schedule.startDateTime,
                        viewingSchedule.schedule.endDateTime,
                      )
                    : "Booked schedule"}
                </h3>
                {viewingSchedule.schedule && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatListDate(viewingSchedule.schedule.startDateTime)} •{" "}
                    {formatListTime(viewingSchedule.schedule.startDateTime)} -{" "}
                    {formatListTime(viewingSchedule.schedule.endDateTime)}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="mt-1 font-medium">
                    {viewingSchedule.isBooked === false ? "Pending" : "Booked"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Booked on</p>
                  <p className="mt-1 font-medium">
                    {viewingSchedule.createdAt
                      ? format(
                          new Date(viewingSchedule.createdAt),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Booked by</p>
                <p className="mt-1 font-medium">
                  {getBookedPersonName(viewingSchedule)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingSchedule)}
        disablePointerDismissal={isCanceling}
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press" && !isCanceling) {
            setDeletingSchedule(null);
            setDeleteError(null);
          }
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove schedule</DialogTitle>
            <DialogDescription>
              This will cancel your booking for the selected schedule slot.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isCanceling}
              onClick={() => {
                setDeletingSchedule(null);
                setDeleteError(null);
              }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!deletingSchedule || isCanceling}
              onClick={() => {
                if (deletingSchedule) {
                  confirmCancelBooking(
                    deletingSchedule.scheduleId ?? deletingSchedule.id,
                  );
                }
              }}>
              {isCanceling ? "Removing..." : "Remove schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable
        data={doctorSchedules ?? []}
        columns={columns}
        emptyMessage={
          isError
            ? "Unable to load your schedules. Please try again."
            : "No booked schedules found."
        }
        isLoading={isLoading || isFetching || isPending}
        search={{
          value: searchTerm,
          onChange: handleSearchChange,
          placeholder: "Search schedules...",
        }}
        sorting={{ state: sorting, onSortingChange: handleSortingChange }}
        actions={{
          onView: onViewSchedule,
          onDelete: onDeleteSchedule,
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <select
            value={pageSize}
            disabled={isPending}
            onChange={(event) => handlePageSizeChange(event.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {[1, 5, 10, 20, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <nav
          aria-label="Doctor schedules pagination"
          className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isPending}
            onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </Button>

          {pageItems.map((pageItem, index) =>
            pageItem === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageItem}
                variant={pageItem === currentPage ? "default" : "outline"}
                size="sm"
                disabled={isPending}
                onClick={() => handlePageChange(pageItem)}>
                {pageItem}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </Button>
        </nav>
      </div>

      {isCanceling && (
        <p className="text-sm text-muted-foreground">
          Removing this schedule...
        </p>
      )}
    </div>
  );
};

export default DoctorScheduleTables;
