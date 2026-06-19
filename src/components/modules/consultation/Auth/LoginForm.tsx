import { loginAction } from "@/src/app/(commonLayout)/(auth)/login/_action";
import { ILoginPayload } from "@/src/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const LoginForm = () => {
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: ILoginPayload) => loginAction(payload),
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (await mutateAsync(value)) as any;
      if (!result.success) {
        setServerError(result.message || "Login failed");
        return;
      }
    },
  });
  return <div></div>;
};

export default LoginForm;
