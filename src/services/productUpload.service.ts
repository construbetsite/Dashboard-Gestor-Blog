// ============================================================
// PRODUCT UPLOAD SERVICE
// ============================================================
//
// ✅ POST /api/product/upload (multipart/form-data, campo "image")
// ✅ Backend retorna { success, data: { url, path, filename, size, mimeType, bucket } }

import { api } from "./api.service";
import type { ProductUploadResponse } from "../types/product";

export const productUploadService = {
  /**
   * Envia uma imagem para o Backend, que a armazena no Supabase Storage
   * e devolve os metadados para que o Front guarde e use ao criar/editar
   * o produto.
   *
   * @param file Arquivo selecionado pelo usuário
   */
  async upload(file: File): Promise<ProductUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    // api.post lida com FormData (remove Content-Type para o browser definir
    // o boundary automaticamente).
    return api.post<ProductUploadResponse>(
      '/product/upload',
      formData
    );
  },
};

export const productUploadApi = productUploadService;
