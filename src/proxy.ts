import { NextRequest } from "next/server";

export const proxy = async (request: NextRequest) => {};

const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)",
  ],
};
