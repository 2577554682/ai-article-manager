import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicPosts, searchPosts } from "../services/api";
import { Search, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "../hooks/useDebounce";
import Pagination from "../components/ui/Pagination";

const PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-24" />
    </div>
  );
}

export default function PublicPostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["public-posts", page, debouncedSearch],
    queryFn: async () => {
      const skip = (page - 1) * PAGE_SIZE;
      const limit = PAGE_SIZE + 1;
      if (debouncedSearch.trim()) {
        const res = await searchPosts(debouncedSearch.trim(), skip, limit);
        return res.data;
      } else {
        const res = await getPublicPosts(skip, limit);
        return res.data;
      }
    },
  });

  const displayedPosts = data?.slice(0, PAGE_SIZE) ?? [];
  const hasNextPage = data ? data.length > PAGE_SIZE : false;
  const totalPages = hasNextPage ? page + 1 : page;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">公开文章</h1>

      {/* 搜索栏 */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="搜索文章标题..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 文章网格 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border">
          {debouncedSearch ? (
            <p>未找到相关文章</p>
          ) : (
            <p>暂无公开文章</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {displayedPosts.map((post) => {
              const isExpanded = expandedId === post.id;
              return (
                <div
                  key={post.id}
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-5"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {post.title}
                    </h3>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform shrink-0 mt-0.5 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* 折叠时显示预览 */}
                  {!isExpanded && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  )}

                  {/* 展开时显示完整内容 */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                        {post.content}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>
                      📅{" "}
                      {post.create_time
                        ? format(new Date(post.create_time), "yyyy-MM-dd HH:mm")
                        : ""}
                    </span>
                    {post.update_time &&
                      post.update_time !== post.create_time && (
                        <span>🔄 已更新</span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
