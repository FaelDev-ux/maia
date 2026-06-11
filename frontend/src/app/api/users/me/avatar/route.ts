import { type NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  requestBackendTokenRefresh,
  setAuthCookies,
} from "@/app/api/auth/_lib";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

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

async function getAuthenticatedAccess(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const { data, response } = await fetchMe(accessToken);
    const uid = getUserUid(data);

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
  const uid = getUserUid(data);

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

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedAccess(request);

  if (!auth.accessToken || !auth.uid) {
    return auth.response ?? NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const image = formData?.get("image") ?? formData?.get("avatar") ?? formData?.get("file");

  if (!(image instanceof File)) {
    return NextResponse.json({ erro: "Envie uma foto de perfil." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return NextResponse.json(
      { erro: "Envie apenas fotos em JPG, PNG ou WebP." },
      { status: 415 }
    );
  }

  if (image.size > MAX_AVATAR_SIZE_BYTES) {
    return NextResponse.json({ erro: "A foto deve ter no maximo 5 MB." }, { status: 413 });
  }

  const backendFormData = new FormData();
  backendFormData.set("image", image);

  const backendResponse = await fetch(`${getBackendUrl()}/api/usuario/${auth.uid}/avatar/`, {
    body: backendFormData,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
    method: "POST",
  });
  const data = await parseBackendResponse(backendResponse);
  const response = NextResponse.json(data, { status: backendResponse.status });

  if (auth.refreshedAuthData) {
    setAuthCookies(response, auth.refreshedAuthData);
  }

  return response;
}
