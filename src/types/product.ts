// ============================================================
// PRODUCT - TIPOS COMPLETOS
// ============================================================
//
// ✅ Contrato fiel ao Backend (src/modules/product/types/Product.ts)
// ✅ camelCase no payload de entrada/saída (Backend normaliza)
// ✅ commercial_type é UPPERCASE: 'PICKUP' | 'ECOMMERCE'

export type CommercialType = 'PICKUP' | 'ECOMMERCE';

// ============================================================
// LABEL AMIGÁVEL PARA UI
// ============================================================

export const COMMERCIAL_TYPE_LABELS: Record<CommercialType, string> = {
  PICKUP: 'Retirada na Construbet',
  ECOMMERCE: 'E-commerce',
};

// ============================================================
// PRODUTO
// ============================================================

export interface Product {
  id: string;

  categoryId: string;

  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;

  shortDescription: string | null;
  description: string;

  commercialType: CommercialType;

  price: number | null;
  redirectUrl: string | null;

  imageUrl: string | null;
  imagePath: string | null;
  imageFilename: string | null;

  featured: boolean;
  displayOrder: number;
  active: boolean;

  metaTitle: string | null;
  metaDescription: string | null;

  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PAYLOADS DE CRIAÇÃO / ATUALIZAÇÃO
// ============================================================

/**
 * Payload enviado ao Backend no POST /api/product.
 * O Backend aceita tanto camelCase quanto snake_case e normaliza.
 * Aqui enviamos camelCase para manter consistência com o Blog.
 */
export interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;

  // opcionais
  slug?: string;
  sku?: string | null;
  brand?: string | null;
  shortDescription?: string | null;

  commercialType: CommercialType;

  /** Obrigatório quando commercialType === 'PICKUP' */
  price?: number | null;
  /** Obrigatório quando commercialType === 'ECOMMERCE' */
  redirectUrl?: string | null;

  /** Vindo do upload de imagem */
  imageUrl?: string | null;
  imagePath?: string | null;
  imageFilename?: string | null;
  imageSize?: number | null;
  imageMimeType?: string | null;
  storageBucket?: string | null;

  featured?: boolean;
  displayOrder?: number;
  active?: boolean;

  metaTitle?: string | null;
  metaDescription?: string | null;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ============================================================
// PARÂMETROS DE LISTAGEM
// ============================================================

export interface ListProductsParams {
  categoryId?: string;
  commercialType?: CommercialType;
  active?: boolean;
  featured?: boolean;
  search?: string; // ✅ ADICIONADO – necessário para o campo de busca
}

// ============================================================
// UPLOAD
// ============================================================

export interface ProductUploadResponse {
  success: boolean;
  message?: string;
  data: {
    url: string;
    path: string;
    filename: string;
    size: number;
    mimeType: string;
    bucket: string;
  };
}

/**
 * Representa o estado da imagem no formulário.
 * Enquanto o upload não acontece, guardamos apenas o File local
 * e geramos preview via FileReader.
 * Após o upload, guardamos a resposta do Backend (url/path/etc).
 */
export interface ProductImageState {
  /** arquivo selecionado localmente, ainda não enviado */
  file?: File;
  /** URL para preview (pode ser blob: ou a url do storage) */
  previewUrl: string;
  /** metadados já recebidos do upload (após POST /api/product/upload) */
  uploaded?: {
    url: string;
    path: string;
    filename: string;
    size: number;
    mimeType: string;
    bucket: string;
  };
}