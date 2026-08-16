import { apiFetch } from "./client";

// The /customers/ endpoint isn't scoped to the logged-in user on the
// backend yet, so this fetches the list and picks out the row that
// matches the current account (linked via djoser's /auth/users/me/ id).
export async function getMyProfile(userId) {
  const all = await apiFetch(`/customers/`, { auth: "required" });
  const list = Array.isArray(all) ? all : all.results || [];
  return list.find((c) => c.user_id === userId) || null;
}

export function updateProfile(customerId, data) {
  return apiFetch(`/customers/${customerId}/`, {
    method: "PATCH",
    auth: "required",
    body: data,
  });
}
