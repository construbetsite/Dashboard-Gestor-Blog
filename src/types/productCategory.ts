// ============================================================
// PRODUCT CATEGORY - TIPOS COMPLETOS
// ============================================================
//
// ✅ Contrato fiel ao Backend (src/modules/product/types/ProductCategory.ts)
// ✅ camelCase no payload (Backend normaliza)

export interface ProductCategory {
  id: string;

  name: string;
  slug: string;
  description: string | null;

  imageUrl: string | null;

  parentId: string | null;

  active: boolean;
  displayOrder: number;

  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PAYLOADS
// ============================================================

export interface CreateProductCategoryPayload {
  name: string;
  description?: string | null;
  slug?: string;
  imageUrl?: string | null;
  imagePath?: string | null;
  parentId?: string | null;
  active?: boolean;
  displayOrder?: number;
}

export type UpdateProductCategoryPayload = Partial<CreateProductCategoryPayload>;

// ============================================================
// LISTAGEM
// ============================================================

export interface ListProductCategoriesParams {
  active?: boolean;
  parentId?: string | null;
}
