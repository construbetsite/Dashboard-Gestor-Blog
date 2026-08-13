import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { blogService } from "../../services/blog.service"; // ✅ CORRIGIDO
import type { BlogCategoria } from "../../types/blog";

export interface PostFilterValues {
  category?: string;
  tag?: string;
  featured?: boolean;
}

interface PostFilterProps {
  initial?: PostFilterValues;
  onChange: (filters: PostFilterValues) => void;
}

export default function PostFilter({ initial, onChange }: PostFilterProps) {
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [categorias, setCategorias] = useState<BlogCategoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [categoriasError, setCategoriasError] = useState<string | null>(null);

  // Busca as categorias pré-definidas (endpoint público)
  useEffect(() => {
    let active = true;
    
    const fetchCategorias = async () => {
      try {
        setCategoriasLoading(true);
        setCategoriasError(null);
        
        // ✅ CORRIGIDO: Usar blogService.listarCategorias()
        const response = await blogService.listarCategorias();
        const data = Array.isArray(response) ? response : response?.data || [];
        
        if (active) {
          setCategorias(data);
        }
      } catch (e: any) {
        console.error("❌ Erro ao carregar categorias:", e);
        if (active) {
          setCategoriasError(e?.message || "Erro ao carregar categorias.");
        }
      } finally {
        if (active) {
          setCategoriasLoading(false);
        }
      }
    };

    fetchCategorias();
    
    return () => {
      active = false;
    };
  }, []);

  // Quando o filtro externo muda (ex.: navegação), sincroniza os campos
  useEffect(() => {
    setCategory(initial?.category ?? "");
    setTag(initial?.tag ?? "");
    setFeatured(initial?.featured ?? false);
  }, [initial?.category, initial?.tag, initial?.featured]);

  const apply = () => {
    onChange({
      category: category.trim() || undefined,
      tag: tag.trim() || undefined,
      featured: featured || undefined,
    });
  };

  const clear = () => {
    setCategory("");
    setTag("");
    setFeatured(false);
    onChange({});
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Filter size={16} className="text-[#004AAD]" />
        Filtros
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2230]"
            disabled={categoriasLoading}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}
              </option>
            ))}
          </select>
          {categoriasLoading && (
            <p className="mt-1 text-xs text-slate-500">Carregando categorias...</p>
          )}
          {categoriasError && (
            <p className="mt-1 text-xs text-rose-600">{categoriasError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">Tag</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Ex: detran"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A2230]"
          />
        </div>

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Em destaque
          </label>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={apply}
            className="w-full rounded-lg bg-[#0A2230] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#133a4f]"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            title="Limpar filtros"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}