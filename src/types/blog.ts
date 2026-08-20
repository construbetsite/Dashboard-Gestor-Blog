// ============================================================
// BLOG - TIPOS COMPLETOS
// ============================================================

export type PostType = "article" | "video" | "news";

// ============================================================
// CATEGORIA
// ============================================================

/** Categoria pré-definida do blog (tabela `blog_categorias`). */
export interface BlogCategoria {
  id: string;
  nome: string;
  descricao?: string | null;
}

/** Categoria resumida para selects */
export interface BlogCategoriaResumida {
  id: string;
  nome: string;
}


// ============================================================
// BLOG POST - PRINCIPAL (snake_case para consistência com Supabase)
// ============================================================

export interface BlogPost {
  id: string;              // UUID
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;        // Nome da categoria (texto)
  categoria_id: string;    // UUID da categoria
  reading_time: string;
  type: PostType | string;
  featured: boolean;
  status: boolean;
  image_url?: string | null;
  image_path?: string | null;
  image_filename?: string | null;
  image_size?: number | null;
  image_mime_type?: string | null;
  storage_bucket?: string | null;
  video1?: string;
  video2?: string;
  author?: string;
  author_image?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Relacionamento com a categoria (populado pela API)
  categoria?: BlogCategoria;
}

// ============================================================
// INPUTS PARA CRIAÇÃO/ATUALIZAÇÃO (PAYLOAD DO FRONTEND - camelCase)
// ============================================================

/**
 * Payload para criação/atualização de post (Frontend → Backend).
 * ✅ Backend espera AMBOS categoriaId (UUID) e category (string)
 * ✅ Todos os campos em camelCase
 * ✅ imageUrl/imagePath (vindo do upload), NÃO enviar campo "image"
 */
export interface CreatePostPayload {
  // ✅ OBRIGATÓRIOS
  title: string;
  description: string;
  categoriaId: string;              // UUID da categoria (OBRIGATÓRIO)
  category: string;                 // Nome da categoria (OBRIGATÓRIO)
  
  // ✅ OPCIONAIS
  content?: string;
  slug?: string;
  readingTime?: string;
  type?: PostType | string;
  featured?: boolean;
  status?: boolean;
  video1?: string | null;
  video2?: string | null;
  author?: string | null;
  authorImage?: string | null;
  tags?: string[];
  imageUrl?: string | null;
  imagePath?: string | null;
  imageFilename?: string | null;
  imageSize?: number | null;
  imageMimeType?: string | null;
  storageBucket?: string | null;
  publishedAt?: string | null;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

/**
 * Versão legada (snake_case) mantida para compatibilidade
 * @deprecated Use CreatePostPayload (camelCase) em vez disso
 */
export type CreateBlogPostInput = {
  title: string;
  description: string;
  content: string;
  image_url?: string | null;
  category: string;
  categoria_id?: string | null;
  reading_time?: string;
  type?: PostType | string;
  featured?: boolean;
  status?: boolean;
  video1?: string;
  video2?: string;
  author?: string;
  author_image?: string;
  tags?: string[];
  slug?: string;
  published_at?: string | null;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

// ============================================================
// RESPOSTAS DA API
// ============================================================

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface BlogItemResponse {
  success: boolean;
  data: BlogPost;
  message?: string;
}

export interface ListBlogPostsParams {
  page: number;
  limit: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  status?: boolean;
}