// ============================================================
// LANDING CATEGORY UPLOAD SERVICE
// ============================================================
//
// ✅ POST /api/landing-categories/upload (multipart/form-data,
//    campo "image")
// ✅ Resposta documentada:
//    { url, path, filename, size, mimeType, bucket }
//
// 🛡️ Defensivo: também aceita o wrapper `{ success, data: {...} }`
//    usado pelos demais módulos do painel.

import { api } from "../../../services/api.service";
import type { LandingCategoryUploadResponse } from "../types/landingCategory";

/** Normaliza a resposta de upload (direta ou com wrapper `data`). */
function extractUploadResponse(
  res: LandingCategoryUploadResponse | { data?: LandingCategoryUploadResponse }
): LandingCategoryUploadResponse {
  const candidate = res && typeof res === "object" && "url" in res
    ? (res as LandingCategoryUploadResponse)
    : (res as { data?: LandingCategoryUploadResponse })?.data;

  if (!candidate || !candidate.url || !candidate.path) {
    throw new Error("Resposta de upload inválida.");
  }

  return candidate;
}

export const landingCategoryUploadService = {
  async upload(file: File): Promise<LandingCategoryUploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    // api.post lida com FormData (remove Content-Type automaticamente
    // para o browser definir o boundary corretamente).
    const res = await api.post<
      LandingCategoryUploadResponse | { data: LandingCategoryUploadResponse }
    >("/landing-categories/upload", formData);

    return extractUploadResponse(res);
  },
};

export const landingCategoryUploadApi = landingCategoryUploadService;
