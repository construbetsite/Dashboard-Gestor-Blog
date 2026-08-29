import { useCallback, useEffect, useState } from "react";
import { blogService } from "../services/blog.service";
import type { BlogPost } from "../types/blog";

interface UseBlogPostResult {
  post: BlogPost | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

/** Busca um post pelo slug (pÃºblico) ou pelo id (admin). */
export function useBlogPost(
  slugOrId?: string,
  mode: "slug" | "id" = "slug",
  autoFetch = true,
): UseBlogPostResult {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(!!slugOrId && autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!slugOrId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setNotFound(false);
    
    try {
      let response;
      
      if (mode === "slug") {
        // âœ… Buscar por Slug
        response = await blogService.buscarPorSlug(slugOrId);
      } else {
        // âœ… Buscar por ID
        // âœ… Admin: carrega com ?include=products para pré-seleção do ProductMultiSelect
        response = await blogService.buscarPorId(slugOrId, true);
      }
      
      setPost(response.data);
    } catch (e: any) {
      console.error("âŒ Erro ao buscar post:", e);
      
      if (e?.status === 404 || e?.message?.includes("404")) {
        setNotFound(true);
        setPost(null);
      } else {
        setError(e?.message || "Erro ao carregar post");
      }
    } finally {
      setLoading(false);
    }
  }, [slugOrId, mode]);

  useEffect(() => {
    if (autoFetch && slugOrId) {
      void fetchPost();
    }
  }, [slugOrId, mode, autoFetch, fetchPost]);

  return { post, loading, error, notFound, refetch: fetchPost };
}

