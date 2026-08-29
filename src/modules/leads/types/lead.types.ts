// ============================================================
// LEADS - TIPOS COMPLETOS
// ============================================================
//
// ✅ Contrato fiel ao backend (src/modules/leads/types/lead.types.ts
//    no projeto Backend).
// ✅ Listagem:  GET /api/leads
//               -> { success, data: Lead[], meta: { total, page, limit, totalPages } }
// ✅ Detalhe:   GET /api/leads/:id
//               -> { success, data: Lead }
// ✅ Criação:   POST /api/leads (público, newsletter)

export interface Lead {
  id: string;

  /** Nome do lead. Compatível com schema legado `name`. */
  nome: string;

  /** E-mail (único na tabela). */
  email: string;

  /** WhatsApp - somente dígitos (10–13) ou null. */
  whatsapp: string | null;

  /** IP capturado pelo backend. */
  ip: string | null;

  /** User-Agent capturado pelo backend. */
  user_agent: string | null;

  /** Ativo (true) / Inativo (false). Default: true. */
  status: boolean;

  created_at: string;
  updated_at: string;
}

// ============================================================
// PAGINAÇÃO / META
// ============================================================

export interface LeadPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// LISTAGEM
// ============================================================

/** Campos aceitos no sortBy (whitelist do backend). */
export const LEAD_SORT_FIELDS = [
  "id",
  "nome",
  "email",
  "whatsapp",
  "status",
  "created_at",
  "updated_at",
] as const;

export type SortableLeadField = (typeof LEAD_SORT_FIELDS)[number];
export type SortOrder = "ASC" | "DESC";

/** Filtro de status usado na UI ("" = todos). */
export type LeadStatusFilter = "" | "true" | "false";

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: SortableLeadField;
  sortOrder?: SortOrder;
}

// ============================================================
// PAYLOAD DE CRIAÇÃO (usado pelo site público; mantido aqui
// por completude do service)
// ============================================================

export interface CreateLeadPayload {
  nome: string;
  email: string;
  whatsapp?: string | null;
}

// ============================================================
// WRAPPERS DE RESPOSTA
// ============================================================

export interface LeadListResponse {
  success: boolean;
  data: Lead[];
  meta: LeadPagination;
}

export interface LeadDetailResponse {
  success: boolean;
  data: Lead;
}
