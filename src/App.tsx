import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";
import Layout from "./components/Layout/Layout";

import Login from "./pages/Login";

// ============================================================
// BLOG
// ============================================================

import BlogPostsList from "./pages/admin/BlogPostsList";
import BlogPostForm from "./pages/admin/BlogPostForm";
import BlogPostDetail from "./pages/blog/BlogPostDetail";

// ============================================================
// PRODUTOS
// ============================================================

import ProductsList from "./pages/admin/ProductsList";
import ProductFormPage from "./pages/admin/ProductFormPage";

// ============================================================
// CATEGORIAS
// ============================================================

import ProductCategoriesList from "./pages/admin/ProductCategoriesList";
import ProductCategoryFormPage from "./pages/admin/ProductCategoryFormPage";

// ============================================================
// CATEGORIAS DA LANDING PAGE
// ============================================================

import LandingCategoriesRoutes from "./modules/landingCategories/LandingCategoriesRoutes";

// ============================================================
// LEADS
// ============================================================

import LeadsRoutes from "./modules/leads/LeadsRoutes";

// ============================================================
// DASHBOARD
// ============================================================

function DashboardHome() {
  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 rounded-full bg-[#004AAD]" />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Visão geral da administração da Construbet.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          MÓDULOS
          ====================================================== */}

      <div className="grid gap-5 md:grid-cols-2">

        {/* ====================================================
            BLOG
            ==================================================== */}

        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#004AAD]/30 hover:shadow-md">

          <div className="flex items-start justify-between gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004AAD]/10">
              <span className="text-xl font-bold text-[#004AAD]">
                B
              </span>
            </div>

            <span className="rounded-full bg-[#004AAD]/10 px-3 py-1 text-xs font-semibold text-[#004AAD]">
              Conteúdo
            </span>

          </div>

          <div className="mt-5">

            <h2 className="text-lg font-bold text-gray-900">
              Blog
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Gerencie os conteúdos, notícias e informações
              publicadas no blog da Construbet.
            </p>

          </div>

          <div className="mt-6">

            <Link
              to="/admin/blog"
              className="inline-flex items-center justify-center rounded-lg bg-[#004AAD] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003B8F]"
            >
              Acessar Blog
            </Link>

          </div>

        </div>

        {/* ====================================================
            PRODUTOS
            ==================================================== */}

        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#004AAD]/30 hover:shadow-md">

          <div className="flex items-start justify-between gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004AAD]/10">
              <span className="text-xl font-bold text-[#004AAD]">
                P
              </span>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Catálogo
            </span>

          </div>

          <div className="mt-5">

            <h2 className="text-lg font-bold text-gray-900">
              Produtos
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Gerencie o catálogo de produtos, categorias,
              preços e informações comerciais.
            </p>

          </div>

          <div className="mt-6 flex flex-wrap gap-2">

            <Link
              to="/admin/produtos"
              className="inline-flex items-center justify-center rounded-lg bg-[#004AAD] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003B8F]"
            >
              Acessar Produtos
            </Link>

            <Link
              to="/admin/produtos/categorias"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Categorias
            </Link>

          </div>

        </div>

      </div>

      {/* ======================================================
          INFORMAÇÃO
          ====================================================== */}

      <div className="rounded-2xl border border-[#004AAD]/10 bg-gradient-to-r from-[#004AAD]/5 to-white p-5">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-sm font-bold text-gray-900">
              Administração Construbet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Utilize os módulos acima para administrar o
              conteúdo e o catálogo da plataforma.
            </p>

          </div>

          <div className="h-1 w-16 rounded-full bg-[#004AAD] sm:w-20" />

        </div>

      </div>

    </div>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <AuthProvider>

      <BrowserRouter>

        <Routes>

          {/* =====================================================
              LOGIN
              ===================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* =====================================================
              ÁREA ADMINISTRATIVA
              ===================================================== */}

          <Route element={<PrivateRoute />}>

            <Route element={<Layout />}>

              {/* =================================================
                  DASHBOARD
                  ================================================= */}

              <Route
                path="/"
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/admin"
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/admin/dashboard"
                element={<DashboardHome />}
              />

              {/* =================================================
                  BLOG
                  ================================================= */}

              <Route
                path="/admin/blog"
                element={<BlogPostsList />}
              />

              <Route
                path="/admin/blog/novo"
                element={<BlogPostForm />}
              />

              <Route
                path="/admin/blog/editar/:id"
                element={<BlogPostForm />}
              />

              <Route
                path="/admin/blog/:slug"
                element={<BlogPostDetail />}
              />

              {/* =================================================
                  PRODUTOS
                  ================================================= */}

              <Route
                path="/admin/produtos"
                element={<ProductsList />}
              />

              <Route
                path="/admin/produtos/novo"
                element={<ProductFormPage />}
              />

              <Route
                path="/admin/produtos/editar/:id"
                element={<ProductFormPage />}
              />

              {/* =================================================
                  CATEGORIAS DE PRODUTOS
                  ================================================= */}

              <Route
                path="/admin/produtos/categorias"
                element={<ProductCategoriesList />}
              />

              <Route
                path="/admin/produtos/categorias/nova"
                element={<ProductCategoryFormPage />}
              />

              <Route
                path="/admin/produtos/categorias/editar/:id"
                element={<ProductCategoryFormPage />}
              />

              {/* =================================================
                  CATEGORIAS DA LANDING PAGE
                  Módulo próprio com <Routes> interno (lazy).
                  Structured/router: rota-pai com splat cujo
                  `element` é o componente do módulo — padrão
                  válido do React Router para rotas modulares.
                  ================================================= */}

              <Route
                path="/dashboard/landing-categories/*"
                element={<LandingCategoriesRoutes />}
              />

              {/* =================================================
                  LEADS
                  Módulo próprio com <Routes> interno (lazy).
                  ================================================= */}

              <Route
                path="/dashboard/leads/*"
                element={<LeadsRoutes />}
              />

              {/* =================================================
                  ROTAS LEGADAS
                  ================================================= */}

              <Route
                path="/admin/provas"
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/admin/categorias"
                element={
                  <Navigate
                    to="/admin/produtos/categorias"
                    replace
                  />
                }
              />

              {/* =================================================
                  FALLBACK
                  ================================================= */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

            </Route>

          </Route>

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;