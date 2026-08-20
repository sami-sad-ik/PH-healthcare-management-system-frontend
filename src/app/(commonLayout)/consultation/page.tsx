import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getDoctors } from "@/services/doctor.service";
import DoctorsList from "@/components/modules/consultation/DoctorsList";

const ConsultationPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsList />
    </HydrationBoundary>
  );
};

export default ConsultationPage;
