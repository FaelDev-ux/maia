import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, getBackendUrl } from "../_lib";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken) {
    await fetch(`${getBackendUrl()}/api/logout/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ mensagem: "Sessao encerrada." });
  clearAuthCookies(response);

  return response;
}
