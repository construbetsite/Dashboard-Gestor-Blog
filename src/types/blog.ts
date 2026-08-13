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
  image: string;
  category: string;        // Nome da categoria (texto)
  categoria_id: string;    // UUID da categoria
  reading_time: string;
  type: PostType | string;
  featured: boolean;
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
// INPUTS PARA CRIAÇÃO/ATUALIZAÇÃO
// ============================================================

export type CreateBlogPostInput = {
  title: string;
  description: string;
  content: string;
  image?: string;
  category: string;
  categoria_id?: string | null;
  reading_time?: string;
  type?: PostType | string;
  featured?: boolean;
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
}