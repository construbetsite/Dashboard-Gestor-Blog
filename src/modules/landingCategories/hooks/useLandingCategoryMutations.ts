// ============================================================
// useLandingCategoryMutations
// ============================================================
//
// Mutações CRUD + reordenação (drag-and-drop / botões).
// - createCategory / updateCategory / deleteCategory
// - reorderCategories: aplica `order` sequencial (0..n-1)
//   enviando um PUT por item alterado (conforme documentação:
//   "ordem deve ser atualizada via requisição PUT para cada item").

import { useCallback, useState } from "react";
import { landingCategoryService } from "../services/landingCategory.service";
import { errorMessage } from "../utils/errors";
import type {
  CreateLandingCategoryPayload,
  LandingCategory,
  UpdateLandingCategoryPayload,
} from "../types/landingCategory";

export interface UseLandingCategoryMutationsResult {
  /** true enquanto qualquer mutação está em andamento */
  loading: boolean;
  error: string | null;
  createCategory: (data: CreateLandingCategoryPayload) => Promise<LandingCategory | null>;
  updateCategory: (
    id: number,
    data: UpdateLandingCategoryPayload
  ) => Promise<LandingCategory | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  reorderCategories: (ordered: LandingCategory[]) => Promise<boolean>;
}

/** Aplica `order` sequencial 0..n-1 na lista recebida. */
export function applySequentialOrder(
  list: LandingCategory[]
): LandingCategory[] {
  return list.map((item, index) => ({ ...item, order: index }));
}

export function useLandingCategoryMutations(): UseLandingCategoryMutationsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCallback(
    async (data: CreateLandingCategoryPayload): Promise<LandingCategory | null> => {
      setLoading(true);
      setError(null);
      try {
        return await landingCategoryService.criar(data);
      } catch (e) {
        console.error("❌ [useLandingCategoryMutations] Erro ao criar:", e);
        setError(errorMessage(e, "Erro ao criar categoria."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCategory = useCallback(
    async (id: number, data: UpdateLandingCategoryPayload): Promise<LandingCategory | null> => {
      setLoading(true);
      setError(null);
      try {
        return await landingCategoryService.editar(id, data);
      } catch (e) {
        console.error("❌ [useLandingCategoryMutations] Erro ao atualizar:", e);
        setError(errorMessage(e, "Erro ao atualizar categoria."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await landingCategoryService.deletar(id);
      return true;
    } catch (e) {
      console.error("❌ [useLandingCategoryMutations] Erro ao excluir:", e);
      setError(errorMessage(e, "Erro ao excluir categoria."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recebe a lista já reordenada pelo usuário (com conteúdo correto,
   * mas `order` possivelmente desatualizado) e envia um PUT por item
   * cujo `order` mudou.
   */
  const reorderCategories = useCallback(
    async (ordered: LandingCategory[]): Promise<boolean> => {
      // Aplica ordem sequencial 0..n-1
      const next = applySequentialOrder(ordered);

      setLoading(true);
      setError(null);
      try {
        for (let i = 0; i < next.length; i++) {
          const item = next[i];
          // Só envia PUT quando o order realmente mudou
          if (item.order !== ordered[i].order) {
            await landingCategoryService.editar(item.id, { order: item.order });
          }
        }
        return true;
      } catch (e) {
        console.error("❌ [useLandingCategoryMutations] Erro ao reordenar:", e);
        setError(errorMessage(e, "Erro ao salvar a nova ordem."));
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
