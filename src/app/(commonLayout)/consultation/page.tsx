import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getDoctors } from "@/services/doctor.service";
import { getAllSpecialities } from "@/services/speciality.service";
import DoctorsList from "@/components/modules/consultation/DoctorsList";

const ConsultationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const queryParamsObject = await searchParams;
  const queryString = new URLSearchParams();
  Object.entries(queryParamsObject).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => queryString.append(key, item));
    else if (value !== undefined) queryString.set(key, value);
  });
  if (!queryString.has("user.role")) queryString.set("user.role", "DOCTOR");
  const serializedQueryString = queryString.toString();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors", serializedQueryString],
    queryFn: () => getDoctors(serializedQueryString),
  });
  await queryClient.prefetchQuery({
    queryKey: ["specialities"],
    queryFn: getAllSpecialities,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsList queryString={serializedQueryString} />
    </HydrationBoundary>
  );
};

export default ConsultationPage;
