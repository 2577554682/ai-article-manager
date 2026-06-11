import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  isTyping?: boolean;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-gray-600" />
        </div>
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({
  role,
  content,
  created_at,
  isTyping,
}: MessageBubbleProps) {
  if (isTyping) {
    return <TypingIndicator />;
  }

  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          {created_at && (
            <p className="text-xs text-blue-100 mt-1 text-right">
              {formatTime(created_at)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 检测成功/错误/警告消息
  const isSuccess = content.includes("✅");
  const isError = content.includes("❌") || content.includes("错误：");
  const isWarning = content.includes("⚠️");

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 max-w-[75%]">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-gray-600" />
        </div>
        <div
          className={`bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 ${
            isSuccess ? "border-l-4 border-green-400" : ""
          } ${isError ? "border-l-4 border-red-400" : ""} ${
            isWarning ? "border-l-4 border-amber-400" : ""
          }`}
        >
          <div className="text-sm text-gray-800 prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="bg-gray-200 rounded px-1 py-0.5 text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-800 text-gray-100 rounded-lg p-4 overflow-x-auto my-2 text-sm">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          {created_at && (
            <p className="text-xs text-gray-400 mt-1">
              {formatTime(created_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
