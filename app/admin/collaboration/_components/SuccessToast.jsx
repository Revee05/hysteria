export default function SuccessToast({ open, message }) {
  if (!open) return null;

  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="rounded-xl border border-[#bde8cf] bg-[#e9f9f0] px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold text-[#1f7a45]">{message}</p>
      </div>
    </div>
  );
}
