// ============================================================
// LandingCategoriesRoutes
// ============================================================
//
// Rotas do módulo Landing Categories com carregamento sob
// demanda (React.lazy + Suspense).
//
// ⚠️ IMPORTANTE (React Router): este componente NÃO pode ser
// usado como filho direto de <Routes> (o React Router só
// aceita <Route> e <React.Fragment> ali). Ele é montado como
// `element` de uma rota-pai com splat no App.tsx:
//
//   <Route path="/dashboard/landing-categories/*"
//          element={<LandingCategoriesRoutes />} />
//
// Os caminhos relativos abaixo são resolvidos contra o prefixo
// do pai:
//   ""         → /dashboard/landing-categories
//   "new"      → /dashboard/landing-categories/new
//   ":id/edit" → /dashboard/landing-categories/:id/edit

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

const LandingCategoriesListPage = lazy(
  () => import("./pages/LandingCategoriesListPage")
);
const LandingCategoryFormPage = lazy(
  () => import("./pages/LandingCategoryFormPage")
);

/** Fallback exibido enquanto o chunk da página carrega. */
function PageFallback() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#004AAD]" />
    </div>
  );
}

export default function LandingCategoriesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <Suspense fallback={<PageFallback />}>
            <LandingCategoriesListPage />
          </Suspense>
        }
      />

      <Route
        path="new"
        element={
          <Suspense fallback={<PageFallback />}>
            <LandingCategoryFormPage />
          </Suspense>
        }
      />

      <Route
        path=":id/edit"
        element={
          <Suspense fallback={<PageFallback />}>
            <LandingCategoryFormPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
