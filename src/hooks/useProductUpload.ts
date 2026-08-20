// ============================================================
// useProductUpload
// ============================================================
//
// Encapsula o upload de imagem do produto.
// Valida no Front, faz POST multipart para o Backend,
// devolve a resposta (url/path/...) para o componente.

import { useCallback, useState } from "react";
import { productUploadService } from "../services/productUpload.service";
import {
  validateImageFile,
  formatUploadError,
} from "../utils/imageValidation";
import type { ProductUploadResponse } from "../types/product";

interface UseProductUploadResult {
  loading: boolean;
  error: string | null;
  /** resposta do último upload bem-sucedido */
  lastResponse: ProductUploadResponse | null;
  /** dispara o upload, validando o arquivo no Front antes */
  upload: (file: File) => Promise<ProductUploadResponse | null>;
  reset: () => void;
}

export function useProductUpload(): UseProductUploadResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] =
    useState<ProductUploadResponse | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setLastResponse(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<ProductUploadResponse | null> => {
      // 1) validação no Front (UX antes do Backend)
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Imagem inválida.");
        setLastResponse(null);
        return null;
      }

      setLoading(true);
      setError(null);
      setLastResponse(null);

      try {
        console.log("📤 [useProductUpload] Enviando...", file.name);
        const res = await productUploadService.upload(file);
        if (!res?.success) {
          throw new Error(res?.message || "Falha no upload da imagem.");
        }
        console.log("✅ [useProductUpload] Upload concluído:", res.data);
        setLastResponse(res);
        return res;
      } catch (e: any) {
        console.error("❌ [useProductUpload] Erro:", e);
        const status = e?.status ?? e?.response?.status;
        const message = status
          ? formatUploadError(status, e?.message)
          : e?.message || "Erro ao enviar imagem.";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, lastResponse, upload, reset };
}
