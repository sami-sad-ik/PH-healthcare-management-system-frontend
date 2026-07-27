/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData } from "@/types/dashboard.types";

export const getDashboardData = async () => {
  try {
    const response = await httpClient.get<IAdminDashboardData>("/stats");
    return response;
  } catch (error: any) {
    console.log("Error from dashboard server action", error);
    return {
      success: false,
      message: error.message || "Failed to fetch dashboard data",
      data: null,
      meta: null,
    };
  }
};
