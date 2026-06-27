"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export const refreshToken = async (refreshToken: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    if (!res.ok) return false;
    const { data } = await res.json();
    const { accessToken, refreshToken: newRefreshToken, token } = data;
    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }
    if (newRefreshToken) {
      await setTokenInCookies("refreshToken", newRefreshToken);
    }
    if (token) {
      await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60);
    }
    return true;
  } catch (error) {
    console.log(`Error occured in refreshing token`, error);
    return false;
  }
};
