"use client";

export default function ShareButtons({ url, title }) {
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });
      } catch {
        // user cancel
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="font-semibold text-[18px] text-[var(--Color-5)] whitespace-nowrap">
        Share:
      </h3>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share ke Facebook"
      >
        <img src="/icons/facebook.png" alt="Facebook" className="w-10 h-10" />
      </a>

      {/* X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share ke X"
      >
        <img src="/icons/x.png" alt="X" className="w-10 h-10" />
      </a>

      {/* Native Share */}
      <button
        onClick={shareNative}
        title="Share"
      >
        <img src="/icons/share.png" alt="Share" className="w-10 h-10" />
      </button>
    </div>
  );
}