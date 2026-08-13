// components/Layout/Sidebar.tsx - APENAS BLOG
import { NavLink } from "react-router-dom";
import { X, Newspaper } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ APENAS O BLOG NO MENU
const menuItems = [
  { name: "Blog", path: "/admin/blog", icon: Newspaper },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const links = (
    <nav className="flex flex-col gap-1 p-4">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/admin/blog"}
          onClick={() => onClose()}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#004AAD]/10 to-[#2535FB]/10 text-[#004AAD] font-medium shadow-sm"
                : "hover:bg-gray-100"
            }`
          }
        >
          <item.icon size={20} strokeWidth={1.5} />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-16 bottom-0 z-20 w-64 bg-white border-r border-gray-200 hidden md:block">
        {links}
      </aside>

      {/* Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="text-xl font-bold text-[#004AAD]">Blog Admin</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        {links}
      </aside>
    </>
  );
}