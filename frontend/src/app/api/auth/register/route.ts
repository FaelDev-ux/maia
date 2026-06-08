import { type NextRequest, NextResponse } from "next/server";
import {
  getBackendError,
  getBackendUrl,
  parseBackendResponse,
  readJsonBody,
  setAuthCookies,
} from "../_lib";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);

  if (!body) {
    return NextResponse.json({ erro: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const backendResponse = await fetch(`${getBackendUrl()}/api/cadastro/`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await parseBackendResponse(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json({ erro: getBackendError(data) }, { status: backendResponse.status });
  }

  const response = NextResponse.json({
    mensagem: data.mensagem ?? "Cadastro realizado com sucesso.",
    uid: data.uid,
    user: data.user,
  });
  setAuthCookies(response, data);

  return response;
}
