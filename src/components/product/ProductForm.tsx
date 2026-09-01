// ============================================================
// ProductForm
// ============================================================
//
// Formulário de criação/edição de Produto.
// Regras dinâmicas:
//   - PICKUP       → mostra Preço (obrigatório), esconde URL
//   - ECOMMERCE    → mostra URL (obrigatória),  esconde Preço
// Upload de imagem separado do submit do produto.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type {
  CommercialType,
  CreateProductPayload,
  Product,

  UpdateProductPayload,
} from "../../types/product";
import type {ProductCategory} from "../../types/productCategory";
import { COMMERCIAL_TYPE_LABELS } from "../../types/product";
import { slugify } from "../../utils/slugify";
import ProductImageUpload, {
  type UploadedProductImage,
} from "./ProductImageUpload";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product | null;
  categories: ProductCategory[];
  categoriesLoading: boolean;
  onSubmit: (
    data: CreateProductPayload | UpdateProductPayload
  ) => Promise<boolean>;
  submitting: boolean;
  errorMessage?: string | null;
}

interface FormState {
  name: string;
  slug: string;
  brand: string;
  sku: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  commercialType: CommercialType;
  price: string; // mantemos string no form para evitar problemas de digitação
  redirectUrl: string;
  active: boolean;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  slug: "",
  brand: "",
  sku: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  commercialType: "PICKUP",
  price: "",
  redirectUrl: "",
  active: true,
  featured: false,
  metaTitle: "",
  metaDescription: "",
};

export default function ProductForm({
  mode,
  product,
  categories,
  categoriesLoading,
  onSubmit,
  submitting,
  errorMessage,
}: ProductFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [autoSlug, setAutoSlug] = useState(true);
  const [image, setImage] = useState<UploadedProductImage | null>(null);
  const [imageCleared, setImageCleared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carrega dados do produto no modo edição
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        slug: product.slug ?? "",
        brand: product.brand ?? "",
        sku: product.sku ?? "",
        shortDescription: product.shortDescription ?? "",
        description: product.description ?? "",
        categoryId: product.categoryId ?? "",
        commercialType: product.commercialType ?? "PICKUP",
        price:
          product.price === null || product.price === undefined
            ? ""
            : String(product.price),
        redirectUrl: product.redirectUrl ?? "",
        active: product.active ?? true,
        featured: product.featured ?? false,
        metaTitle: product.metaTitle ?? "",
        metaDescription: product.metaDescription ?? "",
      });
      setAutoSlug(false);
      setImage(null);
      setImageCleared(false);
    } else {
      setForm(INITIAL_STATE);
      setAutoSlug(true);
      setImage(null);
      setImageCleared(false);
    }
    setErrors({});
  }, [product]);

  // Auto-gera slug a partir do nome (apenas em create e quando permitido)
  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(form.name) }));
    }
  }, [form.name, autoSlug]);

  const isPickup = form.commercialType === "PICKUP";
  const isEcommerce = form.commercialType === "ECOMMERCE";

  // Troca manual do tipo comercial pelo usuário.
  // Limpa o campo do tipo oposto APENAS aqui (no evento), preservando
  // os valores carregados da API. Não usar useEffect para limpar: ele
  // roda no mesmo ciclo do carregamento do produto e sobrescreve o
  // redirectUrl/price recém-populados com string vazia (bug do edit).
  const handleCommercialTypeChange = (value: CommercialType) => {
    setForm((prev) => {
      const next: FormState = {
        ...prev,
        commercialType: value,
      };
      if (value === "PICKUP") {
        next.redirectUrl = "";
      } else if (value === "ECOMMERCE") {
        next.price = "";
      }
      return next;
    });
  };

  const handleChange = (
    field: keyof FormState,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (img: UploadedProductImage) => {
    setImage(img);
    setImageCleared(false);
  };

  const handleImageCleared = () => {
    setImage(null);
    setImageCleared(true);
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório.";
    if (!form.description.trim()) e.description = "Descrição é obrigatória.";
    if (!form.categoryId) e.categoryId = "Selecione uma categoria.";
    if (!form.commercialType)
      e.commercialType = "Selecione o tipo comercial.";

    if (isPickup) {
      if (!form.price.trim()) {
        e.price = "Produtos de retirada exigem preço.";
      } else {
        const p = Number(form.price.replace(",", "."));
        if (Number.isNaN(p) || p < 0) {
          e.price = "Preço inválido.";
        }
      }
    }

    if (isEcommerce) {
      if (!form.redirectUrl.trim()) {
        e.redirectUrl = "Produtos de e-commerce exigem URL.";
      } else {
        try {
          new URL(form.redirectUrl.trim());
        } catch {
          e.redirectUrl = "URL inválida.";
        }
      }
    }

    return e;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const local = validate();
    setErrors(local);
    if (Object.keys(local).length > 0) return;

    const base: CreateProductPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      commercialType: form.commercialType,
      slug: form.slug.trim() || undefined,
      sku: form.sku.trim() || null,
      brand: form.brand.trim() || null,
      shortDescription: form.shortDescription.trim() || null,
      active: form.active,
      featured: form.featured,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
    };

    if (isPickup) {
      const p = Number(form.price.replace(",", "."));
      base.price = Number.isNaN(p) ? null : p;
      base.redirectUrl = null;
    }
    if (isEcommerce) {
      base.redirectUrl = form.redirectUrl.trim() || null;
      base.price = null;
    }

    // dados de imagem (vindos do upload separado)
    if (image) {
      base.imageUrl = image.url;
      base.imagePath = image.path;
      base.imageFilename = image.filename;
      base.imageSize = image.size;
      base.imageMimeType = image.mimeType;
      base.storageBucket = image.bucket;
    }

    const ok = await onSubmit(base);
    if (ok) {
      // navigate é responsabilidade da página
    }
  };

  const initialImageUrl = useMemo(() => {
    if (image?.url) return image.url;
    return product?.imageUrl ?? null;
  }, [image, product]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <strong>Erro:</strong> {errorMessage}
        </div>
      )}

      {/* NOME + SLUG */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              handleChange("slug", e.target.value);
              setAutoSlug(false);
            }}
            placeholder="gerado-automaticamente"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Deixe em branco para gerar a partir do nome.
          </p>
        </div>
      </div>

      {/* DESCRIÇÃO CURTA + DESCRIÇÃO */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Descrição curta
        </label>
        <input
          type="text"
          value={form.shortDescription}
          onChange={(e) => handleChange("shortDescription", e.target.value)}
          placeholder="Resumo exibido em cards e listas"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Descrição completa *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* MARCA + SKU */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Marca
          </label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            SKU
          </label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CATEGORIA + TIPO COMERCIAL */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Categoria *
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
            disabled={categoriesLoading}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">
              {categoriesLoading
                ? "Carregando categorias..."
                : "Selecione uma categoria"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.categoryId}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo comercial *
          </label>
          <select
            value={form.commercialType}
            onChange={(e) =>
              handleCommercialTypeChange(
                e.target.value as CommercialType
              )
            }
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(COMMERCIAL_TYPE_LABELS) as CommercialType[]).map(
              (ct) => (
                <option key={ct} value={ct}>
                  {COMMERCIAL_TYPE_LABELS[ct]}
                </option>
              )
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Define quais campos abaixo são obrigatórios.
          </p>
        </div>
      </div>

      {/* PREÇO (PICKUP) ou URL (ECOMMERCE) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        {isPickup ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Preço (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="0.00"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-rose-600">{errors.price}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Produtos de retirada na Construbet exigem preço público.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              URL do e-commerce *
            </label>
            <input
              type="url"
              value={form.redirectUrl}
              onChange={(e) => handleChange("redirectUrl", e.target.value)}
              placeholder="https://loja.exemplo.com/produto/..."
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            {errors.redirectUrl && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.redirectUrl}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Página do produto no e-commerce externo. O botão principal será
              "Ir para o e-commerce".
            </p>
          </div>
        )}
      </div>

      {/* IMAGEM */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Imagem do produto
        </label>
        <ProductImageUpload
          initialUrl={imageCleared ? null : initialImageUrl}
          onUploaded={handleImageUploaded}
          onCleared={handleImageCleared}
          disabled={submitting}
        />
      </div>

      {/* DESTAQUE (featured) */}
      <div className="flex items-center justify-between rounded-xl border-slate-200 bg-white p-4">
        <div className="pr-4">
          <p className="text-sm font-medium text-slate-700">
            Produto em destaque
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Exibe este produto em destaque na home e vitrines.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={form.featured}
          aria-label="Produto em destaque"
          onClick={() => handleChange("featured", !form.featured)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            form.featured ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              form.featured ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* SEO */}
      <details className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Configurações extras (SEO)
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Meta título
            </label>
            <input
              type="text"
              value={form.metaTitle}
              onChange={(e) => handleChange("metaTitle", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Meta descrição
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) =>
                handleChange("metaDescription", e.target.value)
              }
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </details>

      {/* STATUS */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleChange("active", true)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              form.active
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Ativo
          </button>
          <button
            type="button"
            onClick={() => handleChange("active", false)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              !form.active
                ? "border-rose-500 bg-rose-50 text-rose-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Inativo
          </button>
        </div>
      </div>

      {/* BOTÕES */}
      <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting
            ? "Salvando..."
            : mode === "edit"
              ? "Atualizar"
              : "Criar produto"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/produtos")}
          className="rounded-lg bg-slate-200 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
