// ============================================================
// LeadsPage
// ============================================================
//
// Listagem de leads (área administrativa):
// - Busca por nome, e-mail ou WhatsApp (com debounce)
// - Filtro por status (Ativo/Inativo)
// - Ordenação por coluna + paginação (server-side)
// - Modal de detalhes ao clicar em uma linha
// - Estados de loading / erro / dados vazios

import { useCallback, useState } from "react";
import { Search, Users } from "lucide-react";

import { useLeads } from "../hooks/useLeads";
import LeadTable from "../components/LeadTable";
import LeadDetailModal from "../components/LeadDetailModal";
import type { Lead, LeadStatusFilter } from "../types/lead.types";

export default function LeadsPage() {
  const {
    leads,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    sortOrder,
    toggleSort,
    page,
    totalPages,
    total,
    setPage,
    limit,
    setLimit,
  } = useLeads(10);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const handleRowClick = useCallback((lead: Lead) => {
    setSelectedLeadId(lead.id);
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004AAD]/10">
          <Users size={22} className="text-[#004AAD]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Leads captados pela newsletter e landing pages da Construbet.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            className="w-full rounded-lg border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#004AAD] focus:ring-2 focus:ring-[#004AAD]/10"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatusFilter)}
          className="rounded-lg border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004AAD] focus:ring-2 focus:ring-[#004AAD]/10"
        >
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="rounded-lg border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004AAD] focus:ring-2 focus:ring-[#004AAD]/10"
        >
          <option value={10}>10 por página</option>
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </div>

      {/* ERRO NA LISTAGEM */}
      {error && (
        <div className="rounded-lg border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABELA */}
      <LeadTable
        leads={leads}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        page={page}
        totalPages={totalPages}
        total={total}
        onSort={toggleSort}
        onPageChange={setPage}
        onRowClick={handleRowClick}
      />

      {/* DICA DE USO */}
      <p className="text-xs text-slate-400">
        💡 Clique em uma linha para ver os detalhes completos do lead
        (IP, User-Agent, datas, etc.).
      </p>

      {/* MODAL DE DETALHES */}
      <LeadDetailModal
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
