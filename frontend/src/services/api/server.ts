import { cookies } from "next/headers";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export function getBackendUrl() {
  return process.env.MAIA_BACKEND_URL ?? DEFAULT_BACKEND_URL;
}

export async function getServerAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get("accessToken")?.value ?? null;
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const accessToken = await getServerAccessToken();
  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
  });
}
