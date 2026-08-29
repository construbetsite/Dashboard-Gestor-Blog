import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Package, Search, X } from "lucide-react";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product";

export interface ProductOption {
  id: string;
  name: string;
}

interface ProductMultiSelectProps {
  /** IDs de produtos selecionados (controlado pelo formulário) */
  value: string[];
  /** Callback com o novo array de IDs */
  onChange: (ids: string[]) => void;
  /** Produtos já vinculados ao post (vindos do ?include=products), para resolver nomes que não estão na lista ativa */
  preloaded?: ProductOption[] | null;
  /** Placeholder do campo de busca */
  placeholder?: string;
  disabled?: boolean;
}

const DEBOUNCE_MS = 300;

/**
 * Multi-seleção de produtos com busca (debounce 300ms).
 * - Carrega apenas produtos ATIVOS (GET /product?active=true)
 * - Campo OPCIONAL: pode ser deixado vazio
 * - Envia apenas os IDs (string[]) via onChange
 */
export default function ProductMultiSelect({
  value,
  onChange,
  preloaded,
  placeholder = "Buscar produtos para vincular...",
  disabled = false,
}: ProductMultiSelectProps) {
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [retry, setRetry] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Debounce da busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Carrega a lista de produtos ativos uma única vez
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const products = await productService.listar({ active: true });
        if (cancelled) return;
        const list = Array.isArray(products) ? products : [];
        setAllProducts(
          list
            .filter((p: Product) => p.active !== false)
            .map((p: Product) => ({ id: p.id, name: p.name }))
        );
      } catch (err: any) {
        if (!cancelled) {
          console.error("[ProductMultiSelect] Erro ao carregar produtos:", err);
          setLoadError(err?.message || "Erro ao carregar produtos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [retry]);

  // ✅ Mapa id -> nome (lista ativa + produtos pré-carregados do post)
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    preloaded?.forEach((p) => map.set(p.id, p.name));
    allProducts.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [allProducts, preloaded]);

  // ✅ Filtro com debounce por nome (a busca por slug também casa pois o nome deriva do slug no catálogo)
  const filtered = useMemo(() => {
    if (!debouncedSearch) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(debouncedSearch) ||
        p.id.toLowerCase().includes(debouncedSearch)
    );
  }, [allProducts, debouncedSearch]);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Chips dos produtos selecionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-800"
            >
              <Package size={12} />
              {nameById.get(id) || `Produto ${id.slice(0, 8)}…`}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="rounded-full hover:bg-blue-200/60 p-0.5"
                  aria-label={`Remover ${nameById.get(id) || id}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          value={search}
          disabled={disabled || loading}
          placeholder={loading ? "Carregando produtos..." : placeholder}
          className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Limpar busca"
          >
            <X size={14} />
          </button>
        )}

        {open && !disabled && (
          <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Carregando produtos...
              </div>
            ) : loadError ? (
              <div className="px-3 py-4 text-sm text-rose-700">
                {loadError}
                <button
                  type="button"
                  onClick={() => setRetry((r) => r + 1)}
                  className="ml-2 underline font-medium"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-500">
                {debouncedSearch
                  ? "Nenhum produto encontrado para a busca."
                  : "Nenhum produto ativo cadastrado."}
              </div>
            ) : (
              <ul className="py-1">
                {filtered.map((p) => {
                  const checked = value.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                          checked ? "bg-blue-50/60" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="pointer-events-none h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-800">{p.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Opcional. Produtos recomendados exibidos no final do post no blog.
        {value.length > 0 && ` ${value.length} produto(s) selecionado(s).`}
      </p>
    </div>
  );
}
