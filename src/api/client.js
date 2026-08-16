const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ACCESS_KEY = "abaya_access";
const REFRESH_KEY = "abaya_refresh";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// djoser / DRF return errors in a few different shapes depending on the
// endpoint (a flat {detail}, or {field: ["msg"]} validation errors).
// This flattens whichever shape shows up into one readable line.
function extractMessage(data) {
  if (!data) return "Something went wrong. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    const text = Array.isArray(val) ? val[0] : val;
    return firstKey === "non_field_errors" ? text : `${firstKey}: ${text}`;
  }
  return "Something went wrong. Please try again.";
}

async function refreshAccessToken() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/auth/jwt/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    tokenStore.clear();
    return null;
  }
  const data = await res.json();
  tokenStore.set(data.access, null);
  return data.access;
}

/**
 * Core fetch wrapper.
 * - `auth: true` (default) attaches the JWT access token when one exists.
 * - `auth: "required"` throws immediately if there's no token, instead of
 *   letting the request go out and bounce off a 401.
 * - On a 401 with a refresh token available, retries once after refreshing.
 */
export async function apiFetch(path, { method = "GET", body, auth = true, headers = {} } = {}) {
  if (auth === "required" && !tokenStore.getAccess()) {
    throw new ApiError("Please sign in to continue.", 401, null);
  }

  const doFetch = async () => {
    const finalHeaders = { ...headers };
    if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
    const access = tokenStore.getAccess();
    if (auth && access) finalHeaders["Authorization"] = `JWT ${access}`;

    return fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth && tokenStore.getRefresh()) {
    const newAccess = await refreshAccessToken();
    if (newAccess) res = await doFetch();
  }

  if (res.status === 204) return null;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(extractMessage(data), res.status, data);
  }
  return data;
}

export { BASE_URL };
