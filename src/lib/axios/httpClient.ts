import { ApiResponse } from "@/types/api.types";
import axios from "axios";
import { isTokenExpiringSoon } from "../tokenUtils";
import { cookies, headers } from "next/headers";
import { getNewTokensWithRefreshToken } from "@/services/auth.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined in environment variables");
}

export const tryRefreshToken = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  if (!isTokenExpiringSoon) return;
  const requestHeader = await headers();
  if (requestHeader.get("x-token-refreshed")) return;
  try {
    await getNewTokensWithRefreshToken(refreshToken);
  } catch (error) {
    console.log("Error refreshing token", error);
  }
};

export interface IApiResponse {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const axiosInstance = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (accessToken && refreshToken) {
    await tryRefreshToken(accessToken, refreshToken);
  }
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
  return instance;
};
const httpGet = async <TData>(
  endpoint: string,
  options?: IApiResponse,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.get<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    });
    return response.data;
  } catch (error) {
    console.log(`Get request to ${endpoint} failed`, error);
    throw error;
  }
};

const httpPost = async <TData>(
  endpoint: string,
  data?: unknown,
  options?: IApiResponse,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
      headers: options?.headers,
    });
    return response.data;
  } catch (error) {
    console.log(`Post request to ${endpoint} failed`, error);
    throw error;
  }
};

const httpPut = async <TData>(
  endpoint: string,
  data?: unknown,
  options?: IApiResponse,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
      headers: options?.headers,
    });
    return response.data;
  } catch (error) {
    console.log(`Put request to ${endpoint} failed`, error);
    throw error;
  }
};

const httpPatch = async <TData>(
  endpoint: string,
  data?: unknown,
  options?: IApiResponse,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
      headers: options?.headers,
    });
    return response.data;
  } catch (error) {
    console.log(`Patch request to ${endpoint} failed`, error);
    throw error;
  }
};

const httpDelete = async <TData>(
  endpoint: string,
  options?: IApiResponse,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.delete<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    });
    return response.data;
  } catch (error) {
    console.log(`Delete request to ${endpoint} failed`, error);
    throw error;
  }
};

export const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
};
