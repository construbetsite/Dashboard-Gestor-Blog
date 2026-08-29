// ============================================================
// useLandingCategoryById
// ============================================================
//
// Busca uma única categoria pelo ID (usado no formulário de
// edição).

import { useCallback, useEffect, useState } from "react";
import { landingCategoryService } from "../services/landingCategory.service";
import { errorMessage } from "../utils/errors";
import type { LandingCategory } from "../types/landingCategory";

export interface UseLandingCategoryByIdResult {
  category: LandingCategory | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLandingCategoryById(id?: number) {
  const [category, setCategory] = useState<LandingCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(id != null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (id == null) {
      setCategory(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await landingCategoryService.buscarPorId(id);
      setCategory(data);
    } catch (e) {
      console.error("❌ [useLandingCategoryById] Erro:", e);
      setError(errorMessage(e, "Erro ao carregar categoria."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { category, loading, error, refetch };
}
