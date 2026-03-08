import CollaborationHero from "../../_sectionComponents/kolaborasi/CollaborationHero";
import WhyCollaborate from "../../_sectionComponents/kolaborasi/WhyCollaborate";
import CollaborationSchemes from "../../_sectionComponents/kolaborasi/CollaborationSchemes";
import CollaborationFlow from "../../_sectionComponents/kolaborasi/CollaborationFlow";
import CollaborationWhatsApp from "../../_sectionComponents/kolaborasi/CollaborationWhatsApp";
import { getPublicCollaborationContent } from "../../modules/admin/collaboration/index.js";

export const metadata = {
  title: "Kolaborasi | Hysteria",
};

async function getCollaborationContent() {
  try {
    return await getPublicCollaborationContent();
  } catch {
    return null;
  }
}

export default async function KolaborasiPage() {
  const content = await getCollaborationContent();

  const defaultContent = {
    heroTitle: "Mari Berkolaborasi",
    heroDescription:
      "Kami membuka ruang kolaborasi bagi individu, komunitas, dan institusi yang ingin menciptakan program, event, dan inisiatif berdampak bersama.",
    googleFormUrl: process.env.NEXT_PUBLIC_COLLABORATION_FORM_URL || "/contact",
    whatsappNumber: "6281214272483",
    whatsappMessage: "Halo, saya tertarik untuk berkolaborasi dengan Hysteria",
    whyBenefits: [
      {
        title: "Tim Profesional",
        description: "Bergabung dengan tim yang berpengalaman dan berdedikasi",
        imageUrl: "",
      },
      {
        title: "Jaringan Luas",
        description: "Akses ke jaringan komunitas dan partnership yang kuat",
        imageUrl: "",
      },
      {
        title: "Dukungan Penuh",
        description: "Mendapat dukungan penuh dalam setiap tahap kolaborasi",
        imageUrl: "",
      },
    ],
    schemes: [
      {
        title: "Event Partnership",
        description: "Kolaborasi dalam penyelenggaraan event dan aktivitas",
        imageUrl: "",
      },
      {
        title: "Content Collaboration",
        description: "Berkolaborasi dalam pembuatan konten berkualitas",
        imageUrl: "",
      },
      {
        title: "Research Partnership",
        description: "Kerjasama dalam riset dan pengembangan program",
        imageUrl: "",
      },
    ],
    flowSteps: [
      {
        step: "1",
        title: "Pengajuan Proposal",
        description: "Ajukan proposal kolaborasi melalui formulir kami",
        imageUrl: "",
      },
      {
        step: "2",
        title: "Review Tim",
        description: "Tim kami akan melakukan review dalam 3-5 hari kerja",
        imageUrl: "",
      },
      {
        step: "3",
        title: "Diskusi & Finalisasi",
        description: "Diskusi detail dan finalisasi program bersama",
        imageUrl: "",
      },
      {
        step: "4",
        title: "Eksekusi",
        description: "Jalankan program kolaborasi sesuai kesepakatan",
        imageUrl: "",
      },
    ],
  };

  const data = content || defaultContent;

  return (
    <main className="bg-white text-zinc-900">
      <CollaborationHero
        title={data.heroTitle}
        description={data.heroDescription}
        googleFormUrl={data.googleFormUrl}
        notesText={data.heroNotes}
      />
      <WhyCollaborate title="Mengapa Berkolaborasi dengan Kami?" benefits={data.whyBenefits} />
      <CollaborationSchemes title="Skema Kolaborasi" schemes={data.schemes} />
      <CollaborationFlow title="Alur Kolaborasi" steps={data.flowSteps} />
      <CollaborationWhatsApp
        whatsappNumber={data.whatsappNumber}
        message={data.whatsappMessage}
      />
    </main>
  );
}
