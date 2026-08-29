// ============================================================
// LANDING CATEGORY - TIPOS COMPLETOS
// ============================================================
//
// ✅ Contrato fiel à documentação da API /api/landing-categories
// ✅ Campos enviados/recebidos: title, image, url, order, status
//    (`image` é a URL pública retornada pelo endpoint /upload)
// ✅ Ordenação por `order` crescente (feita pelo Backend)

export interface LandingCategory {
  id: number;

  title: string;

  /** URL pública da imagem no bucket (retornada pelo /upload) */
  image: string;

  /** Caminho de redirecionamento (ex.: "construbet/ferramentas") */
  url: string;

  /** Ordem de exibição na landing page (crescente) */
  order: number;

  /** Ativo (true) / Inativo (false) */
  status: boolean;

  createdAt?: string;
  updatedAt?: string;

  created_at?: string;
  updated_at?: string;
}

// ============================================================
// PAYLOADS
// ============================================================

export interface CreateLandingCategoryPayload {
  /** Obrigatório */
  title: string;

  /** Obrigatório - URL da imagem vinda do upload */
  image: string;

  /** Obrigatório - caminho de redirecionamento */
  url: string;

  /** Opcional (default 0) */
  order?: number;

  /** Opcional (default true) */
  status?: boolean;
}

export type UpdateLandingCategoryPayload = Partial<CreateLandingCategoryPayload>;

// ============================================================
// LISTAGEM
// ============================================================

export interface ListLandingCategoriesParams {
  /** true = apenas ativas (landing pública) */
  active?: boolean;
}

// ============================================================
// UPLOAD DE IMAGEM
// ============================================================

/** Resposta documentada do POST /api/landing-categories/upload */
export interface LandingCategoryUploadResponse {
  url: string;
  path: string;
  filename: string;
  size: number;
  mimeType: string;
  bucket: string;
}
