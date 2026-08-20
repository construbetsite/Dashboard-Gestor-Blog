// ============================================================
// ProductActions
// ============================================================
//
// Botões de Editar/Excluir para linhas da tabela de produtos.
// Padrão equivalente ao AdminPostActions do Blog.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import type { Product } from "../../types/product";
import { useDeleteProduct } from "../../hooks/useProductMutations";

interface ProductActionsProps {
  product: Product;
  onDeleted?: () => void;
}

export default function ProductActions({
  product,
  onDeleted,
}: ProductActionsProps) {
  const navigate = useNavigate();
  const { loading, deleteProduct } = useDeleteProduct();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm(
      `Excluir o produto "${product.name}"?`
    );
    if (!ok) return;
    setDeleting(true);
    const success = await deleteProduct(product.id);
    setDeleting(false);
    if (success) {
      toast.success("Produto excluído com sucesso.");
      onDeleted?.();
    } else {
      toast.error("Erro ao excluir produto. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() =>
          navigate(`/admin/produtos/editar/${product.id}`)
        }
        className="rounded-md border border-slate-300 px-2.5 py-2 text-slate-700 hover:bg-slate-100"
        title="Editar"
      >
        <Pencil size={16} />
      </button>

      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={loading || deleting}
        className="rounded-md border border-rose-200 px-2.5 py-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
