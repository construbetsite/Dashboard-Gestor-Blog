import { useParams } from "react-router-dom";
import PostForm from "../../components/blog/PostForm";
import { useBlogPost } from "../../hooks/useBlogPost";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Página administrativa de criação/edição de posts.
 * - Sem `:id` na rota -> criação (`/admin/blog/novo`)
 * - Com `:id` na rota -> edição (`/admin/blog/editar/:id`)
 */
export default function BlogPostForm() {
  const { id } = useParams<{ id: string }>();
  const mode = id ? "edit" : "create";

  const { post, loading, error, notFound } = useBlogPost(id, "id", mode === "edit");

  // Título da página
  const heading = mode === "create" ? "Novo Post" : "Editar Post";
  const subtitle =
    mode === "create"
      ? "Preencha os dados para publicar um novo post"
      : "Atualize os dados do post";

  if (mode === "edit" && loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 size={18} className="animate-spin" />
          Carregando post...
        </div>
      </div>
    );
  }

  if (mode === "edit" && notFound) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="flex items-start gap-2">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Post não encontrado</p>
              <p className="mt-1 text-sm">Verifique se o ID é válido.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "edit" && error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="flex items-start gap-2">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Erro ao carregar o post</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">{heading}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>

      {/* ✅ Passando o post e o mode para o PostForm */}
      <PostForm mode={mode} post={post} />
    </div>
  );
}