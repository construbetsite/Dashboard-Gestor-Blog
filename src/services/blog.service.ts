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
  categoriaId?: string | null;          // ✅ UUID da categoria
  category?: string | null;             // ✅ NOME LEGÍVEL (OBRIGATÓRIO)
  imageUrl?: string | null;             // ✅ camelCase (vindo do upload)
  imagePath?: string | null;            // ✅ camelCase
  imageFilename?: string | null;        // ✅ camelCase
  imageSize?: number | null;            // ✅ camelCase
  imageMimeType?: string | null;        // ✅ camelCase
  storageBucket?: string | null;        // ✅ camelCase
  readingTime?: string;                 // ✅ camelCase
  slug?: string;
  featured?: boolean;
  status?: boolean;
  video1?: string;
  video2?: string;
  author?: string;
  authorImage?: string;                 // ✅ camelCase
  tags?: string[];
  publishedAt?: string | null;          // ✅ camelCase
}

// ✅ Validação de UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// ✅ Validação de URL
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ✅ Função para normalizar e validar payload antes de enviar
// REGRA DE OURO: SEMPRE envie AMBOS: categoriaId (UUID) E category (nome)
function normalizeToBackend(data: any): any {
  const result: any = {};
  
  // ✅ CAMPOS OBRIGATÓRIOS
  if (!data.title || !data.title.trim()) {
    console.error("❌ [normalizeToBackend] Campo 'title' é obrigatório");
    throw new Error("Título é obrigatório");
  }
  if (!data.description || !data.description.trim()) {
    console.error("❌ [normalizeToBackend] Campo 'description' é obrigatório");
    throw new Error("Descrição é obrigatória");
  }
  
  result.title = data.title.trim();
  result.description = data.description.trim();

  // ✅ CAMPOS OPCIONAIS - apenas incluir se tiverem valor
  if (data.content) result.content = data.content;
  
  // ✅ CATEGORIA - ENVIAR AMBOS: UUID (categoriaId) E NOME (category)
  if (data.categoriaId) {
    if (!isValidUUID(data.categoriaId)) {
      console.error("❌ [normalizeToBackend] categoriaId inválido (não é UUID):", data.categoriaId);
      throw new Error("categoriaId deve ser um UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)");
    }
    result.categoriaId = data.categoriaId;
  }
  
  // ✅ category (nome legível) – OBRIGATÓRIO para a coluna NOT NULL
  if (data.category) {
    result.category = data.category.trim();
  } else {
    console.error("❌ [normalizeToBackend] Campo 'category' (nome) é obrigatório");
    throw new Error("Nome da categoria é obrigatório");
  }

  // ✅ IMAGEM - enviar em camelCase (imageUrl, imagePath, etc)
  // NUNCA enviar campo "image" (singular)
  if (data.imageUrl) {
    if (!isValidURL(data.imageUrl)) {
      console.error("❌ [normalizeToBackend] imageUrl inválido:", data.imageUrl);
      throw new Error("imageUrl deve ser uma URL válida");
    }
    result.imageUrl = data.imageUrl.trim();
  }
  if (data.imagePath) result.imagePath = data.imagePath.trim();
  if (data.imageFilename) result.imageFilename = data.imageFilename.trim();
  if (data.imageSize !== undefined && data.imageSize > 0) result.imageSize = data.imageSize;
  if (data.imageMimeType) result.imageMimeType = data.imageMimeType.trim();
  if (data.storageBucket) result.storageBucket = data.storageBucket.trim();

  // ✅ Outros campos
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

  // ✅ AVISOS DE SEGURANÇA (apenas informativos)
  if ('image' in data) {
    console.warn("⚠️ [normalizeToBackend] Campo 'image' (singular) detectado. Use 'imageUrl' em vez disso.");
  }
  if ('categoria_id' in data) {
    console.warn("⚠️ [normalizeToBackend] Campo 'categoria_id' (snake_case) detectado. Use 'categoriaId' (camelCase).");
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

  buscarPorId: (id: string) =>
    api.get(`/blog/posts/id/${encodeURIComponent(id)}`) as Promise<BlogItemResponse>,

  buscarPorSlug: (slug: string) =>
    api.get(`/blog/posts/slug/${encodeURIComponent(slug)}`) as Promise<BlogItemResponse>,

  // ✅ UPLOAD DE IMAGEM (multipart/form-data)
  // ⚠️ IMPORTANTE: NÃO definir Content-Type manualmente para FormData
  // Deixar o navegador/fetch definir automaticamente (com boundary correto)
  uploadImage: (formData: FormData) => {
    return api.post("/blog/upload", formData) as Promise<UploadImageResponse>;
  },

  // ✅ Criar - normalizar dados e validar contrato de API
  criar: (dados: Partial<PostPayload>) => {
    const normalized = normalizeToBackend(dados);
    console.log("📤 [blogService.criar] Payload normalizado (camelCase):");
    console.log(JSON.stringify(normalized, null, 2));
    console.log("✅ [blogService.criar] Verificação:", {
      temTitle: !!normalized.title,
      temDescription: !!normalized.description,
      temCategoriaId: !!normalized.categoriaId,
      temCategory: !!normalized.category,
      contemImageField: 'image' in normalized ? "❌" : "✅",
    });
    return api.post("/blog/posts", normalized) as Promise<BlogItemResponse>;
  },

  // ✅ Editar - normalizar dados e validar contrato de API
  editar: (id: string, dados: Partial<PostPayload>) => {
    const normalized = normalizeToBackend(dados);
    console.log(`📤 [blogService.editar] ID: ${id}`);
    console.log("📤 [blogService.editar] Payload normalizado (camelCase):");
    console.log(JSON.stringify(normalized, null, 2));
    console.log("✅ [blogService.editar] Verificação:", {
      temTitle: !!normalized.title,
      temDescription: !!normalized.description,
      temCategoriaId: !!normalized.categoriaId,
      temCategory: !!normalized.category,
      contemImageField: 'image' in normalized ? "❌" : "✅",
    });
    return api.put(`/blog/posts/${encodeURIComponent(id)}`, normalized) as Promise<BlogItemResponse>;
  },

  deletar: (id: string) => api.delete(`/blog/posts/${encodeURIComponent(id)}`),

  listarCategorias: () =>
    api.get("/blog/categorias") as Promise<{ data: BlogCategoria[] }>,
};

export const blogApi = blogService;