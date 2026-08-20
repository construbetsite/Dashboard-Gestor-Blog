// ============================================================
// useProductCategories
// ============================================================
//
// Lista + mutações de categorias de produto.
// Mantém o módulo isolado do Blog.

import { useCallback, useEffect, useState } from "react";
import { productCategoryService } from "../services/productCategory.service";
import type {
  CreateProductCategoryPayload,
  ListProductCategoriesParams,
  ProductCategory,
  UpdateProductCategoryPayload,
} from "../types/productCategory";

// ============================================================
// LISTAR
// ============================================================

interface UseProductCategoriesResult {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (next: ListProductCategoriesParams) => void;
  filters: ListProductCategoriesParams;
}

export function useProductCategories(
  initial: ListProductCategoriesParams = {}
): UseProductCategoriesResult {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] =
    useState<ListProductCategoriesParams>(initial);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📡 [useProductCategories] Listando...", filters);
      const data = await productCategoryService.listar(filters);
      setCategories(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("❌ [useProductCategories] Erro:", e);
      setError(e?.message || "Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    categories,
    loading,
    error,
    refetch,
    setFilters,
    filters,
  };
}

// ============================================================
// BUSCAR ÚNICA CATEGORIA
// ============================================================

export function useProductCategoryById(id?: string) {
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await productCategoryService.buscarPorId(id);
      setCategory(data);
    } catch (e: any) {
      console.error("❌ [useProductCategoryById] Erro:", e);
      setError(e?.message || "Erro ao carregar categoria.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { category, loading, error, refetch };
}

// ============================================================
// CRIAR / EDITAR / EXCLUIR
// ============================================================

interface UseProductCategoryMutationsResult {
  loading: boolean;
  error: string | null;
  createCategory: (
    data: CreateProductCategoryPayload
  ) => Promise<ProductCategory | null>;
  updateCategory: (
    id: string,
    data: UpdateProductCategoryPayload
  ) => Promise<ProductCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export function useProductCategoryMutations(): UseProductCategoryMutationsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (
    data: CreateProductCategoryPayload
  ): Promise<ProductCategory | null> => {
    setLoading(true);
    setError(null);
    try {
      return await productCategoryService.criar(data);
    } catch (e: any) {
      setError(e?.message || "Erro ao criar categoria.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    data: UpdateProductCategoryPayload
  ): Promise<ProductCategory | null> => {
    setLoading(true);
    setError(null);
    try {
      return await productCategoryService.editar(id, data);
    } catch (e: any) {
      setError(e?.message || "Erro ao atualizar categoria.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await productCategoryService.deletar(id);
      return true;
    } catch (e: any) {
      setError(e?.message || "Erro ao excluir categoria.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createCategory, updateCategory, deleteCategory };
}
