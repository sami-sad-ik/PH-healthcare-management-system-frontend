import DoctorsTable from "@/components/modules/Admin/DoctorsManagement/DoctorsTable";
import { getDoctors } from "@/services/doctor.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const DoctorsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const queryParamsObject = await searchParams;

  const queryString = new URLSearchParams();
  Object.entries(queryParamsObject).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => queryString.append(key, item));
    } else if (value !== undefined) {
      queryString.set(key, value);
    }
  });
  const serializedQueryString = queryString.toString();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors", serializedQueryString],
    queryFn: () => getDoctors(serializedQueryString),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 6, //  6 hour
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsTable
        queryString={serializedQueryString}
      />
    </HydrationBoundary>
  );
};

export default DoctorsManagementPage;
