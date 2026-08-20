import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import ProductCategoryTable from "../../components/product/ProductCategoryTable";
import { useProductCategories } from "../../hooks/useProductCategories";

export default function ProductCategoriesList() {
  const {
    categories,
    loading,
    error,
    refetch,
  } = useProductCategories();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/produtos"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Voltar para produtos
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Categorias de produtos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize os produtos da Construbet por categoria.
          </p>
        </div>

        <Link
          to="/admin/produtos/categorias/nova"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Nova categoria
        </Link>
      </div>

      {/* ERRO */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABELA */}
      <ProductCategoryTable
        categories={categories}
        loading={loading}
        onRefresh={refetch}
      />
    </div>
  );
}