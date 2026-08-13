import { useState } from "react";
import { blogService } from "../services/blog.service";
import type { BlogPost, UpdateBlogPostInput } from "../types/blog";

interface UseUpdatePostResult {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  updatePost: (id: number | string, data: UpdateBlogPostInput) => Promise<BlogPost | null>;
}

export function useUpdatePost(): UseUpdatePostResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updatePost = async (
    id: number | string,
    data: UpdateBlogPostInput,
  ): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      console.log(`📝 [useUpdatePost] Atualizando post ID: ${id}`, data);
      const res = await blogService.editar(String(id), data);
      return res.data;
    } catch (e: any) {
      console.error("❌ [useUpdatePost] Erro:", e);
      const message = e?.message || "Erro ao atualizar post";
      setError(message);
      if (e?.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(e.errors as Record<string, string[]>)) {
          mapped[key] = msgs[0];
        }
        setFieldErrors(mapped);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fieldErrors, updatePost };
}