import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:8000",
});

export const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);

export default fetcher;
