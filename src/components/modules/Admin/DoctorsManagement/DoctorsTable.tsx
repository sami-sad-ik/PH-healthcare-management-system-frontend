"use client";

import DataTable from "@/components/shared/table/DataTable";
import DataTableFilters, {
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/services/doctor.service";
import { getAllSpecialities } from "@/services/speciality.service";
import { IDoctor } from "@/types/doctor.types";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { doctorColumns } from "./doctorsColumns";

type PageItem = number | "ellipsis";

const getPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
};

const DoctorsTable = ({ queryString }: { queryString: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeQueryString = searchParams.toString() || queryString;

  const {
    data: doctorDataResponse,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["doctors", activeQueryString],
    queryFn: () => getDoctors(activeQueryString),
  });

  const { data: doctors } = doctorDataResponse! || {};
  const { data: specialityResponse } = useQuery({
    queryKey: ["specialities"],
    queryFn: getAllSpecialities,
    staleTime: 1000 * 60 * 60,
  });
  const specialities = Array.isArray(specialityResponse?.data)
    ? specialityResponse.data
    : [];
  const pageSizeFromUrl = Number(searchParams.get("limit"));
  const pageSize =
    Number.isInteger(pageSizeFromUrl) && pageSizeFromUrl > 0
      ? pageSizeFromUrl
      : (doctorDataResponse?.meta?.limit ?? 10);
  const totalPages = Math.max(doctorDataResponse?.meta?.totalPages ?? 1, 1);
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const currentPage = Math.min(
    Math.max(
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
      1,
    ),
    totalPages,
  );
  const filterQueryParams = new URLSearchParams(searchParams.toString());
  filterQueryParams.delete("page");
  const filterQuery = filterQueryParams.toString();
  const previousFilterQuery = useRef(filterQuery);

  useEffect(() => {
    if (previousFilterQuery.current === filterQuery) return;

    previousFilterQuery.current = filterQuery;
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }
  }, [currentPage, filterQuery, pathname, router, searchParams]);

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const searchTerm = searchParams.get("searchTerm") ?? "";
  const filterValues: DataTableFilterValues = {
    gender: searchParams.get("gender") ?? "",
    specialities: searchParams.getAll("specialities.speciality.title"),
    appointmentFeeMin: searchParams.get("appointmentFee[gte]") ?? "",
    appointmentFeeMax: searchParams.get("appointmentFee[lte]") ?? "",
  };
  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortOrder === "desc" }]
    : [];

  const handleSortingChange = (nextSorting: SortingState) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSort = nextSorting[0];
    params.set("page", "1");

    if (nextSort) {
      params.set("sortBy", nextSort.id);
      params.set("sortOrder", nextSort.desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedSearchTerm = nextSearchTerm.trim();
    params.set("page", "1");

    if (normalizedSearchTerm) {
      params.set("searchTerm", normalizedSearchTerm);
    } else {
      params.delete("searchTerm");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleFilterChange = (nextFilters: DataTableFilterValues) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.delete("gender");
    params.delete("specialities.speciality.title");
    params.delete("appointmentFee[gte]");
    params.delete("appointmentFee[lte]");

    if (nextFilters.gender) params.set("gender", nextFilters.gender);
    nextFilters.specialities.forEach((title) =>
      params.append("specialities.speciality.title", title),
    );
    if (nextFilters.appointmentFeeMin) {
      params.set("appointmentFee[gte]", nextFilters.appointmentFeeMin);
    }
    if (nextFilters.appointmentFeeMax) {
      params.set("appointmentFee[lte]", nextFilters.appointmentFeeMax);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (value: string) => {
    const nextPageSize = Number(value);
    if (!Number.isInteger(nextPageSize) || nextPageSize < 1) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("limit", String(nextPageSize));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const onViewDoctor = (doctor: IDoctor) => {
    console.log("View doctor:", doctor);
  };
  const onEditDoctor = (doctor: IDoctor) => {
    console.log("Edit doctor:", doctor);
  };
  const onDeleteDoctor = (doctor: IDoctor) => {
    console.log("Delete doctor:", doctor);
  };

  return (
    <div>
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
          {getPageItems(currentPage, totalPages).map((pageItem, index) =>
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
