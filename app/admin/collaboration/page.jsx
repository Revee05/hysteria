"use client";

import { useState } from "react";
import CollaborationTabs from "./_components/CollaborationTabs";
import ContactSectionEditor from "./_components/ContactSectionEditor";
import EditorSection from "./_components/EditorSection";
import HeroSectionEditor from "./_components/HeroSectionEditor";
import { buildCollaborationSectionConfigs } from "./_components/sectionConfigs";
import SuccessToast from "./_components/SuccessToast";
import useCollaborationSettings from "./_components/useCollaborationSettings";

export default function CollaborationSettingsPage() {
  const [activeTab, setActiveTab] = useState("tampilan");
  const {
    loading,
    saving,
    notice,
    successToast,
    uploadState,
    uploadingSection,
    contactForm,
    setContactForm,
    heroData,
    setHeroData,
    reasons,
    schemes,
    flows,
    selectedReasonIndex,
    setSelectedReasonIndex,
    selectedSchemeIndex,
    setSelectedSchemeIndex,
    selectedFlowIndex,
    setSelectedFlowIndex,
    reasonDraft,
    setReasonDraft,
    schemeDraft,
    setSchemeDraft,
    flowDraft,
    setFlowDraft,
    reasonItemsLabel,
    schemeItemsLabel,
    flowItemsLabel,
    addReason,
    addScheme,
    addFlow,
    deleteReason,
    deleteScheme,
    deleteFlow,
    reorderReason,
    reorderScheme,
    reorderFlow,
    saveReasonDraft,
    saveSchemeDraft,
    saveFlowDraft,
    handleSaveAll,
    uploadDraftImage,
  } = useCollaborationSettings();

  const sectionConfigs = buildCollaborationSectionConfigs({
    reasonItemsLabel,
    selectedReasonIndex,
    setSelectedReasonIndex,
    reasons,
    reorderReason,
    reasonDraft,
    setReasonDraft,
    addReason,
    saveReasonDraft,
    deleteReason,
    uploadingSection,
    uploadState,
    schemeItemsLabel,
    selectedSchemeIndex,
    setSelectedSchemeIndex,
    schemes,
    reorderScheme,
    schemeDraft,
    setSchemeDraft,
    addScheme,
    saveSchemeDraft,
    deleteScheme,
    flowItemsLabel,
    selectedFlowIndex,
    setSelectedFlowIndex,
    flows,
    reorderFlow,
    flowDraft,
    setFlowDraft,
    addFlow,
    saveFlowDraft,
    deleteFlow,
  });

  if (loading) {
    return <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">Memuat pengaturan kolaborasi...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111]">Pengaturan Kolaborasi</h1>
            <p className="mt-2 text-base text-[#333]">
              Kelola tampilan halaman kolaborasi dan manajemen kontak dan form kolaborasi
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="cursor-pointer rounded-xl bg-[#4b3556] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3b2746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89fda] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        <CollaborationTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {activeTab === "tampilan" ? (
          <div className="space-y-6">
            <HeroSectionEditor heroData={heroData} onChangeHero={setHeroData} />

            {sectionConfigs.map((section) => (
              <EditorSection
                key={section.key}
                title={section.title}
                items={section.items}
                selectedIndex={section.selectedIndex}
                onSelect={section.onSelect}
                onReorder={section.onReorder}
                form={section.form}
                onChange={section.onChange}
                onAdd={section.onAdd}
                onSave={section.onSave}
                onDelete={section.onDelete}
                showSubTitle={section.showSubTitle}
                imageNote="Format: .jpg, .png"
                imageSize={section.imageSize}
                onUploadImage={(file) => uploadDraftImage(file, section.key)}
                uploadingImage={section.uploadingImage}
                uploadFeedback={section.uploadFeedback}
              />
            ))}
          </div>
        ) : (
          <ContactSectionEditor contactForm={contactForm} onChangeContact={setContactForm} />
        )}

        {notice ? <p className="mt-4 text-sm text-[#4b3556]">{notice}</p> : null}
        <SuccessToast open={successToast.open} message={successToast.message} />
      </div>
    </div>
  );
}
