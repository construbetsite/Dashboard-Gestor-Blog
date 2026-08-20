// ============================================================
// ProductCategoryForm
// ============================================================
//
// Formulário de criação/edição de Categoria de Produto.
//
// Responsabilidades:
// - Criar categoria
// - Editar categoria
// - Validar campos básicos
// - Gerar slug automaticamente quando necessário
// - Informar sucesso/cancelamento para a página
//
// ============================================================

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import type {
  ProductCategory,
  CreateProductCategoryPayload,
} from "../../types/productCategory";

import { useProductCategoryMutations } from "../../hooks/useProductCategories";

import { slugify } from "../../utils/slugify";

// ============================================================
// PROPS
// ============================================================

export interface ProductCategoryFormProps {
  /**
   * Categoria existente quando estiver editando.
   *
   * Quando undefined:
   * modo criação.
   */
  category?: ProductCategory;

  /**
   * Executado após criação/edição bem-sucedida.
   *
   * A página é responsável pela navegação.
   */
  onSuccess: () => void;

  /**
   * Executado quando o usuário cancela.
   */
  onCancel: () => void;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ProductCategoryForm({
  category,
  onSuccess,
  onCancel,
}: ProductCategoryFormProps) {
  const {
    createCategory,
    updateCategory,
  } = useProductCategoryMutations();

  // ============================================================
  // ESTADOS
  // ============================================================

  const [name, setName] = useState("");

  const [slug, setSlug] = useState("");

  const [description, setDescription] = useState("");

  const [active, setActive] = useState(true);

  const [displayOrder, setDisplayOrder] =
    useState<number>(0);

  const [loading, setLoading] =
    useState(false);

  // ============================================================
  // MODO
  // ============================================================

  const isEditing = Boolean(category);

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

  useEffect(() => {
    if (category) {
      setName(category.name ?? "");

      setSlug(category.slug ?? "");

      setDescription(
        category.description ?? ""
      );

      setActive(
        category.active ?? true
      );

      setDisplayOrder(
        category.displayOrder ?? 0
      );

      return;
    }

    // ----------------------------------------------------------
    // NOVO CADASTRO
    // ----------------------------------------------------------

    setName("");

    setSlug("");

    setDescription("");

    setActive(true);

    setDisplayOrder(0);
  }, [category]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // ----------------------------------------------------------
    // NORMALIZAÇÃO
    // ----------------------------------------------------------

    const normalizedName =
      name.trim();

    const normalizedSlug =
      slug.trim();

    const normalizedDescription =
      description.trim();

    // ----------------------------------------------------------
    // VALIDAÇÃO DO NOME
    // ----------------------------------------------------------

    if (!normalizedName) {
      toast.error(
        "Informe o nome da categoria."
      );

      return;
    }

    if (normalizedName.length > 255) {
      toast.error(
        "O nome da categoria deve ter no máximo 255 caracteres."
      );

      return;
    }

    // ----------------------------------------------------------
    // GERAÇÃO DO SLUG
    // ----------------------------------------------------------

    const generatedSlug =
      normalizedSlug ||
      slugify(normalizedName);

    if (!generatedSlug) {
      toast.error(
        "Não foi possível gerar o slug da categoria."
      );

      return;
    }

    // ----------------------------------------------------------
    // NORMALIZAÇÃO DA ORDEM
    // ----------------------------------------------------------

    const normalizedDisplayOrder =
      Number.isFinite(displayOrder) &&
      displayOrder >= 0
        ? Math.floor(displayOrder)
        : 0;

    // ----------------------------------------------------------
    // PAYLOAD
    // ----------------------------------------------------------

    const payload: CreateProductCategoryPayload = {
      name: normalizedName,

      slug: generatedSlug,

      description:
        normalizedDescription || null,

      active,

      displayOrder:
        normalizedDisplayOrder,
    };

    // ----------------------------------------------------------
    // LOADING
    // ----------------------------------------------------------

    setLoading(true);

    try {
      let success = false;

      // ========================================================
      // EDIÇÃO
      // ========================================================

      if (category) {
        const result =
          await updateCategory(
            category.id,
            payload
          );

        /**
         * O hook retorna ProductCategory | null.
         *
         * Portanto:
         * - objeto = sucesso
         * - null = falha
         */
        success = Boolean(result);
      }

      // ========================================================
      // CRIAÇÃO
      // ========================================================

      else {
        const result =
          await createCategory(
            payload
          );

        /**
         * Mesmo contrato:
         * - ProductCategory = sucesso
         * - null = falha
         */
        success = Boolean(result);
      }

      // ========================================================
      // FALHA
      // ========================================================

      if (!success) {
        toast.error(
          isEditing
            ? "Não foi possível atualizar a categoria."
            : "Não foi possível criar a categoria."
        );

        return;
      }

      // ========================================================
      // SUCESSO
      // ========================================================

      toast.success(
        isEditing
          ? "Categoria atualizada com sucesso."
          : "Categoria criada com sucesso."
      );

      /**
       * A página decide a navegação.
       */
      onSuccess();

    } catch (error) {
      console.error(
        "[ProductCategoryForm] Erro ao salvar categoria:",
        error
      );

      toast.error(
        "Erro ao salvar categoria. Tente novamente."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing
              ? "Editar categoria"
              : "Nova categoria"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Organize os produtos da Construbet por categorias.
          </p>
        </div>

        {/* ======================================================
            CAMPOS
        ====================================================== */}

        <div className="grid gap-5">

          {/* ====================================================
              NOME
          ==================================================== */}

          <div>
            <label
              htmlFor="product-category-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nome *
            </label>

            <input
              id="product-category-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Ex.: Materiais de construção"
              maxLength={255}
              disabled={loading}
              required
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>

          {/* ====================================================
              SLUG
          ==================================================== */}

          <div>
            <label
              htmlFor="product-category-slug"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Slug
            </label>

            <input
              id="product-category-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value
                )
              }
              placeholder="materiais-de-construcao"
              disabled={loading}
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />

            <p className="mt-1 text-xs text-slate-500">
              Se deixar vazio, o slug será gerado automaticamente.
            </p>
          </div>

          {/* ====================================================
              DESCRIÇÃO
          ==================================================== */}

          <div>
            <label
              htmlFor="product-category-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Descrição
            </label>

            <textarea
              id="product-category-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Descrição da categoria..."
              rows={4}
              disabled={loading}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>

          {/* ====================================================
              ORDEM + STATUS
          ==================================================== */}

          <div className="grid gap-5 md:grid-cols-2">

            {/* --------------------------------------------------
                ORDEM
            -------------------------------------------------- */}

            <div>
              <label
                htmlFor="product-category-order"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Ordem de exibição
              </label>

              <input
                id="product-category-order"
                type="number"
                min={0}
                step={1}
                value={displayOrder}
                onChange={(event) => {
                  const value =
                    Number(
                      event.target.value
                    );

                  setDisplayOrder(
                    Number.isFinite(value)
                      ? Math.max(
                          0,
                          Math.floor(value)
                        )
                      : 0
                  );
                }}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </div>

            {/* --------------------------------------------------
                STATUS
            -------------------------------------------------- */}

            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(
                      event.target.checked
                    )
                  }
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm font-medium text-slate-700">
                  Categoria ativa
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* ======================================================
            AÇÕES
        ====================================================== */}

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">

          {/* ====================================================
              CANCELAR
          ==================================================== */}

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          {/* ====================================================
              SALVAR
          ==================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {loading
              ? "Salvando..."
              : isEditing
              ? "Salvar alterações"
              : "Criar categoria"}
          </button>

        </div>
      </div>
    </form>
  );
}