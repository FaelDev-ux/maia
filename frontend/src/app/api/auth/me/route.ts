import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "../_lib";

async function fetchMe(accessToken: string) {
  const response = await fetch(`${getBackendUrl()}/api/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await parseBackendResponse(response);

  return { data, response };
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  if (accessToken) {
    const { data, response: backendResponse } = await fetchMe(accessToken);

    if (backendResponse.ok) {
      return NextResponse.json({ user: data.user });
    }

    if (backendResponse.status !== 401 || !refreshToken) {
      return NextResponse.json({ erro: getBackendError(data) }, { status: backendResponse.status });
    }
  }

  if (!refreshToken) {
    return NextResponse.json({ erro: "Sessao expirada." }, { status: 401 });
  }

  const { data: refreshData, response: refreshResponse } =
    await requestBackendTokenRefresh(refreshToken);

  if (!refreshResponse.ok || !refreshData.accessToken) {
    const response = NextResponse.json(
      { erro: getBackendError(refreshData) },
      { status: refreshResponse.status }
    );
    clearAuthCookies(response);

    return response;
  }

  const response = NextResponse.json({ user: refreshData.user });
  setAuthCookies(response, refreshData);

  return response;
}
