// ============================================================
// LANDING CATEGORY SERVICE
// ============================================================
//
// ✅ Reusa o cliente HTTP central (src/services/api.service.ts)
// ✅ Endpoints documentados:
//    GET /api/landing-categories           (listar, ?active=true)
//    GET /api/landing-categories/:id       (detalhes)
//    POST /api/landing-categories          (criar)
//    PUT /api/landing-categories/:id       (atualizar)
//    DELETE /api/landing-categories/:id    (excluir)
//
// Observação: a API retorna dados em formato direto ou envolvidos
// em `{ success, data }` (como os demais módulos). Os normalizadores
// abaixo aceitam os dois formatos para robustez.

import { api } from "../../../services/api.service";
import type {
  CreateLandingCategoryPayload,
  LandingCategory,
  ListLandingCategoriesParams,
  UpdateLandingCategoryPayload,
} from "../types/landingCategory";

// ============================================================
// VALIDAÇÃO DE URL DE REDIRECIONAMENTO
// ============================================================
//
// Aceita dois formatos:
// 1) URL completa — deve começar com http:// ou https://
//    (ex.: "https://www.construbet.com.br/ferramentas")
// 2) Caminho relativo — apenas letras, números, hífens, barras,
//    pontos e underscores, sem espaços ou caracteres especiais
//    (ex.: "construbet/ferramentas", "promocoes")

const URL_SAFE_RE = /^[a-zA-Z0-9\-_/.]+$/;
const ABSOLUTE_URL_RE = /^https?:\/\/.+/i;

export function isValidRedirectUrl(url: string): boolean {
  const value = (url ?? "").trim();
  if (!value) return false;

  // URL completa (http/https)
  if (ABSOLUTE_URL_RE.test(value)) return true;

  // Caminho relativo seguro
  return URL_SAFE_RE.test(value);
}

// ============================================================
// GUARDS / NORMALIZAÇÃO DE RESPOSTA
// ============================================================

function isLandingCategory(value: unknown): value is LandingCategory {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value
  );
}

function extractCategory<T>(res: T): LandingCategory {
  const unwrapped = (res as { data?: LandingCategory })?.data;
  if (isLandingCategory(unwrapped)) return unwrapped;
  if (isLandingCategory(res)) return res as LandingCategory;
  throw new Error("Resposta inválida da API de categorias.");
}

// ============================================================
// NORMALIZAÇÃO DO PAYLOAD
// ============================================================

function normalizePayload(
  data: Partial<CreateLandingCategoryPayload>,
  mode: "create" | "update" = "create"
): Partial<CreateLandingCategoryPayload> {
  const result: Partial<CreateLandingCategoryPayload> = {};

  // ------------------------------------------------------------
  // TÍTULO (obrigatório)
  // ------------------------------------------------------------

  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title) {
      throw new Error("O título da categoria é obrigatório.");
    }
    result.title = title;
  } else if (mode === "create") {
    throw new Error("O título da categoria é obrigatório.");
  }

  // ------------------------------------------------------------
  // IMAGEM (obrigatória no create)
  // ------------------------------------------------------------

  if (data.image !== undefined) {
    const image = data.image.trim();
    if (!image) {
      throw new Error("A imagem da categoria é obrigatória.");
    }
    result.image = image;
  } else if (mode === "create") {
    throw new Error("A imagem da categoria é obrigatória.");
  }

  // ------------------------------------------------------------
  // URL (obrigatória)
  // ------------------------------------------------------------

  if (data.url !== undefined) {
    if (!isValidRedirectUrl(data.url)) {
      throw new Error(
        "A URL informada é inválida. Use uma URL completa (ex.: https://www.construbet.com.br/ferramentas) ou um caminho relativo sem espaços ou caracteres especiais."
      );
    }
    result.url = data.url.trim();
  } else if (mode === "create") {
    throw new Error("A URL de redirecionamento é obrigatória.");
  }

  // ------------------------------------------------------------
  // ORDEM (opcional)
  // ------------------------------------------------------------

  if (data.order !== undefined) {
    const order = Number.isFinite(data.order) && data.order >= 0
      ? Math.floor(data.order)
      : 0;
    result.order = order;
  }

  // ------------------------------------------------------------
  // STATUS (opcional)
  // ------------------------------------------------------------

  if (data.status !== undefined) {
    result.status = Boolean(data.status);
  }

  return result;
}

// ============================================================
// SERVICE
// ============================================================

export const landingCategoryService = {
  async listar(
    params?: ListLandingCategoriesParams
  ): Promise<LandingCategory[]> {
    const query = new URLSearchParams();
    if (params?.active !== undefined) {
      query.set("active", String(params.active));
    }
    const qs = query.toString();

    const res = await api.get<LandingCategory[] | { data: LandingCategory[] }>(
      `/landing-categories${qs ? `?${qs}` : ""}`
    );

    // Aceita lista direta ou { success, data: [...] }
    return Array.isArray(res) ? res : (res?.data ?? []);
  },

  async buscarPorId(id: number): Promise<LandingCategory> {
    const res = await api.get<LandingCategory | { data: LandingCategory }>(
      `/landing-categories/${encodeURIComponent(String(id))}`
    );
    return extractCategory(res);
  },

  async criar(
    dados: CreateLandingCategoryPayload
  ): Promise<LandingCategory> {
    const normalized = normalizePayload(dados, "create");
    // Envia como JSON explícito — o backend espera application/json
    // e rejeita FormData (body vazio => erro 500).
    const res = await api.post<
      LandingCategory | { data: LandingCategory }
    >(
      "/landing-categories",
      normalized,
      { headers: { "Content-Type": "application/json" } }
    );
    return extractCategory(res);
  },

  async editar(
    id: number,
    dados: UpdateLandingCategoryPayload
  ): Promise<LandingCategory> {
    const normalized = normalizePayload(dados, "update");
    const res = await api.put<
      LandingCategory | { data: LandingCategory }
    >(
      `/landing-categories/${encodeURIComponent(String(id))}`,
      normalized,
      { headers: { "Content-Type": "application/json" } }
    );
    return extractCategory(res);
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/landing-categories/${encodeURIComponent(String(id))}`);
  },
};

export const landingCategoryApi = landingCategoryService;
