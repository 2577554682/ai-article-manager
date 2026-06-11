import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyPosts, deletePost } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import toast from "react-hot-toast";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function MyPostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => getMyPosts().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-count"] });
      toast.success("删除成功");
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "删除失败");
      setDeleteTarget(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">我的文章</h1>
        </div>
        <div className="grid gap-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的文章</h1>
        <button
          onClick={() => navigate("/create-post")}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
        >
          <Plus size={16} />
          写文章
        </button>
      </div>

      {data?.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border">
          <div className="flex justify-center mb-4">
            <FileText size={48} className="text-gray-300" />
          </div>
          <p className="text-gray-500 mb-1">还没有文章</p>
          <p className="text-sm text-gray-400 mb-4">开始写你的第一篇文章吧</p>
          <button
            onClick={() => navigate("/create-post")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
          >
            写一篇吧
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/my-posts/${post.id}`)}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      📅{" "}
                      {post.create_time
                        ? new Date(post.create_time).toLocaleDateString()
                        : ""}
                    </span>
                    {post.update_time && post.update_time !== post.create_time && (
                      <span>
                        🔄 {new Date(post.update_time).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      post.is_public
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {post.is_public ? "公开" : "私有"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/edit-post/${post.id}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  编辑
                </button>
                <button
                  onClick={() =>
                    setDeleteTarget({ id: post.id, title: post.title })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="删除文章"
        message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
