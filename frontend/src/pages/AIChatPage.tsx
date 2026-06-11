import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { Menu, MessageSquare, Square } from "lucide-react";
import { sendChatMessage } from "../services/api";
import ChatHistory from "../components/chat/ChatHistory";
import ChatInput from "../components/chat/ChatInput";
import MessageBubble from "../components/chat/MessageBubble";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [isStreamMode, setIsStreamMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 停止生成
  const handleStopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  // 普通模式发送
  const sendNormalMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const { data } = await sendChatMessage({ message });
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.reply },
      ]);
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        {
          role: "assistant",
          content: "错误：请求失败，请检查网络连接或稍后重试。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 流式模式发送
  const sendStreamMessage = async (message: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              setMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                msgs[msgs.length - 1] = {
                  ...last,
                  content: last.content + data.token,
                };
                return msgs;
              });
            } else if (data.error) {
              setMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                msgs[msgs.length - 1] = {
                  ...last,
                  content: `错误：${data.error}`,
                };
                return msgs;
              });
            }
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    } catch (err: any) {
      if (err.name === "AbortError") {
        // 用户手动停止，不做额外处理
      } else {
        setMessages((prev) => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          msgs[msgs.length - 1] = {
            ...last,
            content: "错误：连接失败，请检查网络或稍后重试。",
          };
          return msgs;
        });
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleSend = (message: string, stream: boolean) => {
    if (stream) {
      sendStreamMessage(message);
    } else {
      sendNormalMessage(message);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleQuickAction = (text: string) => {
    handleSend(text, isStreamMode);
  };

  const quickActions = [
    { label: "我的文章", text: "查看我的文章", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    { label: "创建文章", text: "帮我创建一篇文章，标题为示例文章，内容为这是一篇示例内容", color: "bg-green-50 text-green-600 hover:bg-green-100" },
    { label: "公开文章", text: "列出所有公开文章", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 md:-m-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 桌面端历史侧边栏 — 可折叠 */}
      <div
        className={`hidden md:block transition-all duration-300 ease-in-out ${
          showDesktopSidebar ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {showDesktopSidebar && <ChatHistory onNewChat={handleNewChat} />}
      </div>

      {/* 移动端抽屉 */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-30 h-full md:hidden">
            <ChatHistory onNewChat={() => { setSidebarOpen(false); handleNewChat(); }} />
          </div>
        </>
      )}

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setShowDesktopSidebar(!showDesktopSidebar)}
            className="hidden md:block p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={showDesktopSidebar ? "收起侧边栏" : "展开侧边栏"}
          >
            <Menu size={18} />
          </button>
          <MessageSquare size={18} className="text-blue-600" />
          <h1 className="font-semibold text-gray-900">AI 助手</h1>
          <span className="text-xs text-gray-400 ml-1">用自然语言管理文章</span>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="ml-auto text-xs px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              清空会话
            </button>
          )}
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MessageSquare size={48} className="mx-auto text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">AI 文章助手</h2>
                <p className="text-gray-500 mb-6">你可以用自然语言让我帮你管理文章</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 mb-1">📝 创建文章</p>
                    <p className="text-xs text-blue-600">"帮我写一篇关于Python的文章"</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700 mb-1">📋 查看文章</p>
                    <p className="text-xs text-green-600">"列出我的所有文章"</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-700 mb-1">✏️ 修改文章</p>
                    <p className="text-xs text-purple-600">"把Python笔记改成公开"</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-700 mb-1">🗑️ 删除文章</p>
                    <p className="text-xs text-red-600">"删除标题为日记的文章"</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} content={msg.content} />
              ))}

              {isLoading && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1].content === "" && (
                <MessageBubble role="assistant" content="" isTyping />
              )}

              {/* 停止生成按钮 */}
              {isLoading && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={handleStopGeneration}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Square size={12} />
                    停止生成
                  </button>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 快捷操作按钮 */}
        {messages.length > 0 && !isLoading && (
          <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.text)}
                className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* 输入区域 */}
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          isStreamMode={isStreamMode}
          onStreamModeChange={setIsStreamMode}
        />
      </div>
    </div>
  );
}
