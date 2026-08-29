"use client";

import DataTable from "@/components/shared/table/DataTable";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import CreateDoctorForm from "./CreateDoctorForm";
import DoctorDetails from "./DoctorDetails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteDoctor, getDoctors } from "@/services/doctor.service";
import { getAllSpecialities } from "@/services/speciality.service";
import { IDoctor } from "@/types/doctor.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { doctorColumns } from "./doctorsColumns";
import { useManagementTable } from "@/hooks/useManagementTable";

const DoctorsTable = ({ queryString }: { queryString: string }) => {
  const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<IDoctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<IDoctor | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: doctors,
    isLoading,
    isFetching,
    isError,
    isPending,
    searchTerm,
    sorting,
    filterValues,
    currentPage,
    pageSize,
    totalPages,
    pageItems,
    handleSortingChange,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  } = useManagementTable<IDoctor>({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    initialQueryString: queryString,
  });

  const { data: specialityResponse } = useQuery({
    queryKey: ["specialities"],
    queryFn: getAllSpecialities,
    staleTime: 1000 * 60 * 60,
  });
  const specialities = Array.isArray(specialityResponse?.data)
    ? specialityResponse.data
    : [];

  const onViewDoctor = (doctor: IDoctor) => {
    setViewingDoctor(doctor);
  };
  const onEditDoctor = (doctor: IDoctor) => {
    setEditingDoctor(doctor);
  };
  const onDeleteDoctor = (doctor: IDoctor) => {
    setDeleteError(null);
    setDeletingDoctor(doctor);
  };

  const { mutate: confirmDeleteDoctor, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setDeletingDoctor(null);
    },
    onError: (error) => {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete doctor.",
      );
    },
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog
          open={isCreateDoctorOpen}
          disablePointerDismissal
          onOpenChange={(open, details) => {
            if (open || details.reason === "close-press") {
              setIsCreateDoctorOpen(open);
            }
          }}>
          <DialogTrigger
            render={
              <Button type="button">
                <Plus />
                Create doctor
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create doctor</DialogTitle>
              <DialogDescription>
                Add a doctor and assign their specialities.
              </DialogDescription>
            </DialogHeader>
            <CreateDoctorForm
              specialities={specialities}
              onSuccess={() => setIsCreateDoctorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Dialog
        open={Boolean(editingDoctor)}
        disablePointerDismissal
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press") {
            setEditingDoctor(null);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>
              Update the doctor details and assigned specialities.
            </DialogDescription>
          </DialogHeader>
          {editingDoctor && (
            <CreateDoctorForm
              key={editingDoctor.id}
              doctor={editingDoctor}
              specialities={specialities}
              onSuccess={() => setEditingDoctor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(viewingDoctor)}
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press") {
            setViewingDoctor(null);
          }
        }}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Doctor profile</DialogTitle>
            <DialogDescription>
              Complete profile, account, appointment, schedule, and review details.
            </DialogDescription>
          </DialogHeader>
          {viewingDoctor && <DoctorDetails doctorId={viewingDoctor.id} />}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deletingDoctor)}
        disablePointerDismissal={isDeleting}
        onOpenChange={(open, details) => {
          if (!open && details.reason === "close-press" && !isDeleting) {
            setDeletingDoctor(null);
            setDeleteError(null);
          }
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete doctor</DialogTitle>
            <DialogDescription>
              This will remove {deletingDoctor?.name} from the doctors list.
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
                setDeletingDoctor(null);
                setDeleteError(null);
              }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!deletingDoctor || isDeleting}
              onClick={() => {
                if (deletingDoctor) {
                  confirmDeleteDoctor(String(deletingDoctor.id));
                }
              }}>
              {isDeleting ? "Deleting..." : "Delete doctor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DataTable
        data={doctors ?? []}
        columns={doctorColumns}
        emptyMessage={
          isError
            ? "Unable to load doctors. Please try again."
            : "No doctors found."
        }
        isLoading={isLoading || isFetching || isPending}
        search={{
          value: searchTerm,
          onChange: handleSearchChange,
          placeholder: "Search doctors...",
        }}
        filters={
          <DataTableFilters
            key={JSON.stringify(filterValues)}
            value={filterValues}
            specialities={specialities}
            onChange={handleFilterChange}
            disabled={isLoading || isPending}
          />
        }
        sorting={{ state: sorting, onSortingChange: handleSortingChange }}
        actions={{
          onView: onViewDoctor,
          onEdit: onEditDoctor,
          onDelete: onDeleteDoctor,
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

          aria-label="Doctors pagination"
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

export default DoctorsTable;
