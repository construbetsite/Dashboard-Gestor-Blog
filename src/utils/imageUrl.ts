/**
 * Utilitário para construir URLs válidas de imagens dos posts do blog.
 *
 * Os posts podem armazenar o caminho relativo dentro do Supabase Storage
 * (ex.: "posts/meu-post.jpg", "img.jpg") ou uma URL absoluta já válida.
 * Esta função normaliza os dois casos para uma URL completa acessível.
 */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://yxdmqgjezebwlxgbvocf.supabase.co";

/** Nome do bucket público no Supabase Storage. */
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "blog";

/** Expressão para detectar uma URL absoluta já válida (http/https). */
const ABSOLUTE_URL_RE = /^https?:\/\/.+/i;

/**
 * Retorna a URL completa e válida para a imagem do post.
 * - Se `image` for null/undefined -> retorna string vazia.
 * - Se já for uma URL absoluta (http/https) -> retorna como está.
 * - Caso contrário, monta a URL completa do Supabase Storage:
 *   `https://{projeto}.supabase.co/storage/v1/object/public/{bucket}/{caminho}`
 */
export function getImageUrl(image?: string | null): string {
  if (!image) return "";
  const trimmed = image.trim();
  if (!trimmed) return "";

  // Já é uma URL absoluta (http/https, incluindo CDN, placeholder, etc.)
  if (ABSOLUTE_URL_RE.test(trimmed)) return trimmed;

  // Evita barras duplas entre o bucket e o caminho
  const path = trimmed.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}
