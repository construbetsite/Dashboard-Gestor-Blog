// ============================================================
// useLandingCategoryUpload
// ============================================================
//
// Encapsula o upload de imagem do módulo Landing Categories.
// - Valida o arquivo no Front (formato/tamanho)
// - Faz POST multipart para /api/landing-categories/upload
// - Devolve a resposta { url, path, filename, size, mimeType, bucket }

import { useCallback, useState } from "react";
import { landingCategoryUploadService } from "../services/landingCategoryUpload.service";
import {
  errorMessage,
} from "../utils/errors";
import { validateLandingImage } from "../utils/imageValidation";
import type { LandingCategoryUploadResponse } from "../types/landingCategory";

export interface UseLandingCategoryUploadResult {
  loading: boolean;
  error: string | null;
  /** Resposta do último upload bem-sucedido */
  lastResponse: LandingCategoryUploadResponse | null;
  /** Dispara o upload (valida o arquivo antes) */
  upload: (file: File) => Promise<LandingCategoryUploadResponse | null>;
  reset: () => void;
}

export function useLandingCategoryUpload(): UseLandingCategoryUploadResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] =
    useState<LandingCategoryUploadResponse | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setLastResponse(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<LandingCategoryUploadResponse | null> => {
      // Validação no Front (UX antes do Backend)
      const validation = validateLandingImage(file);
      if (!validation.valid) {
        setError(validation.error || "Imagem inválida.");
        setLastResponse(null);
        return null;
      }

      setLoading(true);
      setError(null);
      setLastResponse(null);

      try {
        const res = await landingCategoryUploadService.upload(file);
        setLastResponse(res);
        return res;
      } catch (e) {
        console.error("❌ [useLandingCategoryUpload] Erro:", e);
        setError(errorMessage(e, "Erro ao enviar imagem."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, lastResponse, upload, reset };
}
