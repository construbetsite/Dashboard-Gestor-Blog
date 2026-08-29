// ============================================================
// LeadsRoutes
// ============================================================
//
// Rotas do módulo de Leads com carregamento sob demanda
// (React.lazy + Suspense) — mesmo padrão dos demais módulos.
//
// ⚠️ IMPORTANTE (React Router): este componente NÃO pode ser
// usado como filho direto de <Routes>. Ele é montado como
// `element` de uma rota-pai com splat no App.tsx:
//
//   <Route path="/dashboard/leads/*" element={<LeadsRoutes />} />
//
// O caminho relativo "" resolve para /dashboard/leads.

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

const LeadsPage = lazy(() => import("./pages/LeadsPage"));

/** Fallback exibido enquanto o chunk da página carrega. */
function PageFallback() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#004AAD]" />
    </div>
  );
}

export default function LeadsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <Suspense fallback={<PageFallback />}>
            <LeadsPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
