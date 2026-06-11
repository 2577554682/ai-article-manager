import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, PenSquare, Globe, Bot } from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "仪表盘" },
  { path: "/my-posts", icon: FileText, label: "文章" },
  { path: "/create-post", icon: PenSquare, label: "写" },
  { path: "/public-posts", icon: Globe, label: "公开" },
  { path: "/ai-chat", icon: Bot, label: "AI" },
];

interface MobileNavProps {
  className?: string;
}

export default function MobileNav({ className = "" }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 ${className}`}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
