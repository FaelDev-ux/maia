import { apiFetch } from "@/services/api/client";

type PrivacyExportResponse = {
  export?: unknown;
};

type DeleteRequestResponse = {
  deleteRequest?: {
    requestedAt?: string;
    status?: string;
  };
  mensagem?: string;
  message?: string;
};

export async function fetchPrivacyExport() {
  return apiFetch<PrivacyExportResponse>(
    "/api/privacy/export",
    undefined,
    "Nao foi possivel exportar seus dados agora."
  );
}

export async function requestPrivacyDelete() {
  return apiFetch<DeleteRequestResponse>(
    "/api/privacy/delete-request",
    {
      body: JSON.stringify({ reason: "Solicitacao feita pela interface de privacidade." }),
      method: "POST",
    },
    "Nao foi possivel registrar a solicitacao de exclusao agora."
  );
}
