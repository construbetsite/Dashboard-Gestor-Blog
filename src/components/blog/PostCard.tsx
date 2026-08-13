import { Link } from "react-router-dom";
import type { BlogPost } from "../../types/blog";
import { formatDate } from "../../utils/formatDate";
import { getImageUrl } from "../../utils/imageUrl";

interface PostCardProps {
  post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="flex gap-4">
          {post.image && (
            <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={getImageUrl(post.image)}
                alt={post.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#004AAD] transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.description && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {post.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{formatDate(post.created_at)}</span>
              <span>•</span>
              <span>{post.reading_time || "Leitura rápida"}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="rounded-full bg-[#004AAD]/10 px-2 py-0.5 font-medium text-[#004AAD]">
                    {post.category}
                  </span>
                </>
              )}
              {post.featured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                  Destaque
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}