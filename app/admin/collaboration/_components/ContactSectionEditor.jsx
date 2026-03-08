import { Mail, MessageSquare } from "lucide-react";
import SectionCard from "./SectionCard";

export default function ContactSectionEditor({ contactForm, onChangeContact }) {
  return (
    <SectionCard title="Kontak Kolaborasi">
      <div className="mb-6">
        <label className="mb-2 flex items-center gap-3 text-xl font-medium text-[#222]">
          <MessageSquare size={22} className="text-black" />
          <span>WhatsApp</span>
        </label>

        <input
          type="text"
          value={contactForm.whatsappNumber}
          onChange={(e) => onChangeContact({ ...contactForm, whatsappNumber: e.target.value })}
          placeholder="+62 812 3456 7890"
          className="w-full rounded-2xl border border-gray-500 bg-white px-5 py-4 text-xl text-gray-900 outline-none transition focus:border-[#e5489b] focus:ring-2 focus:ring-[#f7b3d2]"
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-3 text-xl font-medium text-[#222]">
          <Mail size={22} className="text-black" />
          <span>Link Kolaborasi (Google Form/Email)</span>
        </label>

        <input
          type="text"
          value={contactForm.googleFormUrl}
          onChange={(e) => onChangeContact({ ...contactForm, googleFormUrl: e.target.value })}
          placeholder="https://docs.google.com/forms/..."
          className="w-full rounded-2xl border border-gray-500 bg-white px-5 py-4 text-xl text-gray-900 outline-none transition focus:border-[#e5489b] focus:ring-2 focus:ring-[#f7b3d2]"
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 flex items-center gap-3 text-xl font-medium text-[#222]">
          <MessageSquare size={22} className="text-black" />
          <span>Pesan WhatsApp Default</span>
        </label>

        <textarea
          value={contactForm.whatsappMessage}
          onChange={(e) => onChangeContact({ ...contactForm, whatsappMessage: e.target.value })}
          rows={4}
          className="w-full rounded-2xl border border-gray-500 bg-white px-5 py-4 text-base text-gray-900 outline-none transition focus:border-[#e5489b] focus:ring-2 focus:ring-[#f7b3d2]"
        />
      </div>
    </SectionCard>
  );
}
