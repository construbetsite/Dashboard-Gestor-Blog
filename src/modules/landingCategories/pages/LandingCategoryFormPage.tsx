// ============================================================
// LandingCategoryFormPage
// ============================================================
//
// Página do formulário de criação/edição.
// - /nova → criação
// - /editar/:id → edição (busca a categoria via API)

import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useLandingCategoryById } from "../hooks/useLandingCategoryById";
import LandingCategoryForm from "../components/LandingCategoryForm";
import { LANDING_CATEGORIES_ROUTES } from "../routes";

export default function LandingCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // A rota de criação não tem :id
  const categoryId = id ? Number(id) : undefined;
  const isEditing = categoryId !== undefined && !Number.isNaN(categoryId);

  const { category, loading, error } = useLandingCategoryById(
    isEditing ? categoryId : undefined
  );

  // ============================================================
  // LOADING (edição)
  // ============================================================

  if (isEditing && loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Carregando categoria...
        </div>
      </div>
    );
  }

  // ============================================================
  // NÃO ENCONTRADA (edição)
  // ============================================================

  if (isEditing && !category) {
    return (
      <div className="space-y-4">
        <Link
          to={LANDING_CATEGORIES_ROUTES.list}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Voltar para categorias
        </Link>

        <div className="rounded-lg border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Categoria não encontrada."}
        </div>
      </div>
    );
  }

  // ============================================================
  // FORM
  // ============================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <Link
          to={LANDING_CATEGORIES_ROUTES.list}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Voltar para categorias
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Editar categoria" : "Nova categoria"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? "Atualize as informações da categoria da landing page."
            : "Cadastre uma nova categoria para a landing page."}
        </p>
      </div>

      {/* FORM */}
      <LandingCategoryForm
        category={category ?? undefined}
        onSuccess={() => navigate(LANDING_CATEGORIES_ROUTES.list)}
        onCancel={() => navigate(LANDING_CATEGORIES_ROUTES.list)}
      />
    </div>
  );
}
