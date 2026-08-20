// ============================================================
// ProductCategoryTable
// ============================================================
//
// Tabela de categorias de produto com ações de editar/excluir.
// Reutiliza o padrão visual do painel administrativo.
//
// Responsabilidades:
// - Exibir categorias
// - Exibir estado de carregamento
// - Exibir estado vazio
// - Navegar para edição
// - Excluir categoria
// - Atualizar a listagem após exclusão
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import type { ProductCategory } from "../../types/productCategory";
import { useProductCategoryMutations } from "../../hooks/useProductCategories";

interface ProductCategoryTableProps {
  categories: ProductCategory[];
  loading: boolean;
  onRefresh: () => void | Promise<void>;
}

export default function ProductCategoryTable({
  categories,
  loading,
  onRefresh,
}: ProductCategoryTableProps) {
  const navigate = useNavigate();

  const { deleteCategory } = useProductCategoryMutations();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ============================================================
  // EXCLUIR CATEGORIA
  // ============================================================

  const handleDelete = async (category: ProductCategory) => {
    const ok = window.confirm(
      `Excluir a categoria "${category.name}"?`
    );

    if (!ok) return;

    try {
      setDeletingId(category.id);

      const success = await deleteCategory(category.id);

      if (success) {
        toast.success("Categoria excluída com sucesso.");

        // Atualiza a listagem após exclusão
        await onRefresh();
      } else {
        toast.error(
          "Erro ao excluir categoria. Tente novamente."
        );
      }
    } catch {
      toast.error(
        "Erro ao excluir categoria. Tente novamente."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Nome
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Slug
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Ações
              </th>
            </tr>
          </thead>

          {/* ================================================== */}
          {/* BODY */}
          {/* ================================================== */}

          <tbody className="divide-y divide-slate-100">

            {/* ================================================== */}
            {/* LOADING */}
            {/* ================================================== */}

            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  Carregando categorias...
                </td>
              </tr>
            ) : categories.length === 0 ? (

              /* ================================================== */
              /* EMPTY STATE */
              /* ================================================== */

              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  Nenhuma categoria encontrada.
                </td>
              </tr>

            ) : (

              /* ================================================== */
              /* CATEGORIES */
              /* ================================================== */

              categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-slate-50/40"
                >
                  {/* ================================================== */}
                  {/* NOME */}
                  {/* ================================================== */}

                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="min-w-0">
                      <span className="line-clamp-1 block max-w-[260px]">
                        {category.name}
                      </span>

                      {category.description && (
                        <span className="line-clamp-1 block max-w-[260px] text-xs text-slate-500">
                          {category.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ================================================== */}
                  {/* SLUG */}
                  {/* ================================================== */}

                  <td className="px-4 py-3 text-slate-700">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      {category.slug}
                    </code>
                  </td>

                  {/* ================================================== */}
                  {/* STATUS */}
                  {/* ================================================== */}

                  <td className="px-4 py-3">
                    {category.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Inativa
                      </span>
                    )}
                  </td>

                  {/* ================================================== */}
                  {/* AÇÕES */}
                  {/* ================================================== */}

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">

                      {/* EDITAR */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/produtos/categorias/editar/${category.id}`
                          )
                        }
                        className="rounded-md border border-slate-300 px-2.5 py-2 text-slate-700 hover:bg-slate-100"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* EXCLUIR */}

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(category)
                        }
                        disabled={
                          deletingId === category.id
                        }
                        className="rounded-md border border-rose-200 px-2.5 py-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                          deletingId === category.id
                            ? "Excluindo..."
                            : "Excluir"
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}