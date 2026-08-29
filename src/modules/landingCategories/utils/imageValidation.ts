// ============================================================
// VALIDAÇÃO DE IMAGEM - MÓDULO LANDING CATEGORIES
// ============================================================
//
// Validações da API /api/landing-categories/upload:
//   ✅ Formatos: jpeg, png, webp, gif
//   ✅ Tamanho máximo: 5 MB
//
// (Local ao módulo para não alterar o util genérico do Blog,
//  que não aceita GIF.)

export const LANDING_IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_SIZE_MB: 5,
  ALLOWED_MIMES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as const,
} as const;

export function validateLandingImage(
  file: File
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "Nenhum arquivo selecionado." };
  }

  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "O arquivo selecionado não é uma imagem. Use JPEG, PNG, WEBP ou GIF.",
    };
  }

  if (!(LANDING_IMAGE_CONFIG.ALLOWED_MIMES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: `Formato não permitido: ${file.type}. Use JPEG, PNG, WEBP ou GIF.`,
    };
  }

  if (file.size > LANDING_IMAGE_CONFIG.MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `A imagem é muito grande (${sizeMB}MB). Máximo permitido: ${LANDING_IMAGE_CONFIG.MAX_SIZE_MB}MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "O arquivo de imagem está vazio." };
  }

  return { valid: true };
}

export function formatUploadError(
  statusCode: number,
  errorMessage?: string
): string {
  const baseMessage = errorMessage || "Erro ao fazer upload da imagem.";

  switch (statusCode) {
    case 400:
      return `Erro na requisição: ${baseMessage}`;
    case 401:
      return "Você não está autenticado. Faça login novamente.";
    case 403:
      return "Você não tem permissão para fazer upload de imagens.";
    case 413:
      return `A imagem é muito grande. Máximo permitido: ${LANDING_IMAGE_CONFIG.MAX_SIZE_MB}MB.`;
    case 415:
      return "Formato de imagem não permitido. Use JPEG, PNG, WEBP ou GIF.";
    case 500:
      return "Erro no servidor. Tente novamente mais tarde.";
    default:
      return baseMessage;
  }
}
