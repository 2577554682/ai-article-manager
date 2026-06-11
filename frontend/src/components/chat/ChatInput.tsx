import { useState, useRef, useEffect } from "react";
import { Send, Zap } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, isStream: boolean) => void;
  disabled: boolean;
  isStreamMode: boolean;
  onStreamModeChange: (v: boolean) => void;
}

export default function ChatInput({
  onSend,
  disabled,
  isStreamMode,
  onStreamModeChange,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 128) + "px";
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim(), isStreamMode);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "AI 正在回复..."
              : isStreamMode
                ? "输入消息... (Shift+Enter 换行)"
                : "试试说：删除标题为日记的文章"
          }
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-h-32 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onStreamModeChange(!isStreamMode)}
            disabled={disabled}
            className={`p-3 rounded-xl border transition-colors ${
              isStreamMode
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "border-gray-200 text-gray-400 hover:bg-gray-50"
            }`}
            title={isStreamMode ? "流式模式（逐字显示）" : "普通模式（完整回复）"}
          >
            <Zap size={20} />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
