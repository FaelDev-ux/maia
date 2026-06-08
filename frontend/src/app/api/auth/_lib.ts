import { NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE_FALLBACK = 55 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export type BackendAuthResponse = {
  accessToken?: string;
  expiresIn?: string;
  mensagem?: string;
  refreshToken?: string;
  uid?: string;
  user?: unknown;
  erro?: string;
};

export function getBackendUrl() {
  return process.env.MAIA_BACKEND_URL ?? "http://127.0.0.1:8000";
}

export async function requestBackendTokenRefresh(refreshToken: string) {
  const response = await fetch(`${getBackendUrl()}/api/refresh/`, {
    body: JSON.stringify({ refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await parseBackendResponse(response);

  return { data, response };
}

export async function parseBackendResponse(response: Response): Promise<BackendAuthResponse> {
  try {
    return (await response.json()) as BackendAuthResponse;
  } catch {
    return {};
  }
}

export function getBackendError(data: BackendAuthResponse) {
  return data.erro ?? data.mensagem ?? "Nao foi possivel concluir a operacao.";
}

export function setAuthCookies(response: NextResponse, data: BackendAuthResponse) {
  if (!data.accessToken || !data.refreshToken) {
    return;
  }

  const accessTokenMaxAge = Math.max(Number(data.expiresIn ?? 3600) - 60, 60);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set("accessToken", data.accessToken, {
    httpOnly: true,
    maxAge: Number.isFinite(accessTokenMaxAge) ? accessTokenMaxAge : ACCESS_TOKEN_MAX_AGE_FALLBACK,
    path: "/",
    sameSite: "lax",
    secure,
  });

  response.cookies.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
