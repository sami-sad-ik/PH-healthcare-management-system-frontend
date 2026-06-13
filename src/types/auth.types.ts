export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  redirect: boolean;
  token: string;
  url?: string | undefined;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    role: string;
    status: string;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt?: Date | null | undefined;
  };
}
