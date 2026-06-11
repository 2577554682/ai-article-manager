import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "../../services/api";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import type { ChatHistoryItem } from "../../types";

interface ChatHistoryProps {
  onNewChat: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export default function ChatHistory({ onNewChat }: ChatHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => getChatHistory().then((r) => r.data),
  });

  // 按对话分组（简易：每条记录独立显示）
  const userMessages =
    history?.filter((h: ChatHistoryItem) => h.role === "user") ?? [];

  return (
    <div className="border-r border-gray-200 bg-white w-72 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          新对话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : userMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MessageSquare size={24} className="mb-2" />
            <p className="text-sm">暂无对话记录</p>
          </div>
        ) : (
          userMessages
            .slice()
            .reverse()
            .map((item: ChatHistoryItem) => (
              <div
                key={item.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-700 truncate">
                  {item.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
