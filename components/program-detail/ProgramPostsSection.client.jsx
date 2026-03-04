"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProgramSearchBar from "./ProgramSearchBar.client";
import InstagramPostCard from "./InstagramPostCard";
import PaginationPill from "./PaginationPill";

export default function ProgramPostsSection({
  programSlug,
  posts = [],
  totalPages = 5,
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const page = useMemo(() => {
    const raw = Number(sp.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [sp]);

  const initialQuery = sp.get("q") ?? "";
  const [localQuery, setLocalQuery] = useState(initialQuery);

  function pushParams(next) {
    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  }

  function handleSearch(q) {
    setLocalQuery(q);
    const next = new URLSearchParams(sp.toString());
    if (q?.trim()) next.set("q", q.trim());
    else next.delete("q");
    next.set("page", "1");
    pushParams(next);
  }

  function handlePageChange(nextPage) {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(nextPage));
    pushParams(next);
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <ProgramSearchBar
          initialQuery={localQuery}
          onSearch={handleSearch}
          onFilterClick={() => {
            alert("Filter (UI placeholder)");
          }}
          isLoading={isPending}
        />

        <div className="mt-12 grid grid-cols-2 gap-7 sm:grid-cols-3 sm:gap-9 lg:grid-cols-5">
          {posts.map((post) => (
            <InstagramPostCard
              key={post.id}
              href={`/program/${programSlug}/post/${post.id}`}
              thumbnailUrl={post.thumbnailUrl}
              alt={post.alt ?? "Instagram thumbnail"}
            />
          ))}
        </div>

        <div className="mt-14">
          <PaginationPill
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </section>
  );
}
