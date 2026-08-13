import { Link, Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";

export default function PublicBlogLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header simples para o blog público */}
      <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/blog" className="flex items-center gap-2">
            <span className="text-xl font-black text-[#004AAD]">Mapa</span>
            <span className="text-xl font-black bg-gradient-to-r from-[#004AAD] to-[#2535FB] bg-clip-text text-transparent">
              PSI
            </span>
            <span className="ml-2 rounded-full bg-[#004AAD]/10 px-3 py-1 text-xs font-semibold text-[#004AAD]">
              Blog
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/blog" className="hover:text-[#004AAD] transition-colors">
              Posts
            </Link>
            <Link to="/login" className="hover:text-[#004AAD] transition-colors">
              Área do admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

