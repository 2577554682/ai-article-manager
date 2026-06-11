import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostCount } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  FileText,
  Globe,
  Lock,
  PenSquare,
  ArrowRight,
  Bot,
  RefreshCw,
} from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, icon, borderColor, iconBg, iconColor }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 ${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const quickActions = [
  {
    title: "写文章",
    description: "创建一篇新文章",
    icon: PenSquare,
    path: "/create-post",
    bgColor: "bg-blue-500",
  },
  {
    title: "我的文章",
    description: "查看和管理你的文章",
    icon: FileText,
    path: "/my-posts",
    bgColor: "bg-green-500",
  },
  {
    title: "AI 助手",
    description: "与AI对话管理文章",
    icon: Bot,
    path: "/ai-chat",
    bgColor: "bg-purple-500",
  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const {
    data: count,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["post-count"],
    queryFn: () => getPostCount().then((r) => r.data),
  });

  const today = format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN });
  const privateCount = (count?.total ?? 0) - (count?.public ?? 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 欢迎信息 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          欢迎回来，{user?.username}！
        </h1>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      {/* 统计卡片 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-400 mb-3">加载统计数据失败</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
          >
            <RefreshCw size={14} />
            重试
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="文章总数"
            value={count?.total ?? 0}
            icon={<FileText size={22} />}
            borderColor="border-blue-500"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="公开文章"
            value={count?.public ?? 0}
            icon={<Globe size={22} />}
            borderColor="border-green-500"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="私有文章"
            value={privateCount}
            icon={<Lock size={22} />}
            borderColor="border-purple-500"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>
      )}

      {/* 快速操作 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 text-left"
            >
              <div
                className={`w-11 h-11 rounded-lg ${action.bgColor} flex items-center justify-center shrink-0`}
              >
                <action.icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {action.description}
                </p>
              </div>
              <ArrowRight size={18} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
