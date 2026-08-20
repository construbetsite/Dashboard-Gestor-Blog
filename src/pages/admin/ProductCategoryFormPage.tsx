import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ProductCategoryForm from "../../components/product/ProductCategoryForm";
import { useProductCategories } from "../../hooks/useProductCategories";

export default function ProductCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const {
    categories,
    loading,
    error,
  } = useProductCategories();

  const category = id
    ? categories.find((item) => item.id === id)
    : undefined;

  /*
   * Só precisamos aguardar categorias quando estamos
   * editando e ainda não conseguimos localizar a categoria.
   */
  if (isEditing && loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Carregando categoria...
        </div>
      </div>
    );
  }

  if (isEditing && !category) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/produtos/categorias"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Voltar para categorias
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Categoria não encontrada."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <Link
          to="/admin/produtos/categorias"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Voltar para categorias
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing
            ? "Editar categoria"
            : "Nova categoria"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? "Atualize as informações da categoria."
            : "Cadastre uma nova categoria de produtos."}
        </p>
      </div>

      {/* FORM */}
      <ProductCategoryForm
        category={category}
        onSuccess={() => {
          navigate("/admin/produtos/categorias");
        }}
        onCancel={() => {
          navigate("/admin/produtos/categorias");
        }}
      />
    </div>
  );
}