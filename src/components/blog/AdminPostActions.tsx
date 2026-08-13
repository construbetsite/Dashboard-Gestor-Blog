import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import type { BlogPost } from "../../types/blog";
import { useDeletePost } from "../../hooks/useDeletePost";

interface AdminPostActionsProps {
  post: BlogPost;
  onDeleted?: () => void;
}

export default function AdminPostActions({ post, onDeleted }: AdminPostActionsProps) {
  const navigate = useNavigate();
  const { loading, deletePost } = useDeletePost();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm(`Excluir o post "${post.title}"?`);
    if (!ok) return;

    setDeleting(true);
    const success = await deletePost(post.id);
    setDeleting(false);

    if (success) {
      toast.success("Post excluído com sucesso.");
      onDeleted?.();
    } else {
      toast.error("Erro ao excluir post. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => navigate(`/admin/blog/editar/${post.id}`)}
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