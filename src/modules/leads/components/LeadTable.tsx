// ============================================================
// LeadTable
// ============================================================
//
// Tabela de leads com:
// - Colunas: Nome, E-mail, WhatsApp, Status, Data de criação
// - Ordenação por coluna (server-side, seta no cabeçalho)
// - Badges coloridos: ativo (verde), inativo (cinza)
// - Paginação (página atual, navegação e contagem)
// - Estados de loading / vazio
// - Clique na linha abre o detalhe (LeadDetailModal)
//
// 🔒 Somente visualização por enquanto (ações futuras).

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
} from "lucide-react";

import { formatDate } from "../../../utils/formatDate";
import type {
  Lead,
  SortableLeadField,
  SortOrder,
} from "../types/lead.types";

// ============================================================
// PROPS
// ============================================================

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  sortBy: SortableLeadField;
  sortOrder: SortOrder;
  page: number;
  totalPages: number;
  total: number;
  onSort: (field: SortableLeadField) => void;
  onPageChange: (page: number) => void;
  onRowClick: (lead: Lead) => void;
}

// ============================================================
// CABEÇALHO ORDENÁVEL
// ============================================================

interface SortableHeaderProps {
  label: string;
  field: SortableLeadField;
  activeField: SortableLeadField;
  sortOrder: SortOrder;
  onSort: (field: SortableLeadField) => void;
}

function SortableHeader({
  label,
  field,
  activeField,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const active = activeField === field;

  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(field)}
        title={`Ordenar por ${label.toLowerCase()}`}
        className={`inline-flex items-center gap-1 font-medium transition ${active
            ? "text-[#004AAD]"
            : "text-slate-700 hover:text-[#004AAD]"
          }`}
      >
        {label}
        {active ? (
          sortOrder === "ASC" ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )
        ) : (
          <ChevronDown size={14} className="text-slate-300" />
        )}
      </button>
    </th>
  );
}

// ============================================================
// PAGINAÇÃO
// ============================================================

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 0) return [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  disabled: boolean;
  onChange: (page: number) => void;
}

function Pagination({
  page,
  totalPages,
  total,
  disabled,
  onChange,
}: PaginationProps) {
  const pages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        {total === 0
          ? "Nenhum lead encontrado"
          : `${total} lead${total === 1 ? "" : "s"} · Página ${page} de ${totalPages}`}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={disabled || page <= 1}
          title="Página anterior"
          className="rounded-lg border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            disabled={disabled}
            className={`min-w-9 rounded-lg border px-2.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed ${p === page
                ? "border-[#004AAD] bg-[#004AAD] text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={disabled || page >= totalPages}
          title="Próxima página"
          className="rounded-lg border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// BADGE DE STATUS
// ============================================================

function StatusBadge({ status }: { status: boolean }) {
  return status ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      Inativo
    </span>
  );
}

// ============================================================
// TABELA
// ============================================================

export default function LeadTable({
  leads,
  loading,
  sortBy,
  sortOrder,
  page,
  totalPages,
  total,
  onSort,
  onPageChange,
  onRowClick,
}: LeadTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <SortableHeader
                label="Nome"
                field="nome"
                activeField={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="E-mail"
                field="email"
                activeField={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="WhatsApp"
                field="whatsapp"
                activeField={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Status"
                field="status"
                activeField={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Data de criação"
                field="created_at"
                activeField={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  <Loader2
                    size={20}
                    className="mx-auto animate-spin text-[#004AAD]"
                  />
                  <span className="mt-2 block text-sm">
                    Carregando leads...
                  </span>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Nenhum lead encontrado.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Ajuste os filtros ou o termo de busca e tente novamente.
                  </p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onRowClick(lead)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(lead);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalhes do lead ${lead.nome}`}
                  className="cursor-pointer transition-colors hover:bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#004AAD]/30"
                >
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    {lead.nome}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {lead.email}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {lead.whatsapp ? (
                      <span className="font-mono text-xs">
                        {lead.whatsapp}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {formatDate(lead.created_at) || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && leads.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          disabled={loading}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
