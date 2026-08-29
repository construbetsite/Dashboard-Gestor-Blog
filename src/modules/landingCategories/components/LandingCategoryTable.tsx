// ============================================================
// LandingCategoryTable
// ============================================================
//
// Tabela de categorias da landing page com:
// - Colunas: ID, Título (thumbnail), URL, Ordem, Status, Ações
// - Reordenação por drag-and-drop (HTML5 nativo) OU botões
//   mover p/ cima/baixo (fallback acessível)
// - Estado de loading / vazio / erro
//
// A reordenação é otimista: `items` local é reordenado na hora e
// `onReorder(newItems)` é disparado para persistir via PUT.
// Em caso de falha, a página faz refetch (revertendo localmente).

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

import type { LandingCategory } from "../types/landingCategory";
import { getImageUrl } from "../../../utils/imageUrl";
import { applySequentialOrder } from "../hooks/useLandingCategoryMutations";

interface LandingCategoryTableProps {
  categories: LandingCategory[];
  loading: boolean;
  /** true enquanto uma reordenação está sendo persistida */
  reordering: boolean;
  /** Chamado com a lista já reordenada (com ordem sequencial) */
  onReorder: (ordered: LandingCategory[]) => void;
  onEdit: (category: LandingCategory) => void;
  onDelete: (category: LandingCategory) => void;
}

export default function LandingCategoryTable({
  categories,
  loading,
  reordering,
  onReorder,
  onEdit,
  onDelete,
}: LandingCategoryTableProps) {
  // Estado local (otimista) para drag-and-drop
  const [items, setItems] = useState<LandingCategory[]>(categories);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  // Sincroniza com a listagem vinda da página (após refetch)
  useEffect(() => {
    setItems(categories);
  }, [categories]);

  /**
   * Move um item de `fromIndex` para `toIndex`, aplica ordem
   * sequencial 0..n-1 e dispara persistência.
   */
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    const ordered = applySequentialOrder(next);
    setItems(ordered);
    onReorder(ordered);
  };

  // ============================================================
  // DRAG-AND-DROP (HTML5)
  // ============================================================

  const handleDragStart = (category: LandingCategory) => {
    setDragId(category.id);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLTableRowElement>,
    category: LandingCategory
  ) => {
    event.preventDefault();
    setOverId(category.id);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLTableRowElement>,
    target: LandingCategory
  ) => {
    event.preventDefault();
    const fromIndex = items.findIndex((item) => item.id === dragId);
    const toIndex = items.findIndex((item) => item.id === target.id);
    setDragId(null);
    setOverId(null);

    if (fromIndex !== -1 && toIndex !== -1) {
      moveItem(fromIndex, toIndex);
    }
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      {reordering && (
        <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-700">
          <Loader2 size={14} className="animate-spin" />
          Salvando nova ordem...
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="w-10 px-2 py-3" aria-label="Reordenar" />
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Título</th>
              <th className="px-4 py-3 text-left font-medium">URL</th>
              <th className="px-4 py-3 text-left font-medium">Ordem</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 size={20} className="mx-auto animate-spin text-blue-500" />
                  <span className="mt-2 block text-sm">
                    Carregando categorias...
                  </span>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  Nenhuma categoria encontrada.
                </td>
              </tr>
            ) : (
              items.map((category, index) => (
                <tr
                  key={category.id}
                  draggable={!reordering}
                  onDragStart={() => handleDragStart(category)}
                  onDragOver={(e) => handleDragOver(e, category)}
                  onDrop={(e) => handleDrop(e, category)}
                  onDragEnd={handleDragEnd}
                  className={`hover:bg-slate-50/60 transition-colors ${overId === category.id && dragId !== category.id
                      ? "bg-blue-50/70 ring-2 ring-inset ring-blue-100"
                      : ""
                    }`}
                >
                  {/* HANDLE (drag) */}
                  <td className="px-2 py-3 text-center">
                    <span
                      className={`inline-flex cursor-grab text-slate-300 hover:text-slate-500 ${reordering ? "cursor-not-allowed opacity-40" : ""
                        }`}
                      title="Arraste para reordenar"
                    >
                      <GripVertical size={18} />
                    </span>
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    #{category.id}
                  </td>

                  {/* TÍTULO + IMAGEM */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img
                          src={getImageUrl(category.image)}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-md object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                          —
                        </div>
                      )}
                      <span className="line-clamp-1 max-w-[220px] font-medium text-slate-900">
                        {category.title}
                      </span>
                    </div>
                  </td>

                  {/* URL */}
                  <td className="px-4 py-3">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {category.url}
                    </code>
                  </td>

                  {/* ORDEM (botões) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-xs font-semibold text-slate-700">
                        {category.order}
                      </span>

                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveItem(index, index - 1)}
                          disabled={index === 0 || reordering}
                          title="Mover para cima"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(index, index + 1)}
                          disabled={index === items.length - 1 || reordering}
                          title="Mover para baixo"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    {category.status ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Inativo
                      </span>
                    )}
                  </td>

                  {/* AÇÕES */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        disabled={reordering}
                        className="rounded-md border-slate-300 px-2.5 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        disabled={reordering}
                        className="rounded-md border-rose-200 px-2.5 py-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        title="Excluir"
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
