
import { getDoctorById } from "@/services/doctor.service";
import DoctorProfile from "@/components/modules/consultation/DoctorProfile";

const ConsultationDoctorPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const response = await getDoctorById(id);

  return <DoctorProfile doctor={response.data} />;
};

export default ConsultationDoctorPage;
