// ============================================================
// Rotas do módulo Landing Categories
// ============================================================
//
// Centraliza os paths públicos do módulo para navegação
// consistente (menu lateral, links internos, redirects).
//
// As rotas efetivas são definidas em LandingCategoriesRoutes.tsx
// (paths relativos sob "/dashboard/landing-categories/*").

export const LANDING_CATEGORIES_ROUTES = {
  list: "/dashboard/landing-categories",
  new: "/dashboard/landing-categories/new",
  edit: (id: number | string) =>
    `/dashboard/landing-categories/${id}/edit`,
} as const;
