import { api } from "./api.service";
import type {

  BlogCategoria,
  BlogListResponse,
  BlogItemResponse,
} from "../types/blog";

export interface PostPayload {
  title: string;
  description: string;
  content?: string;
  category?: string;
  categoria_id?: string | null;
  image?: string;
  reading_time?: string;
  readingTime?: string;  // ✅ Suporte a camelCase
  slug?: string;
  featured?: boolean;
  video1?: string;
  video2?: string;
  author?: string;
  author_image?: string;
  authorImage?: string;  // ✅ Suporte a camelCase
  tags?: string[];
  published_at?: string | null;
}

// ✅ Função para normalizar campos (snake_case -> camelCase)
function normalizeToBackend(data: any): any {
  const result = { ...data };
  
  // Mapear snake_case para camelCase
  const mapping: Record<string, string> = {
    reading_time: 'readingTime',
    author_image: 'authorImage',
  };
  
  for (const [snake, camel] of Object.entries(mapping)) {
    if (result[snake] !== undefined) {
      result[camel] = result[snake];
      delete result[snake];
    }
  }
  
  return result;
}

export const blogService = {
  listar: (params?: { page?: number; limit?: number; category?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page != null) query.set("page", String(params.page));
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    if (params?.featured != null) query.set("featured", String(params.featured));
    
    const qs = query.toString();
    return api.get(`/blog/posts${qs ? `?${qs}` : ""}`) as Promise<BlogListResponse>;
  },

  buscarPorId: (id: string) =>
    api.get(`/blog/posts/id/${encodeURIComponent(id)}`) as Promise<BlogItemResponse>,

  buscarPorSlug: (slug: string) =>
    api.get(`/blog/posts/slug/${encodeURIComponent(slug)}`) as Promise<BlogItemResponse>,

  // ✅ Criar - normalizar dados
  criar: (dados: Partial<PostPayload>) => {
    const normalized = normalizeToBackend(dados);
    console.log("📤 [criar] Dados normalizados:", normalized);
    return api.post("/blog/posts", normalized) as Promise<BlogItemResponse>;
  },

  // ✅ Editar - normalizar dados
  editar: (id: string, dados: Partial<PostPayload>) => {
    const normalized = normalizeToBackend(dados);
    console.log(`📤 [editar] ID: ${id}`);
    console.log("📤 [editar] Dados normalizados:", normalized);
    return api.put(`/blog/posts/${encodeURIComponent(id)}`, normalized) as Promise<BlogItemResponse>;
  },

  deletar: (id: string) => api.delete(`/blog/posts/${encodeURIComponent(id)}`),

  listarCategorias: () =>
    api.get("/blog/categorias") as Promise<{ data: BlogCategoria[] }>,
};

export const blogApi = blogService;