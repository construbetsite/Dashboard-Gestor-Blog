// components/Layout/TopBar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return 'AD';
  };

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }

    return 'Admin';
  };

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-30
        h-16
        bg-white
        border-b border-gray-200
        shadow-sm
      "
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Menu mobile */}
        <button
          onClick={onMenuClick}
          className="
            md:hidden
            text-[#333333]
            hover:text-[#D71920]
            transition-colors
          "
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link
          to="/admin/blog"
          className="flex items-center gap-2"
        >
          <span
            className="
              text-xl
              font-black
              tracking-tight
              text-[#D71920]
            "
          >
            Construbet
          </span>

          <span
            className="
              text-xs
              font-medium
              bg-[#D71920]/10
              text-[#D71920]
              px-2
              py-0.5
              rounded-full
              hidden sm:inline
            "
          >
            Admin
          </span>
        </Link>

        {/* Usuário */}
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2">

            {/* Avatar */}
            <div
              className="
                w-8
                h-8
                rounded-full
                bg-[#D71920]
                text-white
                flex
                items-center
                justify-center
                text-sm
                font-semibold
              "
            >
              {getUserInitials()}
            </div>

            {/* Nome */}
            <span
              className="
                hidden md:inline
                text-sm
                font-medium
                text-gray-700
              "
            >
              {getUserName()}
            </span>

          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              text-gray-500
              hover:text-[#D71920]
              transition-colors
              p-1
              rounded-md
            "
            title="Sair"
          >
            <LogOut size={20} />
          </button>

        </div>
      </div>
    </header>
  );
}