// ============================================================
// ProductFilters
// ============================================================
//
// Filtros da listagem de produtos.
//
// Responsabilidades:
// - Receber os filtros atuais da página
// - Alterar os filtros
// - Exibir categorias recebidas pelo componente pai
// - Filtrar por:
//   • Busca
//   • Categoria
//   • Tipo comercial
//   • Status
//   • Destaque
//
// IMPORTANTE:
// As categorias NÃO são carregadas aqui.
// O ProductsList é responsável por carregá-las.
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import {
  Filter,
  Search,
  X,
} from "lucide-react";

import type {
  CommercialType,
  ListProductsParams,
} from "../../types/product";

import type {
  ProductCategory,
} from "../../types/productCategory";

import {
  COMMERCIAL_TYPE_LABELS,
} from "../../types/product";

// ============================================================
// TIPOS
// ============================================================

export interface ProductFilterValues
  extends ListProductsParams {
  search?: string;
}

export interface ProductFiltersProps {
  /**
   * Filtros atualmente aplicados.
   */
  filters: ProductFilterValues;

  /**
   * Atualiza os filtros da página.
   */
  setFilters: (
    next: ProductFilterValues
  ) => void;

  /**
   * Categorias carregadas pelo ProductsList.
   */
  categories: ProductCategory[];

  /**
   * Estado de carregamento das categorias.
   */
  categoriesLoading: boolean;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ProductFilters({
  filters,
  setFilters,
  categories,
  categoriesLoading,
}: ProductFiltersProps) {

  // ============================================================
  // ESTADOS LOCAIS
  // ============================================================
  //
  // Mantemos os valores localmente para permitir que o usuário
  // altere vários campos antes de clicar em "Aplicar".
  // ============================================================

  const [search, setSearch] =
    useState(filters.search ?? "");

  const [categoryId, setCategoryId] =
    useState(filters.categoryId ?? "");

  const [commercialType, setCommercialType] =
    useState<CommercialType | "">(
      filters.commercialType ?? ""
    );

  const [active, setActive] =
    useState<string>(
      filters.active === undefined
        ? ""
        : String(filters.active)
    );

  const [featured, setFeatured] =
    useState<string>(
      filters.featured === undefined
        ? ""
        : String(filters.featured)
    );

  // ============================================================
  // SINCRONIZAÇÃO COM O PAI
  // ============================================================
  //
  // Quando ProductsList altera os filtros externamente,
  // atualizamos os campos locais.
  // ============================================================

  useEffect(() => {
    setSearch(filters.search ?? "");

    setCategoryId(
      filters.categoryId ?? ""
    );

    setCommercialType(
      filters.commercialType ?? ""
    );

    setActive(
      filters.active === undefined
        ? ""
        : String(filters.active)
    );

    setFeatured(
      filters.featured === undefined
        ? ""
        : String(filters.featured)
    );
  }, [
    filters.search,
    filters.categoryId,
    filters.commercialType,
    filters.active,
    filters.featured,
  ]);

  // ============================================================
  // APLICAR
  // ============================================================

  const apply = () => {
    const nextFilters: ProductFilterValues = {
      search:
        search.trim() || undefined,

      categoryId:
        categoryId || undefined,

      commercialType:
        commercialType === ""
          ? undefined
          : commercialType,

      active:
        active === ""
          ? undefined
          : active === "true",

      featured:
        featured === ""
          ? undefined
          : featured === "true",
    };

    setFilters(nextFilters);
  };

  // ============================================================
  // LIMPAR
  // ============================================================

  const clear = () => {
    setSearch("");
    setCategoryId("");
    setCommercialType("");
    setActive("");
    setFeatured("");

    setFilters({});
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Filter
          size={16}
          className="text-[#004AAD]"
        />

        Filtros
      </div>

      {/* ======================================================
          FILTROS PRINCIPAIS
      ====================================================== */}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {/* ====================================================
            BUSCA
        ==================================================== */}

        <div className="lg:col-span-2">

          <label
            htmlFor="product-search"
            className="block text-xs font-medium text-slate-600"
          >
            Buscar
          </label>

          <div className="relative mt-1">

            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="product-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  apply();
                }
              }}
              placeholder="Nome do produto"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#0A2230] focus:ring-1 focus:ring-[#0A2230]"
            />

          </div>
        </div>

        {/* ====================================================
            CATEGORIA
        ==================================================== */}

        <div>

          <label
            htmlFor="product-category-filter"
            className="block text-xs font-medium text-slate-600"
          >
            Categoria
          </label>

          <select
            id="product-category-filter"
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value
              )
            }
            disabled={categoriesLoading}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A2230] focus:ring-1 focus:ring-[#0A2230] disabled:cursor-not-allowed disabled:opacity-50"
          >

            <option value="">
              {categoriesLoading
                ? "Carregando..."
                : "Todas"}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}

          </select>

        </div>

        {/* ====================================================
            TIPO COMERCIAL
        ==================================================== */}

        <div>

          <label
            htmlFor="product-commercial-type"
            className="block text-xs font-medium text-slate-600"
          >
            Tipo comercial
          </label>

          <select
            id="product-commercial-type"
            value={commercialType}
            onChange={(event) => {
              const value =
                event.target.value;

              setCommercialType(
                value === ""
                  ? ""
                  : value as CommercialType
              );
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A2230] focus:ring-1 focus:ring-[#0A2230]"
          >

            <option value="">
              Todos
            </option>

            {(
              Object.keys(
                COMMERCIAL_TYPE_LABELS
              ) as CommercialType[]
            ).map((type) => (
              <option
                key={type}
                value={type}
              >
                {COMMERCIAL_TYPE_LABELS[type]}
              </option>
            ))}

          </select>

        </div>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <div>

          <label
            htmlFor="product-status-filter"
            className="block text-xs font-medium text-slate-600"
          >
            Status
          </label>

          <select
            id="product-status-filter"
            value={active}
            onChange={(event) =>
              setActive(
                event.target.value
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A2230] focus:ring-1 focus:ring-[#0A2230]"
          >

            <option value="">
              Todos
            </option>

            <option value="true">
              Ativos
            </option>

            <option value="false">
              Inativos
            </option>

          </select>

        </div>

      </div>

      {/* ======================================================
          DESTAQUE + AÇÕES
      ====================================================== */}

      <div className="mt-3 flex flex-wrap items-center gap-2">

        {/* DESTAQUE */}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">

          <input
            type="checkbox"
            checked={featured === "true"}
            onChange={(event) =>
              setFeatured(
                event.target.checked
                  ? "true"
                  : ""
              )
            }
            className="h-4 w-4 rounded border-slate-300"
          />

          Somente em destaque

        </label>

        {/* AÇÕES */}

        <div className="ml-auto flex items-center gap-2">

          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-[#0A2230] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#133a4f]"
          >
            Aplicar
          </button>

          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            title="Limpar filtros"
            aria-label="Limpar filtros"
          >
            <X size={16} />
          </button>

        </div>

      </div>
    </div>
  );
}