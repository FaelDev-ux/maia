import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "@/app/api/auth/_lib";

type AuthContext = {
  accessToken: string;
  refreshedAuthData?: Awaited<ReturnType<typeof parseBackendResponse>>;
  uid: string;
  user?: unknown;
};

function getUserUid(data: Awaited<ReturnType<typeof parseBackendResponse>>) {
  if (data.uid) {
    return data.uid;
  }

  if (typeof data.user === "object" && data.user !== null) {
    const user = data.user as { authUid?: unknown; id?: unknown };

    if (typeof user.authUid === "string") {
      return user.authUid;
    }

    if (typeof user.id === "string") {
      return user.id;
    }
  }

  return null;
}

async function fetchMe(accessToken: string) {
  const response = await fetch(`${getBackendUrl()}/api/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await parseBackendResponse(response);

  return { data, response };
}

async function resolveAuthContext(request: NextRequest): Promise<{
  context?: AuthContext;
  response?: NextResponse;
}> {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const { data, response } = await fetchMe(accessToken);

    const uid = getUserUid(data);

    if (response.ok && uid) {
      return {
        context: {
          accessToken,
          uid,
          user: data.user,
        },
      };
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

  const refreshedUid = getUserUid(data);

  if (!response.ok || !data.accessToken || !refreshedUid) {
    const nextResponse = NextResponse.json(
      { erro: getBackendError(data) },
      { status: response.status }
    );
    clearAuthCookies(nextResponse);

    return { response: nextResponse };
  }

  return {
    context: {
      accessToken: data.accessToken,
      refreshedAuthData: data,
      uid: refreshedUid,
      user: data.user,
    },
  };
}

export async function GET(request: NextRequest) {
  const { context, response } = await resolveAuthContext(request);

  if (!context) {
    return response ?? NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  const nextResponse = NextResponse.json({ user: context.user });

  if (context.refreshedAuthData) {
    setAuthCookies(nextResponse, context.refreshedAuthData);
  }

  return nextResponse;
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ erro: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const { context, response } = await resolveAuthContext(request);

  if (!context) {
    return response ?? NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  const backendResponse = await fetch(`${getBackendUrl()}/api/usuario/${context.uid}/`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${context.accessToken}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
  const data = await parseBackendResponse(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json({ erro: getBackendError(data) }, { status: backendResponse.status });
  }

  const nextResponse = NextResponse.json({
    mensagem: data.mensagem ?? "Perfil atualizado com sucesso.",
    user: data.user,
  });

  if (context.refreshedAuthData) {
    setAuthCookies(nextResponse, context.refreshedAuthData);
  }

  return nextResponse;
}
