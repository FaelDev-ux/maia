import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "@/app/api/auth/_lib";

function getUidFromUser(user: unknown) {
  if (typeof user !== "object" || user === null) {
    return null;
  }

  const currentUser = user as { authUid?: unknown; id?: unknown };

  if (typeof currentUser.authUid === "string") {
    return currentUser.authUid;
  }

  if (typeof currentUser.id === "string") {
    return currentUser.id;
  }

  return null;
}

async function getAuthenticatedAccess(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const response = await fetch(`${getBackendUrl()}/api/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await parseBackendResponse(response);
    const uid = getUidFromUser(data.user);

    if (response.ok && uid) {
      return { accessToken, uid };
    }

    if (response.status !== 401 || !refreshToken) {
      return {
        response: NextResponse.json({ erro: getBackendError(data) }, { status: response.status }),
      };
    }
  }

  if (!refreshToken) {
    return {
      response: NextResponse.json({ erro: "Sessao expirada." }, { status: 401 }),
    };
  }

  const { data, response } = await requestBackendTokenRefresh(refreshToken);
  const uid = getUidFromUser(data.user) ?? data.uid ?? null;

  if (!response.ok || !data.accessToken || !uid) {
    const nextResponse = NextResponse.json(
      { erro: getBackendError(data) },
      { status: response.status }
    );
    clearAuthCookies(nextResponse);

    return { response: nextResponse };
  }

  return {
    accessToken: data.accessToken,
    refreshedAuthData: data,
    uid,
  };
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ erro: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const auth = await getAuthenticatedAccess(request);

  if (!auth.accessToken || !auth.uid) {
    return auth.response ?? NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  const backendResponse = await fetch(`${getBackendUrl()}/api/usuario/${auth.uid}/onboarding/`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
  const data = await parseBackendResponse(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json({ erro: getBackendError(data) }, { status: backendResponse.status });
  }

  const response = NextResponse.json({
    mensagem: data.mensagem ?? "Onboarding atualizado com sucesso.",
    user: data.user,
  });

  if (auth.refreshedAuthData) {
    setAuthCookies(response, auth.refreshedAuthData);
  }

  return response;
}
