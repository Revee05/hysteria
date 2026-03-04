import Link from "next/link";
import InstagramPreviewCard from "./InstagramPreviewCard";
import TagList from "./TagList";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none">
      <path
        d="M7.5 2.75h9A4.75 4.75 0 0 1 21.25 7.5v9A4.75 4.75 0 0 1 16.5 21.25h-9A4.75 4.75 0 0 1 2.75 16.5v-9A4.75 4.75 0 0 1 7.5 2.75Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 16.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17.25 6.75h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none">
      <path
        d="M11 5 6.5 8.5H4v7h2.5L11 19V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15 9.5a3.5 3.5 0 0 1 0 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17.5 7a7 7 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PostDetailSection({ post }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div className="flex justify-center lg:justify-start">
            <InstagramPreviewCard
              thumbnailUrl={post.thumbnailUrl}
              alt={post.title}
              leftBadge={<InstagramIcon />}
              rightBadge={<SoundIcon />}
              className="max-w-70"
            />
          </div>

          <div className="max-w-2xl">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#2b2433]">
              {post.heading}
            </h2>

            {post.shortText ? (
              <p className="mt-6 text-sm text-[#2b2433]/80">{post.shortText}</p>
            ) : null}

            {post.paragraphs?.length ? (
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#2b2433]/80">
                {post.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            ) : null}

            <TagList tags={post.tags} />

            <div className="mt-10">
              <Link
                href={post.instagramUrl || "#"}
                className="inline-flex items-center justify-center rounded-xl bg-[#2b2433] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                target={post.instagramUrl ? "_blank" : undefined}
                rel={post.instagramUrl ? "noreferrer" : undefined}
              >
                Lihat di Instagram
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
