// ============================================================
// useLeads
// ============================================================
//
// Estado completo da listagem de leads (dashboard):
// - Paginação server-side (page/limit)
// - Busca com debounce (nome, e-mail, WhatsApp)
// - Filtro por status ("" | "true" | "false")
// - Ordenação por coluna (whitelist do backend)
//
// Implementação com hooks nativos (padrão do projeto - sem
// React Query instalado).

import { useCallback, useEffect, useState } from "react";

import { leadService } from "../services/leadService";
import { errorMessage } from "../utils/errors";
import type {
  Lead,
  LeadPagination,
  LeadStatusFilter,
  SortableLeadField,
  SortOrder,
} from "../types/lead.types";

const DEBOUNCE_MS = 450;

interface LeadsFilters {
  page: number;
  limit: number;
  search?: string;
  status: LeadStatusFilter;
  sortBy: SortableLeadField;
  sortOrder: SortOrder;
}

export interface UseLeadsResult {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  /** Valor bruto do campo de busca (atualiza em tempo real). */
  search: string;
  setSearch: (value: string) => void;
  status: LeadStatusFilter;
  setStatus: (value: LeadStatusFilter) => void;
  sortBy: SortableLeadField;
  sortOrder: SortOrder;
  toggleSort: (field: SortableLeadField) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

export function useLeads(initialLimit = 10): UseLeadsResult {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<LeadsFilters>({
    page: 1,
    limit: initialLimit,
    status: "",
    sortBy: "created_at",
    sortOrder: "DESC",
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<LeadPagination>({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // DEBOUNCE DA BUSCA
  // ------------------------------------------------------------
  // O termo digitado só vira filtro após um intervalo sem
  // digitação; ao aplicar, volta para a página 1.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) =>
        prev.search === search ? prev : { ...prev, search, page: 1 }
      );
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

  // ------------------------------------------------------------
  // BUSCA NA API
  // ------------------------------------------------------------

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadService.listar({
        page: filters.page,
        limit: filters.limit,
        search: filters.search?.trim() || undefined,
        status: filters.status || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setLeads(res.data);
      setMeta(res.meta);
    } catch (e) {
      console.error("❌ [useLeads] Erro:", e);
      setError(errorMessage(e, "Erro ao carregar leads."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // ------------------------------------------------------------
  // SETTERS (filtros sempre resetam para a página 1)
  // ------------------------------------------------------------

  const setStatus = useCallback((value: LeadStatusFilter) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const toggleSort = useCallback((field: SortableLeadField) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "ASC" ? "DESC" : "ASC",
      page: 1,
    }));
  }, []);

  return {
    leads,
    loading,
    error,
    total: meta.total,
    totalPages: meta.totalPages,
    page: filters.page,
    limit: filters.limit,
    search,
    setSearch,
    status: filters.status,
    setStatus,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    toggleSort,
    setPage,
    setLimit,
    refetch: fetchLeads,
  };
}
