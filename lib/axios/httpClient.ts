import axios from "axios";

const API_BASE_URL = process.env.REACT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});
