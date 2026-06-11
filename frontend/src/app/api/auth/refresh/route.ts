import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "../_lib";

function getSafeRedirectUrl(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next");

  if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) {
    return null;
  }

  return new URL(nextPath, request.url);
}

async function refreshSession(request: NextRequest, shouldRedirect = false) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const redirectUrl = getSafeRedirectUrl(request);

  if (!refreshToken) {
    const response = shouldRedirect
      ? NextResponse.redirect(new URL("/auth?mode=login", request.url))
      : NextResponse.json({ erro: "Sessao expirada." }, { status: 401 });
    clearAuthCookies(response);

    return response;
  }

  const { data, response: backendResponse } = await requestBackendTokenRefresh(refreshToken);

  if (!backendResponse.ok) {
    const response = shouldRedirect
      ? NextResponse.redirect(new URL("/auth?mode=login", request.url))
      : NextResponse.json({ erro: getBackendError(data) }, { status: backendResponse.status });
    clearAuthCookies(response);

    return response;
  }

  const response = shouldRedirect
    ? NextResponse.redirect(redirectUrl ?? new URL("/home", request.url))
    : NextResponse.json({
        mensagem: data.mensagem ?? "Sessao renovada com sucesso.",
        uid: data.uid,
        user: data.user,
      });
  setAuthCookies(response, data);

  return response;
}

export async function GET(request: NextRequest) {
  return refreshSession(request, true);
}

export async function POST(request: NextRequest) {
  return refreshSession(request);
}
