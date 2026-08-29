// ============================================================
// BLOG - TIPOS COMPLETOS
// ============================================================

export type PostType = "article" | "video" | "news";

// ============================================================
// CATEGORIA
// ============================================================

/** Categoria prÃ©-definida do blog (tabela `blog_categorias`). */
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
// BLOG POST - PRINCIPAL (snake_case para consistÃªncia com Supabase)
// ============================================================

export interface BlogPostProduct {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
}
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
  // âœ… Produtos vinculados (admin + ?include=products)
  product_ids?: string[];
  products?: BlogPostProduct[];
}

// ============================================================
// INPUTS PARA CRIAÃ‡ÃƒO/ATUALIZAÃ‡ÃƒO (PAYLOAD DO FRONTEND - camelCase)
// ============================================================

/**
 * Payload para criaÃ§Ã£o/atualizaÃ§Ã£o de post (Frontend â†’ Backend).
 * âœ… Backend espera AMBOS categoriaId (UUID) e category (string)
 * âœ… Todos os campos em camelCase
 * âœ… imageUrl/imagePath (vindo do upload), NÃƒO enviar campo "image"
 */
export interface CreatePostPayload {
  // âœ… OBRIGATÃ“RIOS
  title: string;
  description: string;
  categoriaId: string;              // UUID da categoria (OBRIGATÃ“RIO)
  category: string;                 // Nome da categoria (OBRIGATÃ“RIO)
  
  // âœ… OPCIONAIS
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
 * VersÃ£o legada (snake_case) mantida para compatibilidade
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
