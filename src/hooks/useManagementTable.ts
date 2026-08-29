"use client";

import { DataTableFilterValues } from "@/components/shared/table/DataTableFilters";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

export type ManagementFilterValues = DataTableFilterValues;

export type PageItem = number | "ellipsis";

export interface ManagementTableMeta {
  limit?: number;
  totalPages?: number;
}

export interface ManagementTableResponse<TData> {
  data?: TData[];
  meta?: ManagementTableMeta;
}

export interface UseManagementTableOptions<TData> {
  queryKey: string[];
  queryFn: (queryString: string) => Promise<ManagementTableResponse<TData> | TData[]>;
  initialQueryString?: string;
  defaultPageSize?: number;
  filterKeys?: {
    gender?: string;
    speciality?: string;
    feeMin?: string;
    feeMax?: string;
  };
}

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

export const useManagementTable = <TData>({
  queryKey,
  queryFn,
  initialQueryString = "",
  defaultPageSize = 10,
  filterKeys = {},
}: UseManagementTableOptions<TData>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeQueryString = searchParams.toString() || initialQueryString;

  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: [...queryKey, activeQueryString],
    queryFn: () => queryFn(activeQueryString),
  });

  const payload = queryData as ManagementTableResponse<TData> | TData[] | undefined;
  const data = Array.isArray(payload) ? payload : payload?.data ?? [];
  const meta = !Array.isArray(payload) ? payload?.meta ?? {} : {};

  const pageSizeFromUrl = Number(searchParams.get("limit"));
  const pageSize =
    Number.isInteger(pageSizeFromUrl) && pageSizeFromUrl > 0
      ? pageSizeFromUrl
      : (meta.limit ?? defaultPageSize);
  const totalPages = Math.max(meta.totalPages ?? 1, 1);
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

  const filterValues: ManagementFilterValues = {
    gender: searchParams.get(filterKeys.gender ?? "gender") ?? "",
    specialities: searchParams.getAll(filterKeys.speciality ?? "specialities.speciality.title"),
    appointmentFeeMin:
      searchParams.get(filterKeys.feeMin ?? "appointmentFee[gte]") ?? "",
    appointmentFeeMax:
      searchParams.get(filterKeys.feeMax ?? "appointmentFee[lte]") ?? "",
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

  const handleFilterChange = (nextFilters: ManagementFilterValues) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.delete(filterKeys.gender ?? "gender");
    params.delete(filterKeys.speciality ?? "specialities.speciality.title");
    params.delete(filterKeys.feeMin ?? "appointmentFee[gte]");
    params.delete(filterKeys.feeMax ?? "appointmentFee[lte]");

    if (nextFilters.gender) {
      params.set(filterKeys.gender ?? "gender", nextFilters.gender);
    }
    nextFilters.specialities.forEach((title) => {
      params.append(filterKeys.speciality ?? "specialities.speciality.title", title);
    });
    if (nextFilters.appointmentFeeMin) {
      params.set(filterKeys.feeMin ?? "appointmentFee[gte]", nextFilters.appointmentFeeMin);
    }
    if (nextFilters.appointmentFeeMax) {
      params.set(filterKeys.feeMax ?? "appointmentFee[lte]", nextFilters.appointmentFeeMax);
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

  return {
    data,
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
    pageItems: getPageItems(currentPage, totalPages),
    handleSortingChange,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  };
};

export { getPageItems };
