// ============================================================
// PRODUCT CATEGORY SERVICE
// ============================================================
//
// ✅ Reusa o cliente HTTP central (services/api.service.ts)
// ✅ Endpoints validados no Backend (src/modules/product/routes/productCategoryRoutes.ts)

import { api } from "./api.service";
import type {
  CreateProductCategoryPayload,
  ProductCategory,
  UpdateProductCategoryPayload,
  ListProductCategoriesParams,
} from "../types/productCategory";

// ============================================================
// NORMALIZAÇÃO
// ============================================================

function normalizeCategoryPayload(
  data: Partial<CreateProductCategoryPayload>,
  mode: 'create' | 'update' = 'create'
): Partial<CreateProductCategoryPayload> {
  const result: Partial<CreateProductCategoryPayload> = {};

  if (mode === 'create') {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome da categoria é obrigatório.');
    }
    result.name = data.name.trim();
  } else if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error('Nome da categoria é obrigatório.');
    }
    result.name = data.name.trim();
  }

  if (data.slug !== undefined && data.slug.trim()) {
    result.slug = data.slug.trim();
  }

  if (data.description !== undefined) {
    result.description = data.description?.trim() || null;
  }

  if (data.imageUrl !== undefined) {
    result.imageUrl = data.imageUrl?.trim() || null;
  }

  if (data.imagePath !== undefined) {
    result.imagePath = data.imagePath?.trim() || null;
  }

  if (data.parentId !== undefined) {
    result.parentId = data.parentId || null;
  }

  if (data.active !== undefined) {
    result.active = data.active;
  }

  if (data.displayOrder !== undefined) {
    result.displayOrder = data.displayOrder;
  }

  return result;
}

// ============================================================
// SERVICE
// ============================================================

export const productCategoryService = {
  listar(
    params?: ListProductCategoriesParams
  ): Promise<ProductCategory[]> {
    const query = new URLSearchParams();
    if (params?.active !== undefined) {
      query.set('active', String(params.active));
    }
    if (params?.parentId !== undefined) {
      query.set(
        'parentId',
        params.parentId === null ? 'null' : String(params.parentId)
      );
    }
    const qs = query.toString();
    return api.get<ProductCategory[]>(
      `/product-categories${qs ? `?${qs}` : ''}`
    );
  },

  buscarPorId(id: string): Promise<ProductCategory> {
    return api.get<ProductCategory>(
      `/product-categories/${encodeURIComponent(id)}`
    );
  },

  buscarPorSlug(slug: string): Promise<ProductCategory> {
    return api.get<ProductCategory>(
      `/product-categories/slug/${encodeURIComponent(slug)}`
    );
  },

  criar(
    dados: CreateProductCategoryPayload
  ): Promise<ProductCategory> {
    const normalized = normalizeCategoryPayload(dados, 'create');
    return api.post<ProductCategory>('/product-categories', normalized);
  },

  editar(
    id: string,
    dados: UpdateProductCategoryPayload
  ): Promise<ProductCategory> {
    const normalized = normalizeCategoryPayload(dados, 'update');
    return api.put<ProductCategory>(
      `/product-categories/${encodeURIComponent(id)}`,
      normalized
    );
  },

  deletar(id: string): Promise<void> {
    return api.delete(`/product-categories/${encodeURIComponent(id)}`);
  },
};

export const productCategoryApi = productCategoryService;
