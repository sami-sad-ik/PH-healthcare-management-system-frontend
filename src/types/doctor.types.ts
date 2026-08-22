enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface IDoctor {
  id: number;
  name: string;
  email: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber: string;
  gender: Gender;
  appointmentFee: number;
  qualification: string;
  experience?: number;
  averageRating: number;
  currentWorkingPlace: string;
  designation: string;
  createdAt: Date;
  specialities: Array<{
    specialityId: string;
    doctorId: string;
    speciality: {
      id: string;
      title: string;
      icon: string;
    };
  }>;
}
