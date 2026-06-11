import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 桌面端侧边栏 */}
      <Sidebar className="hidden md:flex" />

      {/* 移动端抽屉 */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar
            className="fixed left-0 top-0 z-30 h-full md:hidden"
            onClose={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 移动端顶部栏 */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-3 font-semibold text-gray-900">文章助手</h1>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>

        {/* 移动端底部导航 */}
        <MobileNav className="md:hidden" />
      </div>
    </div>
  );
}
