// ============================================================
// LandingCategoriesListPage
// ============================================================
//
// Listagem de categorias da landing page (área administrativa).
// - Filtro por status (todos/ativos/inativos)
// - Reordenação (drag-and-drop / botões) persistida via PUT
// - Exclusão com modal de confirmação
// - Loading / erro / refetch automáticos

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

import { useLandingCategories } from "../hooks/useLandingCategories";
import { useLandingCategoryMutations } from "../hooks/useLandingCategoryMutations";
import LandingCategoryTable from "../components/LandingCategoryTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { LANDING_CATEGORIES_ROUTES } from "../routes";
import type { LandingCategory } from "../types/landingCategory";

type StatusFilter = "" | "true" | "false";

export default function LandingCategoriesListPage() {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    error,
    refetch,
  } = useLandingCategories();

  const {
    loading: mutating,
    error: mutationError,
    deleteCategory,
    reorderCategories,
  } = useLandingCategoryMutations();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryToDelete, setCategoryToDelete] =
    useState<LandingCategory | null>(null);

  // Filtro local (sem refetch: os dados admin vêm todos da API)
  const filteredCategories = useMemo(() => {
    if (statusFilter === "") return categories;
    const wantActive = statusFilter === "true";
    return categories.filter((c) => c.status === wantActive);
  }, [categories, statusFilter]);

  // ============================================================
  // REORDENAR
  // ============================================================

  const handleReorder = useCallback(
    async (ordered: LandingCategory[]) => {
      const success = await reorderCategories(ordered);
      if (success) {
        toast.success("Ordem atualizada com sucesso.");
      } else {
        toast.error(mutationError || "Não foi possível salvar a nova ordem.");
      }
      // Rebusca sempre (sucesso = confirma; falha = reverte)
      void refetch();
    },
    [reorderCategories, mutationError, refetch]
  );

  // ============================================================
  // EXCLUIR
  // ============================================================

  const handleConfirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;

    const success = await deleteCategory(categoryToDelete.id);
    if (success) {
      toast.success("Categoria excluída com sucesso.");
      // Fecha o modal (o refetch remove a linha da listagem)
      setCategoryToDelete(null);
      void refetch();
    } else {
      toast.error(mutationError || "Erro ao excluir categoria. Tente novamente.");
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, deleteCategory, mutationError, refetch]);

  const handleCancelDelete = useCallback(() => {
    if (!mutating) setCategoryToDelete(null);
  }, [mutating]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Categorias da Landing Page
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as categorias exibidas na home da Construbet:
            organização, dados e status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* FILTRO POR STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004AAD] focus:ring-2 focus:ring-[#004AAD]/10"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>

          <button
            type="button"
            onClick={() => navigate(LANDING_CATEGORIES_ROUTES.new)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004AAD] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003B8F]"
          >
            <Plus size={18} />
            Nova categoria
          </button>
        </div>
      </div>

      {/* ERRO (listagem) */}
      {error && (
        <div className="rounded-lg border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABELA */}
      <LandingCategoryTable
        categories={filteredCategories}
        loading={loading}
        reordering={mutating}
        onReorder={handleReorder}
        onEdit={(category) =>
          navigate(LANDING_CATEGORIES_ROUTES.edit(category.id))
        }
        onDelete={(category) => setCategoryToDelete(category)}
      />

      {/* DICA DE USO */}
      <p className="text-xs text-slate-400">
        💡 Arraste as linhas pela alça ou use as setas para
        reordenar. A nova ordem é salva automaticamente.
      </p>

      {/* MODAL DE EXCLUSÃO */}
      <ConfirmDialog
        open={categoryToDelete !== null}
        title="Excluir categoria?"
        message={
          categoryToDelete
            ? `A categoria "${categoryToDelete.title}" será excluída permanentemente, incluindo sua imagem do bucket. Essa ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        loading={mutating}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
