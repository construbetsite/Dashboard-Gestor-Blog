// ============================================================
// useProductMutations
// ============================================================
//
// Hooks de mutação para criar/atualizar/excluir produtos.
// Padrão equivalente ao Blog (useCreatePost / useUpdatePost / useDeletePost).

import { useCallback, useState } from "react";
import { productService } from "../services/product.service";
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "../types/product";

// ============================================================
// CRIAR
// ============================================================

interface UseCreateProductResult {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  createProduct: (data: CreateProductPayload) => Promise<Product | null>;
}

export default function useCreateProduct(): UseCreateProductResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createProduct = async (
    data: CreateProductPayload
  ): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      console.log("� [useCreateProduct] Criando...", data);
      const product = await productService.criar(data);
      console.log("✅ [useCreateProduct] Produto criado:", product);
      return product;
    } catch (e: any) {
      console.error("❌ [useCreateProduct] Erro:", e);
      const message = e?.message || "Erro ao criar produto.";
      setError(message);
      if (e?.errors && Array.isArray(e.errors)) {
        // Backend de validação Joi devolve array de strings em `errors`
        setFieldErrors({ _global: message });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fieldErrors, createProduct };
}

// ============================================================
// ATUALIZAR
// ============================================================

interface UseUpdateProductResult {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  updateProduct: (
    id: string,
    data: UpdateProductPayload
  ) => Promise<Product | null>;
}

export function useUpdateProduct(): UseUpdateProductResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateProduct = async (
    id: string,
    data: UpdateProductPayload
  ): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      console.log(`📝 [useUpdateProduct] Atualizando ${id}...`, data);
      const product = await productService.editar(id, data);
      console.log("✅ [useUpdateProduct] Produto atualizado:", product);
      return product;
    } catch (e: any) {
      console.error("❌ [useUpdateProduct] Erro:", e);
      const message = e?.message || "Erro ao atualizar produto.";
      setError(message);
      if (e?.errors && Array.isArray(e.errors)) {
        setFieldErrors({ _global: message });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fieldErrors, updateProduct };
}

// ============================================================
// EXCLUIR
// ============================================================

interface UseDeleteProductResult {
  loading: boolean;
  error: string | null;
  deleteProduct: (id: string) => Promise<boolean>;
}

export function useDeleteProduct(): UseDeleteProductResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        console.log(`�️ [useDeleteProduct] Excluindo ${id}...`);
        await productService.deletar(id);
        return true;
      } catch (e: any) {
        console.error("❌ [useDeleteProduct] Erro:", e);
        setError(e?.message || "Erro ao excluir produto.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, deleteProduct };
}
