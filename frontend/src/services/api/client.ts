type ApiErrorPayload = {
  code?: string;
  error?: string;
  erro?: string;
  message?: string;
  mensagem?: string;
};

export class MaiaApiError extends Error {
  code?: string;
  retryable: boolean;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "MaiaApiError";
    this.code = code;
    this.retryable = status === 0 || status === 408 || status === 429 || status >= 500;
    this.status = status;
  }
}

export function getApiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const data = payload as ApiErrorPayload;

  return data.error ?? data.erro ?? data.message ?? data.mensagem ?? fallback;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, fallbackError: string) {
  let response: Response;

  try {
    response = await fetch(path, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
  } catch {
    throw new MaiaApiError(
      "Nao foi possivel conectar ao Maia. Verifique sua internet e tente novamente.",
      0,
      "network_error"
    );
  }

  const data = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    const payload = data as ApiErrorPayload;
    const statusFallback =
      response.status === 401
        ? "Sua sessao expirou. Entre novamente para continuar."
        : response.status === 403
          ? "Voce nao tem permissao para realizar esta acao."
          : response.status === 404
            ? "Nao encontramos o recurso solicitado."
            : response.status === 429
              ? "Muitas tentativas em pouco tempo. Aguarde um momento."
              : response.status >= 500
                ? "O Maia esta temporariamente indisponivel. Tente novamente em instantes."
                : fallbackError;

    throw new MaiaApiError(
      getApiErrorMessage(data, statusFallback),
      response.status,
      payload.code
    );
  }

  return data as T;
}
