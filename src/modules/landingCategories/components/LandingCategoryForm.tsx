// ============================================================
// LandingCategoryForm
// ============================================================
//
// Formulário de criação/edição de categoria da landing page.
//
// Campos: Título, URL de redirecionamento, Ordem, Status e
// upload de imagem (com preview + validação).
//
// - Validação em tempo real (título/URL obrigatórios, URL sem
//   espaços/caracteres especiais)
// - Upload via /api/landing-categories/upload antes do submit
// - Ao editar com nova imagem, a URL antiga é substituída no
//   payload (o Backend remove o arquivo antigo automaticamente)

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import type {
  CreateLandingCategoryPayload,
  LandingCategory,
  LandingCategoryUploadResponse,
} from "../types/landingCategory";
import { useLandingCategoryMutations } from "../hooks/useLandingCategoryMutations";
import { isValidRedirectUrl } from "../services/landingCategory.service";
import LandingCategoryImageUpload from "./LandingCategoryImageUpload";

interface LandingCategoryFormProps {
  /** Categoria existente (modo edição). Undefined = criação. */
  category?: LandingCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LandingCategoryForm({
  category,
  onSuccess,
  onCancel,
}: LandingCategoryFormProps) {
  const { createCategory, updateCategory, loading } =
    useLandingCategoryMutations();

  const isEditing = Boolean(category);

  // ============================================================
  // ESTADOS DOS CAMPOS
  // ============================================================

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [touched, setTouched] = useState({ title: false, url: false });

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  useEffect(() => {
    if (category) {
      setTitle(category.title ?? "");
      setUrl(category.url ?? "");
      setOrder(category.order ?? 0);
      setStatus(category.status ?? true);
      setImageUrl(category.image ?? "");
    } else {
      setTitle("");
      setUrl("");
      setOrder(0);
      setStatus(true);
      setImageUrl("");
    }
    setTouched({ title: false, url: false });
  }, [category]);

  // ============================================================
  // VALIDAÇÃO EM TEMPO REAL
  // ============================================================

  const validations = useMemo(() => {
    const titleError = !title.trim()
      ? "O título é obrigatório."
      : title.trim().length > 120
        ? "O título deve ter no máximo 120 caracteres."
        : null;

    const urlError = !url.trim()
      ? "A URL de redirecionamento é obrigatória."
      : !isValidRedirectUrl(url.trim())
        ? "URL inválida: use uma URL completa (ex.: https://www.construbet.com.br/ferramentas) ou um caminho relativo sem espaços ou caracteres especiais."
        : null;

    return { titleError, urlError };
  }, [title, url]);

  const showTitleError = touched.title && validations.titleError !== null;
  const showUrlError = touched.url && validations.urlError !== null;

  // ============================================================
  // UPLOAD DE IMAGEM
  // ============================================================

  const handleUploaded = useCallback(
    (res: LandingCategoryUploadResponse) => {
      setImageUrl(res.url);
    },
    []
  );

  const handleCleared = useCallback(() => {
    setImageUrl("");
  }, []);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Marca campos como tocados para exibir validação
    setTouched({ title: true, url: true });

    if (validations.titleError) {
      toast.error(validations.titleError);
      return;
    }
    if (validations.urlError) {
      toast.error(validations.urlError);
      return;
    }
    // Aguarda o upload da imagem terminar: se o usuário selecionou
    // uma nova imagem mas clicou em salvar antes, o `imageUrl` ainda
    // pode ser a URL antiga (ou vazia) — o que geraria erro 500 no
    // backend (field image vazio/inválido).
    if (uploading) {
      toast.warning("Aguarde o upload da imagem terminar antes de salvar.");
      return;
    }

    if (!imageUrl) {
      toast.error("Selecione e envie uma imagem para a categoria.");
      return;
    }

    const payload: CreateLandingCategoryPayload = {
      title: title.trim(),
      url: url.trim(),
      image: imageUrl,
      order: Number.isFinite(order) && order >= 0 ? Math.floor(order) : 0,
      status,
    };

    let success = false;

    if (category) {
      const result = await updateCategory(category.id, payload);
      success = Boolean(result);
    } else {
      const result = await createCategory(payload);
      success = Boolean(result);
    }

    if (!success) {
      toast.error(
        isEditing
          ? "Não foi possível atualizar a categoria."
          : "Não foi possível criar a categoria."
      );
      return;
    }

    toast.success(
      isEditing
        ? "Categoria atualizada com sucesso."
        : "Categoria criada com sucesso."
    );
    onSuccess();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Editar categoria" : "Nova categoria"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Categoria exibida na landing page da Construbet com
            imagem, título e link de redirecionamento.
          </p>
        </div>

        <div className="grid gap-5">
          {/* TÍTULO */}
          <div>
            <label
              htmlFor="landing-category-title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Título *
            </label>
            <input
              id="landing-category-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Ferramentas"
              maxLength={120}
              disabled={loading}
              autoComplete="off"
              className={`w-full rounded-lg border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:bg-slate-100 ${showTitleError
                  ? "focus:border-rose-500 focus:ring-rose-200"
                  : "focus:border-slate-500 focus:ring-slate-200"
                }`}
            />
            {showTitleError && (
              <p className="mt-1 text-xs text-rose-600">
                {validations.titleError}
              </p>
            )}
          </div>

          {/* URL DE REDIRECIONAMENTO */}
          <div>
            <label
              htmlFor="landing-category-url"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              URL de redirecionamento *
            </label>
            <input
              id="landing-category-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.construbet.com.br/ferramentas"
              disabled={loading}
              autoComplete="off"
              className={`w-full rounded-lg border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:bg-slate-100 ${showUrlError
                  ? "focus:border-rose-500 focus:ring-rose-200"
                  : "focus:border-slate-500 focus:ring-slate-200"
                }`}
            />
            {showUrlError ? (
              <p className="mt-1 text-xs text-rose-600">
                {validations.urlError}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Use uma URL completa (ex.: https://www.construbet.com.br/ferramentas)
                ou um caminho relativo (ex.: construbet/ferramentas).
              </p>
            )}
          </div>

          {/* UPLOAD DE IMAGEM */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Imagem *
            </label>
            <LandingCategoryImageUpload
              initialImage={category?.image ?? null}
              onUploaded={handleUploaded}
              onCleared={handleCleared}
              disabled={loading}
              onUploadingChange={setUploading}
            />

            {imageUrl ? (
              <p className="mt-2 truncate rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-400">
                Imagem atual: {imageUrl}
              </p>
            ) : (
              <p className="mt-2 text-xs text-rose-600">
                Envie uma imagem para continuar.
              </p>
            )}
          </div>

          {/* ORDEM + STATUS */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* ORDEM */}
            <div>
              <label
                htmlFor="landing-category-order"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Ordem de exibição
              </label>
              <input
                id="landing-category-order"
                type="number"
                min={0}
                step={1}
                value={order}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setOrder(
                    Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
                  );
                }}
                disabled={loading}
                className="w-full rounded-lg border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                Menor valor aparece primeiro.
              </p>
            </div>

            {/* STATUS */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 accent-[#004AAD]"
                />
                <span className="text-sm font-medium text-slate-700">
                  Categoria ativa
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="mt-8 flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(loading || uploading) && (
              <Loader2 size={17} className="animate-spin" />
            )}
            {loading
              ? "Salvando..."
              : uploading
              ? "Enviando imagem..."
              : isEditing
              ? "Salvar alterações"
              : "Criar categoria"}
          </button>
        </div>
      </div>
    </form>
  );
}
