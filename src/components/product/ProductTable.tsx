// ============================================================
// ProductTable
// ============================================================
//
// Tabela de produtos.
//
// Responsabilidades:
// - Exibir produtos
// - Exibir imagem
// - Exibir categoria
// - Exibir tipo comercial
// - Exibir preço ou URL
// - Exibir status
// - Exibir ações
// - Informar estado de carregamento
// - Permitir atualização da listagem
//
// ============================================================

import {
  ExternalLink,
  Loader2,
  PackageOpen,
  RefreshCw,
  Star,
} from "lucide-react";

import { getImageUrl } from "../../utils/imageUrl";

import {
  COMMERCIAL_TYPE_LABELS,
  type Product,
} from "../../types/product";

import ProductActions from "./ProductActions";

// ============================================================
// PROPS
// ============================================================

interface ProductTableProps {
  /**
   * Produtos que serão exibidos na tabela.
   */
  products: Product[];

  /**
   * Indica se a listagem está sendo carregada.
   */
  loading?: boolean;

  /**
   * Mapa opcional de ID da categoria -> nome da categoria.
   *
   * Exemplo:
   *
   * {
   *   "uuid-1": "Materiais de construção",
   *   "uuid-2": "Ferramentas"
   * }
   */
  categoryNameById?: Record<string, string>;

  /**
   * Executado quando um produto é excluído.
   */
  onDeleted?: () => void;

  /**
   * Atualiza a listagem de produtos.
   */
  onRefresh?: () => void | Promise<void>;
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}: {
  status?: boolean | null;
}) {
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
          isActive
            ? "bg-emerald-500"
            : "bg-rose-500"
        }`}
      />

      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}

// ============================================================
// FORMATAÇÃO DE PREÇO
// ============================================================

function formatPrice(
  value: number | null | undefined
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

// ============================================================
// BADGE DE DESTAQUE (featured)
// ============================================================

function FeaturedBadge({
  featured,
}: {
  featured?: boolean;
}) {
  return featured ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Star size={13} className="fill-amber-500 text-amber-500" />
      Sim
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
      <Star size={13} className="text-slate-400" />
      Não
    </span>
  );
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ProductTable({
  products,
  loading = false,
  categoryNameById,
  onDeleted,
  onRefresh,
}: ProductTableProps) {
  // ==========================================================
  // CARREGANDO
  // ==========================================================

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8">
          <Loader2
            size={28}
            className="animate-spin text-[#004AAD]"
          />

          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              Carregando produtos...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Aguarde enquanto buscamos os produtos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LISTA VAZIA
  // ==========================================================

  if (!products.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <PackageOpen
              size={24}
              className="text-slate-400"
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">
              Nenhum produto encontrado
            </p>

            <p className="mt-1 max-w-md text-xs text-slate-500">
              Não existem produtos correspondentes
              aos filtros selecionados.
            </p>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={() => void onRefresh()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Atualizar
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // TABELA
  // ==========================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ======================================================
          CABEÇALHO DA TABELA
      ====================================================== */}

      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Produtos
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {products.length}{" "}
            {products.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Atualizar produtos"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Atualizar
          </button>
        )}
      </div>

      {/* ======================================================
          SCROLL HORIZONTAL
      ====================================================== */}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* ==================================================
              HEADER
          ================================================== */}

          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Produto
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Categoria
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Tipo
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Preço / URL
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Destaque
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Ações
              </th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const categoryName =
                categoryNameById?.[
                  product.categoryId
                ] ?? "—";

              const isEcommerce =
                product.commercialType ===
                "ECOMMERCE";

              return (
                <tr
                  key={product.id}
                  className="transition hover:bg-slate-50/40"
                >
                  {/* ==========================================
                      PRODUTO
                  ========================================== */}

                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      {/* IMAGEM */}

                      {product.imageUrl ? (
                        <img
                          src={getImageUrl(
                            product.imageUrl
                          )}
                          alt={
                            product.name
                          }
                          className="h-10 w-14 shrink-0 rounded-md border border-slate-200 object-cover"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100">
                          <PackageOpen
                            size={18}
                            className="text-slate-400"
                          />
                        </div>
                      )}

                      {/* NOME */}

                      <div className="min-w-0">
                        <span className="block max-w-[260px] truncate font-medium text-slate-900">
                          {product.name}
                        </span>

                        {product.sku && (
                          <span className="block text-xs text-slate-400">
                            SKU:{" "}
                            {product.sku}
                          </span>
                        )}

                        {product.brand && (
                          <span className="block text-xs text-slate-400">
                            {product.brand}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ==========================================
                      CATEGORIA
                  ========================================== */}

                  <td className="px-4 py-3 text-slate-700">
                    <span className="inline-flex rounded-full bg-[#004AAD]/10 px-2.5 py-1 text-xs font-medium text-[#004AAD]">
                      {categoryName}
                    </span>
                  </td>

                  {/* ==========================================
                      TIPO COMERCIAL
                  ========================================== */}

                  <td className="px-4 py-3 text-slate-700">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        isEcommerce
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {
                        COMMERCIAL_TYPE_LABELS[
                          product.commercialType
                        ]
                      }
                    </span>
                  </td>

                  {/* ==========================================
                      PREÇO / URL
                  ========================================== */}

                  <td className="px-4 py-3 text-slate-700">
                    {isEcommerce ? (
                      product.redirectUrl ? (
                        <a
                          href={
                            product.redirectUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink
                            size={14}
                          />

                          Abrir
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          —
                        </span>
                      )
                    ) : (
                      <span className="font-medium">
                        {formatPrice(
                          product.price
                        )}
                      </span>
                    )}
                  </td>

                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <td className="px-4 py-3">
                    <StatusBadge
                      status={
                        product.active
                      }
                    />
                  </td>

                  {/* ==========================================
                      DESTAQUE
                  ========================================== */}

                  <td className="px-4 py-3">
                    <FeaturedBadge
                      featured={
                        product.featured
                      }
                    />
                  </td>

                  {/* ==========================================
                      AÇÕES
                  ========================================== */}

                  <td className="px-4 py-3">
                    <ProductActions
                      product={product}
                      onDeleted={onDeleted}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          RODAPÉ
      ====================================================== */}

      <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3">
        <p className="text-xs text-slate-500">
          Exibindo{" "}
          <span className="font-medium text-slate-700">
            {products.length}
          </span>{" "}
          {products.length === 1
            ? "produto"
            : "produtos"}.
        </p>
      </div>
    </div>
  );
}