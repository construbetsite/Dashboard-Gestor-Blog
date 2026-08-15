import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Star,
  FileQuestion,
} from "lucide-react";
import { useBlogPost } from "../../hooks/useBlogPost";
import { formatDate } from "../../utils/formatDate";
import { getImageUrl } from "../../utils/imageUrl";

function RichContent({ content }: { content?: string }) {
  if (!content) {
    return (
      <p className="text-slate-600">
        Conteúdo não disponível para este post.
      </p>
    );
  }
  return (
    <div
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

function getYouTubeEmbed(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error, notFound } = useBlogPost(slug, "slug");

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-10 w-3/4 rounded bg-slate-200" />
          <div className="aspect-[16/9] rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || (!post && !error)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <FileQuestion size={32} className="text-slate-500" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-slate-900">Post não encontrado</h1>
        <p className="mt-3 text-slate-600">
          O post que você procura não existe ou foi removido.
        </p>
        <Link
          to="/admin/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0A2230] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#133a4f]"
        >
          <ArrowLeft size={16} />
          Voltar para o blog
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
          <AlertTriangle size={32} className="text-rose-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Erro ao carregar o post</h1>
        <p className="mt-3 text-slate-600">{error}</p>
        <Link
          to="/admin/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Voltar para o blog
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const video1Embed = getYouTubeEmbed(post.video1);
  const video2Embed = getYouTubeEmbed(post.video2);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Link
        to="/admin/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#004AAD] transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para o blog
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {post.categoria?.nome || post.category ? (
            <span className="rounded-full bg-[#004AAD]/10 px-3 py-1 font-medium text-[#004AAD]">
              {post.categoria?.nome || post.category}
            </span>
          ) : null}
          {post.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
              <Star size={13} />
              Destaque
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
          {post.title}
        </h1>

        {post.description && (
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{post.description}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={15} />
            {formatDate(post.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} />
            {post.reading_time || "Leitura rápida"}
          </span>
          {post.author && (
            <span className="inline-flex items-center gap-1.5">
              <User size={15} />
              {post.author}
            </span>
          )}
        </div>
      </header>

      {post.image_url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <img
            src={getImageUrl(post.image_url)}
            alt={post.title}
            className="w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {post.author && post.author_image && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={getImageUrl(post.author_image)}
            alt={post.author}
            className="h-12 w-12 rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">{post.author}</p>
            <p className="text-xs text-slate-500">Autor</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <RichContent content={post.content} />
      </div>

      {video1Embed || video2Embed ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {video1Embed && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="aspect-video">
                <iframe
                  src={video1Embed}
                  title={`Vídeo 1 - ${post.title}`}
                  className="h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}
          {video2Embed && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="aspect-video">
                <iframe
                  src={video2Embed}
                  title={`Vídeo 2 - ${post.title}`}
                  className="h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}