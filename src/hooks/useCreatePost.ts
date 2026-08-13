import { useState } from "react";
import { blogService } from "../services/blog.service";
import type { BlogPost, CreateBlogPostInput } from "../types/blog";

interface UseCreatePostResult {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  createPost: (data: CreateBlogPostInput) => Promise<BlogPost | null>;
}

export function useCreatePost(): UseCreatePostResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createPost = async (data: CreateBlogPostInput): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      console.log("📝 [useCreatePost] Criando post:", data);
      const res = await blogService.criar(data);
      return res.data;
    } catch (e: any) {
      console.error("❌ [useCreatePost] Erro:", e);
      const message = e?.message || "Erro ao criar post";
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

  return { loading, error, fieldErrors, createPost };
}