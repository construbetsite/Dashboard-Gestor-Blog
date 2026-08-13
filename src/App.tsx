import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";
import Layout from "./components/Layout/Layout";

import Login from "./pages/Login";

// ✅ Manter apenas as administrativas
import BlogPostsList from "./pages/admin/BlogPostsList";
import BlogPostForm from "./pages/admin/BlogPostForm";
import BlogPostDetail from "./pages/blog/BlogPostDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =====================================================
              LOGIN
              ===================================================== */}
          <Route path="/login" element={<Login />} />

          {/* =====================================================
              ÁREA ADMINISTRATIVA (tudo protegido)
              ===================================================== */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>

              {/* ENTRADA DO ADMIN */}
              <Route path="/" element={<Navigate to="/admin/blog" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/blog" replace />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin/blog" replace />} />

              {/* ROTAS LEGADAS (redirecionam) */}
              <Route path="/admin/provas" element={<Navigate to="/admin/blog" replace />} />
              <Route path="/admin/categorias" element={<Navigate to="/admin/blog" replace />} />

              {/* =================================================
                  BLOG ADMINISTRATIVO - TODAS AS ROTAS AQUI
                  ================================================= */}

              {/* Lista de posts (CRUD) */}
              <Route path="/admin/blog" element={<BlogPostsList />} />

              {/* Criar novo post */}
              <Route path="/admin/blog/novo" element={<BlogPostForm />} />

              {/* Editar post existente */}
              <Route path="/admin/blog/editar/:id" element={<BlogPostForm />} />

              {/* ✅ Visualizar post (agora é /admin/blog/:slug) */}
              <Route path="/admin/blog/:slug" element={<BlogPostDetail />} />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/admin/blog" replace />} />

            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;