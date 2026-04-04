/**
 * loading.jsx — Skeleton pre-loader for /platform/[slug]
 *
 * Mirrors the layout of HeadSection, MediaSection, and ListCategorySection.
 * Rendered automatically by Next.js while the async Page is resolving.
 */
export default function Loading() {
  return (
    <main className="bg-white min-h-screen animate-pulse">

      {/* ─────────────────────────────────────────────
          HeadSection skeleton
          2-col grid: text left  |  image right
      ───────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 md:py-20">
        <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1800px] px-4 sm:px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">

          {/* Text column */}
          <div className="space-y-4">
            {/* headline */}
            <div className="h-10 sm:h-12 md:h-14 w-4/5 rounded-md bg-zinc-200" />
            <div className="h-10 sm:h-12 md:h-14 w-3/5 rounded-md bg-zinc-200" />

            {/* subHeadline — 3 lines */}
            <div className="mt-4 space-y-2">
              <div className="h-4 sm:h-5 w-full rounded bg-zinc-200" />
              <div className="h-4 sm:h-5 w-11/12 rounded bg-zinc-200" />
              <div className="h-4 sm:h-5 w-4/6 rounded bg-zinc-200" />
            </div>

            {/* Social buttons */}
            <div className="flex gap-3 pt-2">
              <div className="h-9 w-28 rounded-md bg-zinc-200" />
              <div className="h-9 w-28 rounded-md bg-zinc-200" />
            </div>
          </div>

          {/* Image column */}
          <div className="flex justify-center md:justify-end order-first md:order-last">
            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg aspect-[4/3] rounded-xl bg-zinc-200" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          MediaSection skeleton  — 16 : 9 iframe
      ───────────────────────────────────────────── */}
      <section className="sm:py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1920px] px-4 sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="relative rounded-lg overflow-hidden bg-zinc-200" style={{ paddingTop: '56.25%' }} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          ListCategorySection skeleton  — 3-col grid
      ───────────────────────────────────────────── */}
      <section className="px-4 py-8 sm:py-8 md:py-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1800px] px-0 sm:px-2 md:px-4">
          <div className="px-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-3 border-b border-zinc-200">
                {/* card image */}
                <div className="rounded-md overflow-hidden border border-zinc-200">
                  <div className="w-full h-48 sm:h-56 lg:h-64 bg-zinc-200 rounded-lg" />
                </div>

                {/* card title + arrow */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-zinc-200" />
                  <div className="h-5 w-5 rounded bg-zinc-200 mr-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
