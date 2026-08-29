// ============================================================
// HELPERS DE ERRO - MÓDULO LEADS
// ============================================================
//
// Extrai mensagens legíveis de erros com segurança de tipos
// (evita o uso de `any` nos blocos catch, exigido pelo linter).

/** Retorna a mensagem de erro (string) a partir de um erro desconhecido. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (typeof error === "string" && error.trim()) return error;

  return fallback;
}
