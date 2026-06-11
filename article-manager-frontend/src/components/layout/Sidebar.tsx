import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Globe,
  Bot,
  LogOut,
  X,
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { path: "/my-posts", label: "我的文章", icon: FileText },
  { path: "/create-post", label: "写文章", icon: PenSquare },
  { path: "/public-posts", label: "公开文章", icon: Globe },
  { path: "/ai-chat", label: "AI 助手", icon: Bot },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ className = "", onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className={`w-60 bg-white border-r border-gray-200 flex flex-col ${className}`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-5 border-b border-gray-100">
        <span className="text-xl">📝</span>
        <span className="font-bold text-gray-900">文章助手</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 菜单 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem key={item.path} item={item} onClick={onClose} />
        ))}
      </nav>

      {/* 底部用户信息 */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate">
            {user?.username}
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  onClick,
}: {
  item: (typeof menuItems)[0];
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <item.icon size={20} />
      {item.label}
    </NavLink>
  );
}
