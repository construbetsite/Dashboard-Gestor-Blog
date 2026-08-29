// components/Layout/Sidebar.tsx

import { NavLink } from "react-router-dom";
import {
  X,
  Newspaper,
  Package,
  LayoutDashboard,
  LayoutGrid,
  Users,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Blog",
    path: "/admin/blog",
    icon: Newspaper,
  },
  {
    name: "Produtos",
    path: "/admin/produtos",
    icon: Package,
  },
  {
    name: "Landing Page",
    path: "/dashboard/landing-categories",
    icon: LayoutGrid,
  },
  {
    name: "Leads",
    path: "/dashboard/leads",
    icon: Users,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const links = (
    <nav className="flex flex-col gap-1 p-4">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#004AAD]/10 to-[#2535FB]/10 text-[#004AAD] font-medium shadow-sm"
                : "hover:bg-gray-100"
            }`
          }
        >
          <item.icon
            size={20}
            strokeWidth={1.5}
          />

          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-16 bottom-0 z-20 hidden w-64 border-r border-gray-200 bg-white md:block">
        {links}
      </aside>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 md:hidden ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-xl font-bold text-[#004AAD]">
            Construbet
          </span>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {links}
      </aside>
    </>
  );
}