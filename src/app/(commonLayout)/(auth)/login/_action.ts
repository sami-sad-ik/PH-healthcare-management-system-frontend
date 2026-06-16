/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { httpClient } from "@/src/lib/axios/httpClient";
import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { ApiErrorResponse } from "@/src/types/api.types";
import { ILoginResponse } from "@/src/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/src/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (
  payload: ILoginPayload,
): Promise<ILoginResponse | ApiErrorResponse> => {
  const parsesdPayload = loginZodSchema.safeParse(payload);
  if (!parsesdPayload.success) {
    const firstError =
      parsesdPayload.error.issues[0].message || "Invalid payload";
    return {
      success: false,
      message: firstError,
    };
  }
  try {
    const response = await httpClient.post<ILoginResponse>(
      "/auth/login",
      parsesdPayload.data,
    );
    const { accessToken, refreshToken, token } = response.data;

    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies("better-auth.session_token", token);

    redirect("/dashboard");
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred during login",
    };
  }
};
