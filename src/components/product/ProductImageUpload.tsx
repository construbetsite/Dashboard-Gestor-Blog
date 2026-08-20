// ============================================================
// ProductImageUpload
// ============================================================
//
// Componente de upload de imagem para o módulo Produto.
// - Valida tamanho/formato no Front (utils/imageValidation.ts)
// - Mostra preview, nome, tamanho, loading e erro
// - Permite substituir e limpar
// - Chama o Backend via useProductUpload; devolve url/path/filename/mimeType/bucket

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useProductUpload } from "../../hooks/useProductUpload";
import { getImageUrl } from "../../utils/imageUrl";

export interface UploadedProductImage {
  url: string;
  path: string;
  filename: string;
  size: number;
  mimeType: string;
  bucket: string;
}

interface ProductImageUploadProps {
  /** URL atual da imagem (em modo edição) */
  initialUrl?: string | null;
  /** chamado sempre que um upload termina com sucesso */
  onUploaded: (image: UploadedProductImage) => void;
  /** chamado quando o usuário remove a imagem */
  onCleared?: () => void;
  /** desabilita interações (ex: durante submit do form) */
  disabled?: boolean;
}

export default function ProductImageUpload({
  initialUrl,
  onUploaded,
  onCleared,
  disabled = false,
}: ProductImageUploadProps) {
  const { loading, error, upload } = useProductUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFileSize, setSelectedFileSize] = useState<number>(0);
  const [localError, setLocalError] = useState<string | null>(null);

  // Inicializa preview com a imagem atual (edição)
  useEffect(() => {
    if (initialUrl) {
      setPreviewUrl(getImageUrl(initialUrl));
    } else {
      setPreviewUrl("");
    }
    setSelectedFileName("");
    setSelectedFileSize(0);
    setLocalError(null);
  }, [initialUrl]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    // permite re-selecionar o mesmo arquivo
    if (event.target) event.target.value = "";
    if (!file) return;

    setLocalError(null);

    // preview local imediato
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
    if (response?.success) {
      // troca o preview para a URL pública retornada pelo Backend
      setPreviewUrl(getImageUrl(response.data.url));
      onUploaded({
        url: response.data.url,
        path: response.data.path,
        filename: response.data.filename,
        size: response.data.size,
        mimeType: response.data.mimeType,
        bucket: response.data.bucket,
      });
    } else {
      // erro já está em `error` (do hook); limpa seleção
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
      <div className="mb-3 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
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
            alt="Preview do produto"
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

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 ${
              disabled || loading
                ? "pointer-events-none opacity-60"
                : ""
            }`}
          >
            <UploadCloud size={16} />
            {previewUrl ? "Substituir imagem" : "Selecionar imagem"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
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
            : "📷 Formatos: JPEG, PNG, WEBP. Tamanho máximo: 5MB."}
        </p>

        {displayError && (
          <p className="text-xs text-rose-600">⚠️ {displayError}</p>
        )}
      </div>
    </div>
  );
}
