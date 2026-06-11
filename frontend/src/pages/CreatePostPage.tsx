import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../services/api";
import { ArrowLeft } from "lucide-react";
import Toggle from "../components/ui/Toggle";
import toast from "react-hot-toast";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", content: "", is_public: true });

  const mutation = useMutation({
    mutationFn: () => createPost(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-count"] });
      toast.success("文章创建成功");
      navigate("/my-posts");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.detail || "创建失败"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("标题不能为空");
      return;
    }
    if (!form.content.trim()) {
      toast.error("内容不能为空");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        返回
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">发布文章</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:outline-none p-0"
              placeholder="文章标题"
              required
            />
            <hr className="mt-3 border-gray-200" />
          </div>

          <div>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              className="w-full text-gray-700 border-none outline-none focus:outline-none p-0 resize-y min-h-[200px] placeholder-gray-300"
              placeholder="开始写文章内容..."
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Toggle
              enabled={form.is_public}
              onChange={(v) => setForm({ ...form, is_public: v })}
              label="公开文章"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {mutation.isPending ? "发布中..." : "发布文章"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
