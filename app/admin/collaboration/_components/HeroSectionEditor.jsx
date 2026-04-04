import SectionCard from "./SectionCard";

export default function HeroSectionEditor({ heroData, onChangeHero }) {
  return (
    <SectionCard title="Hero Page Kolaborasi*">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-lg font-medium text-[#222]">Sub Headline</label>
          <input
            type="text"
            value={heroData.subHeadline}
            onChange={(e) => onChangeHero({ ...heroData, subHeadline: e.target.value })}
            className="w-full rounded-xl border border-[#8f8f8f] bg-white px-4 py-3 text-[#222] outline-none focus:border-[#ea4c9d]"
          />
        </div>

        <div>
          <label className="mb-2 block text-lg font-medium text-[#222]">Notes</label>
          <input
            type="text"
            value={heroData.notes}
            onChange={(e) => onChangeHero({ ...heroData, notes: e.target.value })}
            className="w-full rounded-xl border border-[#8f8f8f] bg-white px-4 py-3 text-[#222] outline-none focus:border-[#ea4c9d]"
          />
        </div>
      </div>
    </SectionCard>
  );
}
