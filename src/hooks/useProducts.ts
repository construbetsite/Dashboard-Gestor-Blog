// ============================================================
// useProducts
// ============================================================
//
// Lista produtos com filtros reativos. Replica o padrão do Blog
// (useBlogPost + BlogPostsList) mas para o módulo Product.

import { useCallback, useEffect, useState } from "react";
import { productService } from "../services/product.service";
import type {
  Product,
  ListProductsParams,
} from "../types/product";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (next: ListProductsParams) => void;
  filters: ListProductsParams;
}

export function useProducts(
  initial: ListProductsParams = {}
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListProductsParams>(initial);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📡 [useProducts] Buscando produtos...", filters);
      const data = await productService.listar(filters);
      console.log("✅ [useProducts] Produtos recebidos:", data.length);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("❌ [useProducts] Erro:", e);
      setError(e?.message || "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    setFilters,
    filters,
  };
}
