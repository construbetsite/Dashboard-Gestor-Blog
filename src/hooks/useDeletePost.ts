import { useState } from "react";
import { blogService } from "../services/blog.service";

interface UseDeletePostResult {
  loading: boolean;
  error: string | null;
  deletePost: (id: number | string) => Promise<boolean>;
}

export function useDeletePost(): UseDeletePostResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePost = async (id: number | string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ [useDeletePost] Deletando post ID: ${id}`);
      await blogService.deletar(String(id));
      return true;
    } catch (e: any) {
      console.error("❌ [useDeletePost] Erro:", e);
      setError(e?.message || "Erro ao excluir post");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deletePost };
}