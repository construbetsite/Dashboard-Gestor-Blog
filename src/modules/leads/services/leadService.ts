// ============================================================
// LEAD SERVICE
// ============================================================
//
// ✅ Reusa o cliente HTTP central (src/services/api.service.ts)
// ✅ Endpoints documentados no backend:
//    GET  /api/leads?page=&limit=&search=&status=&sortBy=&sortOrder=
//         -> { success, data: Lead[], meta: { total, page, limit, totalPages } }
//    GET  /api/leads/:id
//         -> { success, data: Lead }
//    POST /api/leads (público - newsletter)
//         -> { success, data: Lead }
//
// Observação: os handlers do backend SEMPRE retornam o wrapper
// `{ success, data, meta? }`. Os guards abaixo aceitam também o
// formato direto por robustez (padrão dos demais módulos).

import { api } from "../../../services/api.service";
import type {
  CreateLeadPayload,
  Lead,
  LeadDetailResponse,
  LeadListResponse,
  ListLeadsParams,
} from "../types/lead.types";

// ============================================================
// GUARDS / NORMALIZAÇÃO DE RESPOSTA
// ============================================================

function isLead(value: unknown): value is Lead {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    "nome" in value
  );
}

/** Extrai o `Lead` de uma resposta que pode vir envolvida em `{ data }`. */
function extractLead<T>(res: T): Lead {
  const unwrapped = (res as { data?: unknown })?.data;
  if (isLead(unwrapped)) return unwrapped;
  if (isLead(res)) return res as Lead;
  throw new Error("Resposta inválida da API de leads.");
}

// ============================================================
// SERVICE
// ============================================================

export const leadService = {
  /**
   * GET /api/leads — listagem paginada/filtrada.
   * Retorna o wrapper completo `{ success, data, meta }`.
   */
  async listar(params: ListLeadsParams = {}): Promise<LeadListResponse> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }
    if (params.status !== undefined && params.status !== "") {
      query.set("status", String(params.status));
    }
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();
    return api.get<LeadListResponse>(`/leads${qs ? `?${qs}` : ""}`);
  },

  /**
   * GET /api/leads/:id — detalhe de um lead.
   */
  async buscarPorId(id: string): Promise<Lead> {
    const res = await api.get<LeadDetailResponse | Lead>(
      `/leads/${encodeURIComponent(id)}`
    );
    return extractLead(res);
  },

  /**
   * POST /api/leads — cria um lead (público, newsletter).
   * O backend captura ip e user_agent automaticamente.
   */
  async criar(dados: CreateLeadPayload): Promise<Lead> {
    const res = await api.post<LeadDetailResponse | Lead>("/leads", dados);
    return extractLead(res);
  },
};

export const leadApi = leadService;
