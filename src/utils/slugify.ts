/**
 * Gera um slug a partir de um texto (título).
 * Ex.: "Dicas para Passar na Prova do DETRAN" -> "dicas-para-passar-na-prova-do-detran"
 *
 * Nota: o back-end pode gerar o slug automaticamente; esta função é usada
 * apenas para pré-visualização no formulário.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
    .replace(/\s+/g, "-") // espaços -> hífen
    .replace(/-+/g, "-"); // hífens duplicados
}

