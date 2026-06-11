import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  readJsonBody,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "../_lib";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);

  if (!body) {
    return NextResponse.json({ erro: "Corpo da requisicao invalido." }, { status: 400 });
  }

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let refreshedAuthData: Awaited<ReturnType<typeof requestBackendTokenRefresh>>["data"] | null =
    null;

  if (!accessToken && refreshToken) {
    const { data, response } = await requestBackendTokenRefresh(refreshToken);

    if (!response.ok || !data.accessToken) {
      const nextResponse = NextResponse.json(
        { erro: getBackendError(data) },
        { status: response.status }
      );
      clearAuthCookies(nextResponse);

      return nextResponse;
    }

    accessToken = data.accessToken;
    refreshedAuthData = data;
  }

  if (!accessToken) {
    return NextResponse.json({ erro: "Sessao expirada." }, { status: 401 });
  }

  const backendResponse = await fetch(`${getBackendUrl()}/api/password/change/`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await parseBackendResponse(backendResponse);
  const nextResponse = NextResponse.json(
    backendResponse.ok
      ? { mensagem: data.mensagem ?? "Senha atualizada com sucesso." }
      : { erro: getBackendError(data) },
    { status: backendResponse.status }
  );

  if (refreshedAuthData) {
    setAuthCookies(nextResponse, refreshedAuthData);
  }

  return nextResponse;
}
