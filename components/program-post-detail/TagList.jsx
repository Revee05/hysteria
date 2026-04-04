export default function TagList({ tags = [] }) {
  if (!tags?.length) return null;

  return (
    <div className="mt-6 text-sm">
      <span className="font-semibold text-[#ff4aa2]">Tags:</span>{" "}
      <span className="text-[#ff4aa2]">
        {tags.map((t, idx) => (
          <span key={t}>
            {t}
            {idx < tags.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </div>
  );
}
