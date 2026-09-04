import BookingReview from "@/components/modules/consultation/BookingReview";
import { getDoctorById } from "@/services/doctor.service";

const BookAppointmentsPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ doctorId?: string; scheduleId?: string }>;
}) => {
	const { doctorId, scheduleId } = await searchParams;
	if (!doctorId || !scheduleId) {
		return <p className="py-16 text-center text-sm text-muted-foreground">Choose a doctor and schedule to book an appointment.</p>;
	}

	try {
		const response = await getDoctorById(doctorId);
		return <BookingReview doctor={response.data} scheduleId={scheduleId} />;
	} catch {
		return <p className="py-16 text-center text-sm text-destructive">Unable to load this appointment. Please try again.</p>;
	}
};

export default BookAppointmentsPage;
