import { apiFetch, tokenStore } from "./client";

export async function register({ username, email, first_name, last_name, password }) {
  return apiFetch(`/auth/users/`, {
    method: "POST",
    auth: false,
    body: { username, email, first_name, last_name, password },
  });
}

export async function login({ username, password }) {
  const data = await apiFetch(`/auth/jwt/create/`, {
    method: "POST",
    auth: false,
    body: { username, password },
  });
  tokenStore.set(data.access, data.refresh);
  return data;
}

export function logout() {
  tokenStore.clear();
}

export function currentUser() {
  return apiFetch(`/auth/users/me/`, { auth: "required" });
}

export function isAuthenticated() {
  return Boolean(tokenStore.getAccess());
}
