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
import { deleteDoctorSchedule, getMyDoctorSchedules, IDoctorSchedule, bookDoctorSchedule } from "@/services/doctorSchedule.service";
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

const DoctorScheduleTables = ({ queryString }: { queryString: string }) => {
  const queryClient = useQueryClient();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

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
    queryKey: ["availableDoctorSchedules"],
    queryFn: () => getSchedules(""),
    staleTime: 1000 * 60 * 60,
  });

  const allSchedules = useMemo(() => {
    if (Array.isArray(scheduleResponse)) return scheduleResponse;
    return Array.isArray(scheduleResponse?.data) ? scheduleResponse.data : [];
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
      return startDate >= now && !bookedScheduleIds.has(schedule.id);
    });
  }, [allSchedules, bookedScheduleIds]);

  const { mutate: confirmBooking, isPending: isBooking } = useMutation({
    mutationFn: (scheduleId: string) => bookDoctorSchedule(scheduleId),
    onSuccess: async () => {
      setBookingError(null);
      setIsBookingOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["myDoctorSchedules"] });
      await queryClient.invalidateQueries({
        queryKey: ["availableDoctorSchedules"],
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
        queryKey: ["availableDoctorSchedules"],
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setBookingError(error.message);
      }
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
                ? formatScheduleRange(schedule.startDateTime, schedule.endDateTime)
                : "Slot scheduled"}
            </p>
            {schedule && (
              <p className="text-sm text-muted-foreground">
                {formatListDate(start)} • {formatListTime(start)} - {formatListTime(end)}
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
          <h1 className="text-2xl font-semibold tracking-tight">My schedules</h1>
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
                        {formatListDate(schedule.startDateTime)} • {formatListTime(schedule.startDateTime)} - {formatListTime(schedule.endDateTime)}
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
          onDelete: (schedule) =>
            confirmCancelBooking(
              schedule.scheduleId ?? schedule.id,
            ),
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
        <p className="text-sm text-muted-foreground">Removing this schedule...</p>
      )}
    </div>
  );
};

export default DoctorScheduleTables;
