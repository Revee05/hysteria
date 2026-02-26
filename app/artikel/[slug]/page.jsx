import { Person, Instagram, Facebook, X as XIcon } from "@mui/icons-material";
import TiptapRenderer from "@/components/tiptap/TiptapRenderer";
import { getPublicArticleDetail } from "@/modules/public/articles/services/article.public.service";
import { getRecommendedArticles } from "@/modules/public/articles/services/article.public.service";
import ArticleCard from "@/components/ui/ArticleCard";

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

  const categoryIds = article.categories.map((c) => c.id);

  const recommendedArticles = await getRecommendedArticles({
    slug: article.slug,
    categoryIds,
  });

  return (
    <article className="max-w-6xl mx-auto px-6 py-20">
      {/* CATEGORY */}
      {article.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.categories.map((cat) => (
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
          <img
            src={article.featuredImage}
            alt={article.title}
            className="rounded-xl mb-10 w-full object-cover"
          />
        )}
        {/* CONTENT */}
        <TiptapRenderer content={article.content} />

        {/* ================= EDITOR ================= */}
        {article.editorName && (
          <div className="mt-14 bg-gray-200/60 rounded-2xl px-6 py-4">
            <span className="font-semibold text-gray-700">Editor:</span>{" "}
            <span className="text-gray-600">{article.editorName}</span>
          </div>
        )}

        {/* ================= TAGS + SHARE ================= */}
        <div className="mt-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* TAGS */}
          {article.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag) => (
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
              {/* Instagram */}
              <a
                href={`https://www.instagram.com/`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition-colors"
              >
                <Instagram fontSize="large" />
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${process.env.NEXT_PUBLIC_SITE_URL}/artikel/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition-colors"
              >
                <Facebook fontSize="large" />
              </a>

              {/* X */}
              <a
                href={`https://twitter.com/intent/tweet?url=${process.env.NEXT_PUBLIC_SITE_URL}/artikel/${article.slug}`}
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
      {/* ================= ARTIKEL LAINNYA ================= */}
      {recommendedArticles.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Artikel Lainnya</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedArticles.map((item) => (
              <ArticleCard key={item.id} article={item} variant="small" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
