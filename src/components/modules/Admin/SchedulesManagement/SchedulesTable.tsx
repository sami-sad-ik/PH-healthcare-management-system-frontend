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
import { deleteSchedule, getSchedules } from "@/services/schedule.service";
import { ISchedule } from "@/types/schedule.types";
import { useManagementTable } from "@/hooks/useManagementTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { scheduleColumns } from "./schedulesColumns";
import CreateScheduleForm from "./CreateScheduleForm";
import ScheduleDetails from "./ScheduleDetails";

const SchedulesTable = ({ queryString }: { queryString: string }) => {
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<ISchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ISchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<ISchedule | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: schedules,
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
  } = useManagementTable<ISchedule>({
    queryKey: ["schedules"],
    queryFn: getSchedules,
    initialQueryString: queryString,
  });

  const onViewSchedule = (schedule: ISchedule) => {
    setViewingSchedule(schedule);
  };

  const onEditSchedule = (schedule: ISchedule) => {
    setEditingSchedule(schedule);
  };

  const onDeleteSchedule = (schedule: ISchedule) => {
    setDeleteError(null);
    setDeletingSchedule(schedule);
  };

  const { mutate: confirmDeleteSchedule, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setDeletingSchedule(null);
    },
    onError: (error) => {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete schedule.",
      );
    },
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog
          open={isCreateScheduleOpen}
          disablePointerDismissal
          onOpenChange={(open, details) => {
            if (open || details.reason === "close-press") {
              setIsCreateScheduleOpen(open);
            }
          }}>
          <DialogTrigger
            render={
              <Button type="button">
                <Plus />
                Create schedule
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create schedule</DialogTitle>
              <DialogDescription>
                Add availability slots across a date range.
              </DialogDescription>
            </DialogHeader>
            <CreateScheduleForm
              onSuccess={() => setIsCreateScheduleOpen(false)}
            />
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Schedule details</DialogTitle>
            <DialogDescription>
              Review the schedule slot details and capacity information.
            </DialogDescription>
          </DialogHeader>
          {viewingSchedule && <ScheduleDetails scheduleId={viewingSchedule.id} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingSchedule)}
        disablePointerDismissal
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press") {
            setEditingSchedule(null);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit schedule</DialogTitle>
            <DialogDescription>
              Update the schedule date and time range.
            </DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <CreateScheduleForm
              key={editingSchedule.id}
              schedule={editingSchedule}
              onSuccess={() => setEditingSchedule(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingSchedule)}
        disablePointerDismissal={isDeleting}
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press" && !isDeleting) {
            setDeletingSchedule(null);
            setDeleteError(null);
          }
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete schedule</DialogTitle>
            <DialogDescription>
              This will remove the selected schedule slot from the list.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="mb-4 text-sm text-destructive">{deleteError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                setDeletingSchedule(null);
                setDeleteError(null);
              }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!deletingSchedule || isDeleting}
              onClick={() => {
                if (deletingSchedule) {
                  confirmDeleteSchedule(String(deletingSchedule.id));
                }
              }}>
              {isDeleting ? "Deleting..." : "Delete schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable
        data={schedules ?? []}
        columns={scheduleColumns}
        emptyMessage={
          isError
            ? "Unable to load schedules. Please try again."
            : "No schedules found."
        }
        isLoading={isLoading || isFetching || isPending}
        search={{
          value: searchTerm,
          onChange: handleSearchChange,
          placeholder: "Search schedule slots...",
        }}
        sorting={{ state: sorting, onSortingChange: handleSortingChange }}
        actions={{
          onView: onViewSchedule,
          onEdit: onEditSchedule,
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
          aria-label="Schedules pagination"
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
                aria-current={pageItem === currentPage ? "page" : undefined}
                disabled={isPending}
                onClick={() => handlePageChange(pageItem)}>
                {pageItem}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default SchedulesTable;
