import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, deletePost } from "../services/api";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", Number(id)],
    queryFn: () => getPost(Number(id)).then((r) => r.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-count"] });
      toast.success("文章已删除");
      navigate("/my-posts");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "删除失败");
      setShowDeleteDialog(false);
    },
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg mb-2">文章不存在</p>
        <button
          onClick={() => navigate("/my-posts")}
          className="text-blue-600 hover:underline text-sm"
        >
          返回文章列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button
        onClick={() => navigate("/my-posts")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        返回列表
      </button>

      <article className="bg-white rounded-xl shadow-sm">
        {/* 标题区 */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <span>创建于 {formatDate(post.create_time)}</span>
                {post.update_time && post.update_time !== post.create_time && (
                  <span>更新于 {formatDate(post.update_time)}</span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.is_public
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {post.is_public ? "公开" : "私有"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/edit-post/${post.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg border border-gray-200 transition-colors"
              >
                <Edit size={14} />
                编辑
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
              >
                <Trash2 size={14} />
                删除
              </button>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-6 md:p-8">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="删除文章"
        message={`确定要删除「${post.title}」吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
