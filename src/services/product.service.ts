// ============================================================
// PRODUCT SERVICE
// ============================================================
//
// ✅ Reusa o cliente HTTP central (services/api.service.ts)
// ✅ Endpoints validados no Backend (src/modules/product/routes/productRoutes.ts)
// ✅ O Backend retorna o objeto/array DIRETO (sem envelope {success,data})
//    nas rotas /api/product — apenas o upload usa envelope.

import { api } from "./api.service";
import type {
  CommercialType,
  CreateProductPayload,
  Product,
  UpdateProductPayload,
  ListProductsParams,
} from "../types/product";

// ============================================================
// VALIDAÇÕES AUXILIARES (mesmas regras do backend)
// ============================================================

export const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================================
// NORMALIZAÇÃO DO PAYLOAD
// ============================================================
//
// Backend já normaliza camelCase ↔ snake_case, mas aqui garantimos:
// - enviar somente campos com valor
// - validar regras comerciais (defesa em profundidade)
// - devolver mensagens amigáveis se o Front tentar enviar combinação inválida

function normalizeProductPayload(
  data: Partial<CreateProductPayload>,
  mode: 'create' | 'update' = 'create'
): Partial<CreateProductPayload> {
  const result: Partial<CreateProductPayload> = {};

  // ----- obrigatórios (create) -----
  if (mode === 'create') {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome é obrigatório.');
    }
    if (!data.description || !String(data.description).trim()) {
      throw new Error('Descrição é obrigatória.');
    }
    if (!data.categoryId) {
      throw new Error('Categoria é obrigatória.');
    }
    if (!isValidUUID(data.categoryId)) {
      throw new Error('Categoria inválida (UUID esperado).');
    }
    if (!data.commercialType) {
      throw new Error('Tipo comercial é obrigatório.');
    }
    result.name = data.name.trim();
    result.description = String(data.description);
    result.categoryId = data.categoryId;
    result.commercialType = data.commercialType;
  } else {
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.description !== undefined)
      result.description = String(data.description);
    if (data.categoryId !== undefined) {
      if (!isValidUUID(data.categoryId)) {
        throw new Error('Categoria inválida (UUID esperado).');
      }
      result.categoryId = data.categoryId;
    }
    if (data.commercialType !== undefined) {
      result.commercialType = data.commercialType;
    }
  }

  // ----- opcionais -----
  if (data.slug !== undefined && data.slug.trim()) result.slug = data.slug.trim();
  if (data.sku !== undefined) result.sku = data.sku?.trim() || null;
  if (data.brand !== undefined) result.brand = data.brand?.trim() || null;
  if (data.shortDescription !== undefined)
    result.shortDescription = data.shortDescription?.trim() || null;

  // ----- regras comerciais (defesa em profundidade) -----
  const ct: CommercialType | undefined =
    result.commercialType ?? data.commercialType;

  if (ct === 'PICKUP') {
    if (data.price !== undefined) {
      if (data.price === null || Number.isNaN(data.price)) {
        throw new Error('Produtos de retirada (PICKUP) devem possuir preço.');
      }
      if (data.price < 0) {
        throw new Error('O preço não pode ser negativo.');
      }
      result.price = data.price;
    } else if (mode === 'create') {
      throw new Error('Produtos de retirada (PICKUP) devem possuir preço.');
    }
    if (
      data.redirectUrl !== undefined &&
      data.redirectUrl !== null &&
      data.redirectUrl !== ''
    ) {
      throw new Error(
        'Produtos de retirada (PICKUP) não devem possuir URL de e-commerce.'
      );
    }
  }

  if (ct === 'ECOMMERCE') {
    if (data.price !== undefined && data.price !== null) {
      throw new Error(
        'Produtos de e-commerce não devem possuir preço.'
      );
    }
    if (data.redirectUrl !== undefined) {
      if (
        data.redirectUrl === null ||
        data.redirectUrl.trim() === ''
      ) {
        if (mode === 'create') {
          throw new Error(
            'Produtos de e-commerce devem possuir URL de encaminhamento.'
          );
        }
      } else if (!isValidURL(data.redirectUrl)) {
        throw new Error('URL do e-commerce inválida.');
      } else {
        result.redirectUrl = data.redirectUrl.trim();
      }
    } else if (mode === 'create') {
      throw new Error(
        'Produtos de e-commerce devem possuir URL de encaminhamento.'
      );
    }
  }

  // ----- imagem -----
  if (data.imageUrl !== undefined) {
    if (data.imageUrl && !isValidURL(data.imageUrl)) {
      throw new Error('URL da imagem inválida.');
    }
    result.imageUrl = data.imageUrl || null;
  }
  if (data.imagePath !== undefined) result.imagePath = data.imagePath || null;
  if (data.imageFilename !== undefined)
    result.imageFilename = data.imageFilename || null;
  if (data.imageSize !== undefined)
    result.imageSize = data.imageSize ?? null;
  if (data.imageMimeType !== undefined)
    result.imageMimeType = data.imageMimeType || null;
  if (data.storageBucket !== undefined)
    result.storageBucket = data.storageBucket || null;

  // ----- controle -----
  if (data.featured !== undefined) result.featured = data.featured;
  if (data.displayOrder !== undefined) result.displayOrder = data.displayOrder;
  if (data.active !== undefined) result.active = data.active;
  if (data.metaTitle !== undefined)
    result.metaTitle = data.metaTitle?.trim() || null;
  if (data.metaDescription !== undefined)
    result.metaDescription = data.metaDescription?.trim() || null;

  return result;
}

// ============================================================
// SERVICE
// ============================================================

export const productService = {
  listar(params?: ListProductsParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.commercialType) query.set('commercialType', params.commercialType);
    if (params?.active !== undefined) query.set('active', String(params.active));
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.search) query.set('search', params.search); // ✅ CORREÇÃO AQUI

    const qs = query.toString();
    return api.get<Product[]>(`/product${qs ? `?${qs}` : ''}`);
  },

  buscarPorId(id: string): Promise<Product> {
    return api.get<Product>(`/product/${encodeURIComponent(id)}`);
  },

  buscarPorSlug(slug: string): Promise<Product> {
    return api.get<Product>(`/product/slug/${encodeURIComponent(slug)}`);
  },

  criar(dados: CreateProductPayload): Promise<Product> {
    const normalized = normalizeProductPayload(dados, 'create');
    return api.post<Product>('/product', normalized);
  },

  editar(id: string, dados: UpdateProductPayload): Promise<Product> {
    const normalized = normalizeProductPayload(dados, 'update');
    return api.put<Product>(`/product/${encodeURIComponent(id)}`, normalized);
  },

  deletar(id: string): Promise<void> {
    return api.delete(`/product/${encodeURIComponent(id)}`);
  },
};

export const productApi = productService;