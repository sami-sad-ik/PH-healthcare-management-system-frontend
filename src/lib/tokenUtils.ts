"use server";

import jwt, { JwtPayload } from "jsonwebtoken";
import { setCookie } from "./cookieUtils";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const getTokenSecondsRemaining = (token: string): number => {
  if (!token) return 0;
  try {
    const tokenPayload = JWT_ACCESS_SECRET
      ? (jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload)
      : (jwt.decode(token) as JwtPayload);

    if (tokenPayload && !tokenPayload.exp) {
      return 0; // If there's no exp claim, treat it as expired
    }

    const remainingSeconds =
      (tokenPayload.exp as number) - Math.floor(Date.now() / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch (error) {
    console.log("Error decoding token", error);
    return 0;
  }
};

export const setTokenInCookies = async (name: string, token: string) => {
  const maxAgeInSeconds = getTokenSecondsRemaining(token);
  await setCookie(name, token, maxAgeInSeconds);
};
