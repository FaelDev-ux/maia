type ApiErrorPayload = {
  code?: string;
  error?: string;
  erro?: string;
  message?: string;
  mensagem?: string;
};

export class MaiaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MaiaApiError";
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
  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    throw new MaiaApiError(getApiErrorMessage(data, fallbackError), response.status);
  }

  return data as T;
}
