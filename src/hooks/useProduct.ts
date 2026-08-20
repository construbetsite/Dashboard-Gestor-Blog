// ============================================================
// useProduct
// ============================================================
//
// Busca um único produto por id ou slug. Replica o padrão de useBlogPost.

import { useCallback, useEffect, useState } from "react";
import { productService } from "../services/product.service";
import type { Product } from "../types/product";

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => Promise<void>;
}

export function useProduct(
  idOrSlug?: string,
  mode: "id" | "slug" = "id",
  autoFetch = true
): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(!!idOrSlug && autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  const fetchProduct = useCallback(async () => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data =
        mode === "slug"
          ? await productService.buscarPorSlug(idOrSlug)
          : await productService.buscarPorId(idOrSlug);
      setProduct(data);
    } catch (e: any) {
      console.error("❌ [useProduct] Erro:", e);
      if (e?.status === 404 || e?.message?.includes("404")) {
        setNotFound(true);
        setProduct(null);
      } else {
        setError(e?.message || "Erro ao carregar produto.");
      }
    } finally {
      setLoading(false);
    }
  }, [idOrSlug, mode]);

  useEffect(() => {
    if (autoFetch && idOrSlug) {
      void fetchProduct();
    }
  }, [idOrSlug, mode, autoFetch, fetchProduct]);

  return { product, loading, error, notFound, refetch: fetchProduct };
}
