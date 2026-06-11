import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, updatePost } from "../services/api";
import { ArrowLeft } from "lucide-react";
import Toggle from "../components/ui/Toggle";
import toast from "react-hot-toast";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", content: "", is_public: true });

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", Number(id)],
    queryFn: () => getPost(Number(id)).then((r) => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        content: post.content,
        is_public: post.is_public,
      });
    }
  }, [post]);

  const mutation = useMutation({
    mutationFn: () =>
      updatePost(Number(id), {
        title: form.title,
        content: form.content,
        is_public: form.is_public,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", Number(id)] });
      queryClient.invalidateQueries({ queryKey: ["post-count"] });
      toast.success("更新成功");
      navigate(`/my-posts/${id}`);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.detail || "更新失败"),
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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-4 w-16" />
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-400">
        文章不存在或无权访问
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">编辑文章</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:outline-none p-0"
              required
            />
            <hr className="mt-3 border-gray-200" />
          </div>

          <div>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              className="w-full text-gray-700 border-none outline-none focus:outline-none p-0 resize-y min-h-[200px]"
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
              {mutation.isPending ? "保存中..." : "保存"}
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
