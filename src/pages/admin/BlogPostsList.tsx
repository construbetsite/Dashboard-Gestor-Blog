import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { blogService } from "../../services/blog.service"; // âœ… CORRIGIDO
import type { BlogPost } from "../../types/blog";
import { formatDate } from "../../utils/formatDate";
import { getImageUrl } from "../../utils/imageUrl";
import AdminPostActions from "../../components/blog/AdminPostActions";

function StatusBadge({ status }: { status?: boolean }) {
  const isActive = status ?? true;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}

export default function BlogPostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.listar({
        page: 1,
        limit: 50,
        status: statusFilter === "" ? undefined : statusFilter === "true",
      });
      setPosts(response.data ?? []);
    } catch (e: any) {
      const message = e?.message || "Erro ao carregar posts";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeleted = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#004AAD]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-600">CRUD de posts do blog</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#004AAD] focus:ring-2 focus:ring-[#004AAD]/10"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
          <Link
            to="/admin/blog/novo"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#0A2230] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#133a4f]"
          >
            <Plus size={16} />
            Novo Post
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-6 text-sm text-slate-600 text-center">
            Nenhum post cadastrado.
            <Link
              to="/admin/blog/novo"
              className="ml-2 text-[#004AAD] font-medium hover:underline"
            >
              Criar primeiro post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">TÃ­tulo</th>
                  <th className="text-left px-4 py-3 font-medium">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Destaque</th>
                  <th className="text-left px-4 py-3 font-medium">Produtos</th>
                  <th className="text-left px-4 py-3 font-medium">Ver</th>
                  <th className="text-left px-4 py-3 font-medium">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        {p.image_url && (
                          <img
                            src={getImageUrl(p.image_url)}
                            alt=""
                            className="h-10 w-14 rounded-md object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <span className="line-clamp-1 max-w-[240px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="rounded-full bg-[#004AAD]/10 px-2.5 py-1 text-xs font-medium text-[#004AAD]">
                        {p.categoria?.nome || p.category || "â€”"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <StatusBadge status={p.status ?? true} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(p.created_at)} {/* âœ… CORRIGIDO */}
                    </td>
                    <td className="px-4 py-3">
                      {p.featured ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Destaque
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">â€”</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {p.product_ids && p.product_ids.length > 0 ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {p.product_ids.length} {p.product_ids.length === 1 ? "produto" : "produtos"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">â€”</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-2 text-slate-700 hover:bg-slate-100"
                        title="Ver no site"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <AdminPostActions post={p} onDeleted={handleDeleted} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

