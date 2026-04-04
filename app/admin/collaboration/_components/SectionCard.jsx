export default function SectionCard({ title, children }) {
  return (
    <div className="rounded-lg border border-[#9c9c9c] bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.08)] md:p-5">
      <h2 className="mb-4 text-2xl font-bold text-[#111]">{title}</h2>
      {children}
    </div>
  );
}
