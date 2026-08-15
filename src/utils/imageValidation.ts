/**
 * Utilitários para validação de imagens
 * Conforme Guia de Integração da API de Blog v1.0
 */

// ✅ Constantes de validação
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_SIZE_MB: 5,
  ALLOWED_MIMES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;

/**
 * Valida se o arquivo de imagem atende aos requisitos
 * @param file - Arquivo selecionado
 * @returns { valid: boolean, error?: string }
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  // 1. Verificar se é um arquivo
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado' };
  }

  // 2. Verificar se é uma imagem
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'O arquivo selecionado não é uma imagem. Use JPEG, PNG ou WEBP.',
    };
  }

  // 3. Verificar o tipo MIME específico (400 Bad Request)
  if (!IMAGE_CONFIG.ALLOWED_MIMES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Formato não permitido: ${file.type}. Use JPEG, PNG ou WEBP.`,
    };
  }

  // 4. Verificar o tamanho (413 Payload Too Large)
  if (file.size > IMAGE_CONFIG.MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `A imagem é muito grande (${sizeMB}MB). Máximo permitido: ${IMAGE_CONFIG.MAX_SIZE_MB}MB.`,
    };
  }

  // 5. Verificar se o arquivo está vazio (400 Bad Request)
  if (file.size === 0) {
    return { valid: false, error: 'O arquivo de imagem está vazio.' };
  }

  return { valid: true };
};

/**
 * Formata mensagem de erro de upload conforme o código HTTP
 * @param statusCode - Código HTTP retornado
 * @param errorMessage - Mensagem de erro do servidor
 * @returns Mensagem formatada para exibir ao usuário
 */
export const formatUploadError = (
  statusCode: number,
  errorMessage?: string
): string => {
  const baseMessage = errorMessage || 'Erro ao fazer upload da imagem';

  switch (statusCode) {
    case 400:
      return `Erro na requisição: ${baseMessage}`;
    case 401:
      return 'Você não está autenticado. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para fazer upload de imagens.';
    case 413:
      return `A imagem é muito grande. Máximo permitido: ${IMAGE_CONFIG.MAX_SIZE_MB}MB.`;
    case 415:
      return 'Formato de imagem não permitido. Use JPEG, PNG ou WEBP.';
    case 500:
      return 'Erro no servidor. Tente novamente mais tarde.';
    default:
      return baseMessage;
  }
};

/**
 * Extrai extensão do arquivo
 * @param filename - Nome do arquivo
 * @returns Extensão com ponto (ex: .jpg)
 */
export const getFileExtension = (filename: string): string => {
  return '.' + filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Verifica se a extensão é permitida
 * @param filename - Nome do arquivo
 * @returns true se a extensão é permitida
 */
export const isValidFileExtension = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(ext as any);
};
