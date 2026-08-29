// ============================================================
// useLandingCategories
// ============================================================
//
// Lista as categorias da landing page (admin = todas) com
// suporte a filtro por `active` e refetch manual.
//
// Implementação com hooks nativos (padrão do projeto - sem
// React Query instalado).

import { useCallback, useEffect, useState } from "react";
import { landingCategoryService } from "../services/landingCategory.service";
import { errorMessage } from "../utils/errors";
import type {
  LandingCategory,
  ListLandingCategoriesParams,
} from "../types/landingCategory";

export interface UseLandingCategoriesResult {
  /** Todas as categorias (determináveis pela API, sem `active`) */
  categories: LandingCategory[];
  loading: boolean;
  error: string | null;
  filters: ListLandingCategoriesParams;
  setFilters: (next: ListLandingCategoriesParams) => void;
  refetch: () => Promise<void>;
}

export function useLandingCategories(
  initial: ListLandingCategoriesParams = {}
): UseLandingCategoriesResult {
  const [categories, setCategories] = useState<LandingCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] =
    useState<ListLandingCategoriesParams>(initial);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await landingCategoryService.listar(filters);
      setCategories(data);
    } catch (e) {
      console.error("❌ [useLandingCategories] Erro:", e);
      setError(errorMessage(e, "Erro ao carregar categorias."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    categories,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  };
}
