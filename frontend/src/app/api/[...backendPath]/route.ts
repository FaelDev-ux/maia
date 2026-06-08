import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "@/app/api/auth/_lib";

type RouteContext = {
  params: Promise<{
    backendPath: string[];
  }>;
};

const METHODS_WITH_BODY = new Set(["PATCH", "POST", "PUT"]);

function getContentType(request: NextRequest) {
  return request.headers.get("content-type") ?? "";
}

async function getAccessToken(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    return { accessToken };
  }

  if (!refreshToken) {
    return {
      response: NextResponse.json({ erro: "Sessao expirada." }, { status: 401 }),
    };
  }

  const { data, response } = await requestBackendTokenRefresh(refreshToken);

  if (!response.ok || !data.accessToken) {
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
  };
}

async function proxyBackendRequest(request: NextRequest, context: RouteContext) {
  const auth = await getAccessToken(request);

  if (!auth.accessToken) {
    return auth.response ?? NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  const { backendPath } = await context.params;
  const path = backendPath.join("/");
  const url = new URL(`${getBackendUrl()}/api/${path}/`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${auth.accessToken}`);

  const init: RequestInit = {
    headers,
    method: request.method,
  };

  if (METHODS_WITH_BODY.has(request.method)) {
    const contentType = getContentType(request);

    if (contentType.includes("multipart/form-data")) {
      init.body = await request.formData();
    } else {
      headers.set("Content-Type", "application/json");
      init.body = await request.text();
    }
  }

  const backendResponse = await fetch(url, init);
  const data = await parseBackendResponse(backendResponse);
  const nextResponse = NextResponse.json(data, { status: backendResponse.status });

  if (auth.refreshedAuthData) {
    setAuthCookies(nextResponse, auth.refreshedAuthData);
  }

  return nextResponse;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyBackendRequest(request, context);
}
