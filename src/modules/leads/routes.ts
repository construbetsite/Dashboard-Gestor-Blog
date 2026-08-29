// ============================================================
// Rotas do módulo de Leads
// ============================================================
//
// Centraliza os paths públicos do módulo para navegação
// consistente (menu lateral, links internos, redirects).
//
// As rotas efetivas são definidas em LeadsRoutes.tsx
// (paths relativos sob "/dashboard/leads/*").

export const LEADS_ROUTES = {
  list: "/dashboard/leads",
} as const;
