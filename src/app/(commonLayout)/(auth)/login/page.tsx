import LoginForm from "@/components/modules/consultation/Auth/LoginForm";

interface loginParams {
  searchParams: Promise<{ redirect?: string }>;
}
const LoginPage = async ({ searchParams }: loginParams) => {
  const params = await searchParams;
  const redirectPath = params?.redirect;
  return <LoginForm redirectPath={redirectPath} />;
};

export default LoginPage;
