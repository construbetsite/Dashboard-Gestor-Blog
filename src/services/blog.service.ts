import { api } from "./api.service";
import type {
  BlogCategoria,
  BlogListResponse,
  BlogItemResponse,
  ListBlogPostsParams,
} from "../types/blog";

export interface UploadImageResponse {
  success: boolean;
  message?: string;
  data: {
    url: string;
    path: string;
  };
}

export interface PostPayload {
  title: string;
  description: string;
  content?: string;
  categoriaId?: string | null;          // âœ… UUID da categoria
  category?: string | null;             // âœ… NOME LEGÃVEL (OBRIGATÃ“RIO)
  imageUrl?: string | null;             // âœ… camelCase (vindo do upload)
  imagePath?: string | null;            // âœ… camelCase
  imageFilename?: string | null;        // âœ… camelCase
  imageSize?: number | null;            // âœ… camelCase
  imageMimeType?: string | null;        // âœ… camelCase
  storageBucket?: string | null;        // âœ… camelCase
  readingTime?: string;                 // âœ… camelCase
  slug?: string;
  featured?: boolean;
  status?: boolean;
  video1?: string;
  video2?: string;
  author?: string;
  authorImage?: string;                 // âœ… camelCase
  tags?: string[];
  publishedAt?: string | null;          // âœ… camelCase
  productIds?: string[];                // âœ… camelCase (backend converte para product_ids)
}

// âœ… ValidaÃ§Ã£o de UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// âœ… ValidaÃ§Ã£o de URL
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// âœ… FunÃ§Ã£o para normalizar e validar payload antes de enviar
// REGRA DE OURO: SEMPRE envie AMBOS: categoriaId (UUID) E category (nome)
function normalizeToBackend(data: any): any {
  const result: any = {};
  
  // âœ… CAMPOS OBRIGATÃ“RIOS
  if (!data.title || !data.title.trim()) {
    console.error("âŒ [normalizeToBackend] Campo 'title' Ã© obrigatÃ³rio");
    throw new Error("TÃ­tulo Ã© obrigatÃ³rio");
  }
  if (!data.description || !data.description.trim()) {
    console.error("âŒ [normalizeToBackend] Campo 'description' Ã© obrigatÃ³rio");
    throw new Error("DescriÃ§Ã£o Ã© obrigatÃ³ria");
  }
  
  result.title = data.title.trim();
  result.description = data.description.trim();

  // âœ… CAMPOS OPCIONAIS - apenas incluir se tiverem valor
  if (data.content) result.content = data.content;
  
  // âœ… CATEGORIA - ENVIAR AMBOS: UUID (categoriaId) E NOME (category)
  if (data.categoriaId) {
    if (!isValidUUID(data.categoriaId)) {
      console.error("âŒ [normalizeToBackend] categoriaId invÃ¡lido (nÃ£o Ã© UUID):", data.categoriaId);
      throw new Error("categoriaId deve ser um UUID vÃ¡lido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)");
    }
    result.categoriaId = data.categoriaId;
  }
  
  // âœ… category (nome legÃ­vel) â€“ OBRIGATÃ“RIO para a coluna NOT NULL
  if (data.category) {
    result.category = data.category.trim();
  } else {
    console.error("âŒ [normalizeToBackend] Campo 'category' (nome) Ã© obrigatÃ³rio");
    throw new Error("Nome da categoria Ã© obrigatÃ³rio");
  }

  // âœ… IMAGEM - enviar em camelCase (imageUrl, imagePath, etc)
  // NUNCA enviar campo "image" (singular)
  if (data.imageUrl) {
    if (!isValidURL(data.imageUrl)) {
      console.error("âŒ [normalizeToBackend] imageUrl invÃ¡lido:", data.imageUrl);
      throw new Error("imageUrl deve ser uma URL vÃ¡lida");
    }
    result.imageUrl = data.imageUrl.trim();
  }
  if (data.imagePath) result.imagePath = data.imagePath.trim();
  if (data.imageFilename) result.imageFilename = data.imageFilename.trim();
  if (data.imageSize !== undefined && data.imageSize > 0) result.imageSize = data.imageSize;
  if (data.imageMimeType) result.imageMimeType = data.imageMimeType.trim();
  if (data.storageBucket) result.storageBucket = data.storageBucket.trim();

  // âœ… Outros campos
  if (data.slug) result.slug = data.slug.trim();
  if (data.readingTime) result.readingTime = data.readingTime.trim();
  if (data.type) result.type = data.type;
  if (data.featured !== undefined) result.featured = data.featured;
  if (data.status !== undefined) result.status = data.status;
  if (data.video1) result.video1 = data.video1.trim();
  if (data.video2) result.video2 = data.video2.trim();
  if (data.author) result.author = data.author.trim();
  if (data.authorImage) result.authorImage = data.authorImage.trim();
  if (data.publishedAt) result.publishedAt = data.publishedAt.trim();
  
  // Tags
  if (Array.isArray(data.tags) && data.tags.length > 0) {
    result.tags = data.tags;
  }
  // âœ… PRODUTOS VINCULADOS (array de UUIDs; aceita [] para limpar)
  if (Array.isArray(data.productIds)) {
    result.productIds = data.productIds;
  }

  // âœ… AVISOS DE SEGURANÃ‡A (apenas informativos)
  if ('image' in data) {
    console.warn("âš ï¸ [normalizeToBackend] Campo 'image' (singular) detectado. Use 'imageUrl' em vez disso.");
  }
  if ('categoria_id' in data) {
    console.warn("âš ï¸ [normalizeToBackend] Campo 'categoria_id' (snake_case) detectado. Use 'categoriaId' (camelCase).");
  }

  return result;
}

export const blogService = {
  listar: (params?: ListBlogPostsParams) => {
    const query = new URLSearchParams();
    if (params?.page != null) query.set("page", String(params.page));
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    if (params?.featured != null) query.set("featured", String(params.featured));
    if (params?.status != null) query.set("status", String(params.status));

    const qs = query.toString();
    return api.get(`/blog/posts${qs ? `?${qs}` : ""}`) as Promise<BlogListResponse>;
  },

  buscarPorId: (id: string, includeProducts = false) =>
    api.get(`/blog/posts/id/${encodeURIComponent(id)}${includeProducts ? "?include=products" : ""}`) as Promise<BlogItemResponse>,

  buscarPorSlug: (slug: string) =>
    api.get(`/blog/posts/slug/${encodeURIComponent(slug)}`) as Promise<BlogItemResponse>,

  // âœ… UPLOAD DE IMAGEM (multipart/form-data)
  // âš ï¸ IMPORTANTE: NÃƒO definir Content-Type manualmente para FormData
  // Deixar o navegador/fetch definir automaticamente (com boundary correto)
  uploadImage: (formData: FormData) => {
    return api.post("/blog/upload", formData) as Promise<UploadImageResponse>;
  },

  // âœ… Criar - normalizar dados e validar contrato de API
  criar: (dados: Partial<PostPayload>) => {
    const normalized = normalizeToBackend(dados);
    console.log("ðŸ“¤ [blogService.criar] Payload normalizado (camelCase):");
    console.log(JSON.stringify(normalized, null, 2));
    console.log("âœ… [blogService.criar] VerificaÃ§Ã£o:", {
      temTitle: !!normalized.title,
      temDescription: !!normalized.description,
      temCategoriaId: !!normalized.categoriaId,
      temCategory: !!normalized.category,
      contemImageField: 'image' in normalized ? "âŒ" : "âœ…",
    });
    return api.post("/blog/posts", normalized) as Promise<BlogItemResponse>;
  },

  // âœ… Editar - normalizar dados e validar contrato de API
  editar: (id: string, dados: Partial<PostPayload>) => {
    const normalized = normalizeToBackend(dados);
    console.log(`ðŸ“¤ [blogService.editar] ID: ${id}`);
    console.log("ðŸ“¤ [blogService.editar] Payload normalizado (camelCase):");
    console.log(JSON.stringify(normalized, null, 2));
    console.log("âœ… [blogService.editar] VerificaÃ§Ã£o:", {
      temTitle: !!normalized.title,
      temDescription: !!normalized.description,
      temCategoriaId: !!normalized.categoriaId,
      temCategory: !!normalized.category,
      contemImageField: 'image' in normalized ? "âŒ" : "âœ…",
    });
    return api.put(`/blog/posts/${encodeURIComponent(id)}`, normalized) as Promise<BlogItemResponse>;
  },

  deletar: (id: string) => api.delete(`/blog/posts/${encodeURIComponent(id)}`),

  listarCategorias: () =>
    api.get("/blog/categorias") as Promise<{ data: BlogCategoria[] }>,
};

export const blogApi = blogService;

