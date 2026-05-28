import axios from "axios";
import { api } from "./api";

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const res = await api.post("/auth/register", data);
  const payload = res.data?.data ?? res.data;
  return payload as { accessToken: string; user: { id: string; email: string; name: string; role: string } };
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await api.post("/auth/login", data);
  const payload = res.data?.data ?? res.data;
  return payload as { accessToken: string; user: { id: string; email: string; name: string; role: string } };
}

export async function logoutUser() {
  await api.post("/auth/logout");
}

export async function getMe() {
  const res = await api.get("/users/me");
  return res.data.data as { id: string; email: string; name: string; role: string };
}