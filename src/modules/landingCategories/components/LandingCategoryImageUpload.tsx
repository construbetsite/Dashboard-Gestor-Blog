// ============================================================
// LandingCategoryImageUpload
// ============================================================
//
// Upload de imagem específico do módulo Landing Categories.
// - Valida formato/tamanho no Front (JPEG, PNG, WEBP, GIF; máx. 5MB)
// - Mostra preview, nome/tamanho do arquivo, loading e erro
// - Permite substituir e limpar
// - Chama o Backend via useLandingCategoryUpload
//   e devolve { url, path, filename, size, mimeType, bucket }

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useLandingCategoryUpload } from "../hooks/useLandingCategoryUpload";
import { getImageUrl } from "../../../utils/imageUrl";
import type { LandingCategoryUploadResponse } from "../types/landingCategory";

interface LandingCategoryImageUploadProps {
  /** URL atual da imagem (modo edição) */
  initialImage?: string | null;
  /** Chamado sempre que um upload termina com sucesso */
  onUploaded: (image: LandingCategoryUploadResponse) => void;
  /** Chamado quando o usuário remove/limpa a imagem */
  onCleared?: () => void;
  /** Desabilita interações (ex.: durante submit do form) */
  disabled?: boolean;
  /**
   * Informa o formulário se um upload está em andamento,
   * para que o submit aguarde a URL atualizada (evita enviar
   * imagem antiga/vazia e causar erro no backend).
   */
  onUploadingChange?: (uploading: boolean) => void;
}

export default function LandingCategoryImageUpload({
  initialImage,
  onUploaded,
  onCleared,
  disabled = false,
  onUploadingChange,
}: LandingCategoryImageUploadProps) {
  const { loading, error, upload } = useLandingCategoryUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFileSize, setSelectedFileSize] = useState<number>(0);
  const [localError, setLocalError] = useState<string | null>(null);

  // Inicializa o preview com a imagem atual (modo edição)
  useEffect(() => {
    setPreviewUrl(initialImage ? getImageUrl(initialImage) : "");
    setSelectedFileName("");
    setSelectedFileSize(0);
    setLocalError(null);
  }, [initialImage]);

  // Notifica o formulário quando um upload começa/termina
  useEffect(() => {
    onUploadingChange?.(loading);
  }, [loading, onUploadingChange]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    // Permite re-selecionar o mesmo arquivo
    if (event.target) event.target.value = "";
    if (!file) return;

    setLocalError(null);

    // Preview local imediato
    const reader = new FileReader();
    reader.onload = () => {
      const result =
        typeof reader.result === "string" ? reader.result : "";
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
    setSelectedFileName(file.name);
    setSelectedFileSize(file.size);

    const response = await upload(file);
    if (response) {
      // Troca o preview para a URL pública retornada pelo Backend
      setPreviewUrl(getImageUrl(response.url));
      onUploaded(response);
    } else {
      // Erro já está em `error` (do hook); limpa a seleção
      setSelectedFileName("");
      setSelectedFileSize(0);
    }
  };

  const clearImage = () => {
    setPreviewUrl("");
    setSelectedFileName("");
    setSelectedFileSize(0);
    setLocalError(null);
    onCleared?.();
  };

  const displayError = localError || error;

  return (
    <div>
      {/* PREVIEW */}
      <div className="mb-3 overflow-hidden rounded-xl border-dashed border-slate-300 bg-slate-50">
        {loading ? (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="text-sm font-medium">
              Enviando imagem...
            </span>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview da categoria"
            className="h-56 w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon size={32} className="text-slate-400" />
              <span className="text-sm">
                Nenhuma imagem selecionada
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLES */}
      <div className="space-y-3 rounded-xl border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-lg border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 ${disabled || loading
                ? "pointer-events-none opacity-60"
                : ""
              }`}
          >
            <UploadCloud size={16} />
            {previewUrl ? "Substituir imagem" : "Selecionar imagem"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || loading}
            />
          </label>

          {previewUrl && (
            <button
              type="button"
              onClick={clearImage}
              disabled={disabled || loading}
              className="inline-flex items-center gap-2 rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
            >
              <Trash2 size={14} />
              Remover imagem
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500">
          {selectedFileName
            ? `📎 Arquivo: ${selectedFileName} (${(
              selectedFileSize / 1024
            ).toFixed(0)}KB)`
            : "📷 Formatos: JPEG, PNG, WEBP, GIF. Tamanho máximo: 5MB."}
        </p>

        {displayError && (
          <p className="text-xs text-rose-600">⚠️ {displayError}</p>
        )}
      </div>
    </div>
  );
}
