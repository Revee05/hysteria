import { Person, Instagram, Facebook, X as XIcon } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TiptapRenderer from "@/components/tiptap/TiptapRenderer";
import {
  getPublicArticleDetail,
  getRecommendedArticles,
} from "@/modules/public/articles/services/article.public.service";

import Link from "next/link";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getPublicArticleDetail(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      ...(article.excerpt && { description: article.excerpt }),
      ...(article.featuredImage && { images: [article.featuredImage] }),
      type: "article",
    },
  };
}

import ArticleCard from "@/components/ui/ArticleCard";
import ArticleViewTracker from "@/components/tracker/ArticleViewTracker";

export default async function ArtikelDetail({ params }) {
  const { slug } = await params;

  if (!slug) {
    return (
      <div className="text-center py-20 text-gray-500">
        Artikel Tidak Ditemukan
      </div>
    );
  }

  const article = await getPublicArticleDetail(slug);

  if (!article) {
    return (
      <div className="text-center py-20 text-gray-500">
        Artikel Tidak Ditemukan
      </div>
    );
  }

  const categories = article.categories ?? [];
  const tags = article.tags ?? [];
  const references = article.references ?? [];

  const categoryIds = categories.map((c) => c.id);

  const recommendedArticles = await getRecommendedArticles({
    slug: article.slug,
    categoryIds,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const articleUrl = `${siteUrl}/artikel/${article.slug}`;

  return (
    <div className="bg-[var(--Color-1)] pt-19">
      <div className="bg-[var(--background)] text-[var(--foreground)]">
        <article className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-6">
            <Link
              href="/artikel"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-500 transition shadow-sm"
            >
              <ArrowBackIcon style={{ fontSize: 20 }} />
            </Link>
          </div>

          {/* CATEGORY */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 text-xs border border-pink-400 text-pink-500 rounded-full"
                >
                  {cat.title}
                </span>
              ))}
            </div>
          )}

          {/* TITLE */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {article.title}
          </h1>

          {/* META */}
          <div className="flex items-center gap-4 text-sm mb-8">
            <div className="flex items-center gap-2">
              <Person style={{ fontSize: 18 }} className="text-pink-500" />
              <span>{article.authorName}</span>
            </div>

            {article.publishedAt && (
              <>
                <span>|</span>
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </>
            )}
          </div>

          {/* FEATURED IMAGE */}
          <div className="w-5/6 mx-auto">
            {article.featuredImage && (
              <>
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="rounded-xl mb-2 w-full object-cover"
                />

                {article.featuredImageSource && (
                  <p className="text-sm text-pink-500 text-center mb-8">
                    Sumber: {article.featuredImageSource}
                  </p>
                )}
              </>
            )}

            {/* CONTENT */}
            <TiptapRenderer content={article.content} />

            {/* VIEW TRACKER */}
            <ArticleViewTracker slug={article.slug} />

            {/* REFERENCES */}
            {references.length > 0 && (
              <div className="mt-14 flex flex-wrap items-center text-sm leading-relaxed">
                <span className="font-semibold mr-2 text-pink-500">
                  Referensi Artikel :
                </span>

                {references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:underline mr-2"
                  >
                    {ref.title}
                    {index < references.length - 1 && ","}
                  </a>
                ))}
              </div>
            )}

            {/* EDITOR */}
            {article.editorName && (
              <div className="mt-7 bg-gray-200/60 rounded-2xl px-6 py-4">
                <span className="font-semibold text-gray-700">Editor:</span>{" "}
                <span className="text-gray-600">{article.editorName}</span>
              </div>
            )}

            {/* VIEWS */}
            <div className="mt-7 flex justify-start">
              <div className="px-6 py-2 rounded-full bg-pink-50 text-pink-500 text-xs font-medium">
                👁 {article.views} views
              </div>
            </div>

            {/* TAGS + SHARE */}
            <div className="mt-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Tags</h3>

                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-4 py-2 text-xs bg-gray-100 rounded-full"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SHARE */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Share</h3>

                <div className="flex gap-2 text-gray-600">
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <Instagram fontSize="large" />
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <Facebook fontSize="large" />
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${articleUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <XIcon fontSize="large" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ARTIKEL LAINNYA */}
          {recommendedArticles.length > 0 && (
            <section className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Artikel Lainnya</h2>

                <Link
                  href="/artikel"
                  className="text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedArticles.map((item) => (
                  <ArticleCard key={item.id} article={item} variant="small" />
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
