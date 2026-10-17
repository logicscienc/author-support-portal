
import { apiRequest } from "./client";

export async function loginRequest({ email, password }) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: {
      email: email.trim().toLowerCase(),
      password,
    },
    auth: false,
  });

  return result.data;
}

export async function getCurrentUser() {
  const result = await apiRequest("/auth/me");

  return result.data.user;
}
