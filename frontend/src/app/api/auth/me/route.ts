import { type NextRequest, NextResponse } from "next/server";
import { getBackendError, getBackendUrl, parseBackendResponse } from "../_lib";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ erro: "Sessao nao encontrada." }, { status: 401 });
  }

  const backendResponse = await fetch(`${getBackendUrl()}/api/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await parseBackendResponse(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json({ erro: getBackendError(data) }, { status: backendResponse.status });
  }

  return NextResponse.json({ user: data.user });
}
