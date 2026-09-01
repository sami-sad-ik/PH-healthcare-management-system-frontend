import DoctorScheduleTables from "@/components/modules/Doctor/DoctorScheduleTables";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getMyDoctorSchedules } from "@/services/doctorSchedule.service";

const MySchedulesPage = async ({
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
    queryKey: ["myDoctorSchedules", serializedQueryString],
    queryFn: () => getMyDoctorSchedules(serializedQueryString),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorScheduleTables queryString={serializedQueryString} />
    </HydrationBoundary>
  );
};

export default MySchedulesPage;
