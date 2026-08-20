import { Link } from "react-router-dom";
import { Plus, FolderTree } from "lucide-react";

import ProductTable from "../../components/product/ProductTable";
import ProductFilters from "../../components/product/ProductFilters";
import { useProducts } from "../../hooks/useProducts";
import { useProductCategories } from "../../hooks/useProductCategories";

export default function ProductsList() {
  const {
    products,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  } = useProducts();

  const {
    categories,
    loading: categoriesLoading,
  } = useProductCategories();

  // Mapeia o ID da categoria para o nome
  const categoryNameById = Object.fromEntries(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Produtos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gerencie os produtos disponibilizados pela Construbet.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/produtos/categorias"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FolderTree size={18} />
            Categorias
          </Link>

          <Link
            to="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={18} />
            Novo produto
          </Link>
        </div>
      </div>

      {/* FILTROS */}
      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        categoriesLoading={categoriesLoading}
      />

      {/* ERRO */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABELA */}
      <ProductTable
        products={products}
        loading={loading}
        categoryNameById={categoryNameById}
        onRefresh={refetch}
      />
    </div>
  );
}