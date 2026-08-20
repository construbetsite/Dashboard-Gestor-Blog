// ============================================================
// ProductFormPage
// ============================================================
//
// Página de criação/edição de Produto.
//
// Responsabilidades:
// - Carregar produto para edição
// - Carregar categorias
// - Criar produto
// - Atualizar produto
// - Controlar loading/erros
// - Redirecionar após sucesso
//
// ============================================================

import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ProductForm from "../../components/product/ProductForm";

import { useProduct } from "../../hooks/useProduct";
import useCreateProduct from "../../hooks/useProductMutations";
import { useUpdateProduct } from "../../hooks/useProductMutations";
import { useProductCategories } from "../../hooks/useProductCategories";

import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "../../types/product";

// ============================================================
// COMPONENT
// ============================================================

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  // ==========================================================
  // PRODUTO
  // ==========================================================

  const {
    product,
    loading: productLoading,
    error: productError,
  } = useProduct(id);

  // ==========================================================
  // CATEGORIAS
  // ==========================================================

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories();

  // ==========================================================
  // CREATE
  // ==========================================================

  const {
    createProduct,
    loading: creating,
    error: createError,
  } = useCreateProduct();

  // ==========================================================
  // UPDATE
  // ==========================================================

  const {
    updateProduct,
    loading: updating,
    error: updateError,
  } = useUpdateProduct();

  // ==========================================================
  // ESTADO DE SUBMIT
  // ==========================================================

  const submitting = creating || updating;

  // ==========================================================
  // ERRO ATUAL
  // ==========================================================

  const errorMessage =
    createError ||
    updateError ||
    productError ||
    categoriesError ||
    null;

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    data: CreateProductPayload | UpdateProductPayload
  ): Promise<boolean> => {
    try {
      // --------------------------------------------------------
      // EDIÇÃO
      // --------------------------------------------------------

      if (isEditing && id) {
        const result = await updateProduct(
          id,
          data as UpdateProductPayload
        );

        if (!result) {
          return false;
        }

        navigate("/admin/produtos");

        return true;
      }

      // --------------------------------------------------------
      // CRIAÇÃO
      // --------------------------------------------------------

      const result = await createProduct(
        data as CreateProductPayload
      );

      if (!result) {
        return false;
      }

      navigate("/admin/produtos");

      return true;
    } catch (error) {
      console.error(
        "[ProductFormPage] Erro ao salvar produto:",
        error
      );

      return false;
    }
  };

  // ==========================================================
  // LOADING DO PRODUTO
  // ==========================================================

  if (isEditing && productLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Carregando produto...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERRO AO CARREGAR PRODUTO
  // ==========================================================

  if (isEditing && productError) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/produtos"
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Voltar para produtos
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {productError}
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <Link
          to="/admin/produtos"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Voltar para produtos
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Editar produto" : "Novo produto"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? "Atualize as informações do produto."
            : "Cadastre um novo produto no catálogo da Construbet."}
        </p>
      </div>

      {/* ======================================================
          ERRO DE CATEGORIAS
      ====================================================== */}

      {categoriesError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar as categorias:
          <span className="ml-1">
            {categoriesError}
          </span>
        </div>
      )}

      {/* ======================================================
          FORMULÁRIO
      ====================================================== */}

      <ProductForm
        mode={isEditing ? "edit" : "create"}
        product={product ?? null}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onSubmit={handleSubmit}
        submitting={submitting}
        errorMessage={errorMessage}
      />
    </div>
  );
}