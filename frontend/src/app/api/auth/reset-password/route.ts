import { type NextRequest, NextResponse } from "next/server";
import { getBackendError, getBackendUrl, parseBackendResponse, readJsonBody } from "../_lib";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);

  if (!body) {
    return NextResponse.json({ erro: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const backendResponse = await fetch(`${getBackendUrl()}/api/password/reset/`, {
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

  return NextResponse.json({
    mensagem: data.mensagem ?? "Senha redefinida com sucesso.",
  });
}
