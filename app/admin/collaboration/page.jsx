"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CollaborationTabs from "./_components/CollaborationTabs";
import ContactSectionEditor from "./_components/ContactSectionEditor";
import EditorSection from "./_components/EditorSection";
import HeroSectionEditor from "./_components/HeroSectionEditor";
import {
  DEFAULT_FLOW_ITEM,
  DEFAULT_HERO,
  DEFAULT_REASON_ITEM,
  DEFAULT_SCHEME_ITEM,
  INITIAL_CONTACT_FORM,
  moveItem,
} from "./_components/constants";

export default function CollaborationSettingsPage() {
  const [activeTab, setActiveTab] = useState("tampilan");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSection, setUploadingSection] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimeoutRef = useRef(null);
  const [uploadState, setUploadState] = useState({
    reason: { status: "idle", message: "" },
    scheme: { status: "idle", message: "" },
    flow: { status: "idle", message: "" },
  });

  const [contactForm, setContactForm] = useState(INITIAL_CONTACT_FORM);
  const [heroData, setHeroData] = useState(DEFAULT_HERO);

  const [reasons, setReasons] = useState([DEFAULT_REASON_ITEM]);
  const [schemes, setSchemes] = useState([DEFAULT_SCHEME_ITEM]);
  const [flows, setFlows] = useState([DEFAULT_FLOW_ITEM]);

  const [selectedReasonIndex, setSelectedReasonIndex] = useState(0);
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);
  const [selectedFlowIndex, setSelectedFlowIndex] = useState(0);

  const [reasonDraft, setReasonDraft] = useState(DEFAULT_REASON_ITEM);
  const [schemeDraft, setSchemeDraft] = useState(DEFAULT_SCHEME_ITEM);
  const [flowDraft, setFlowDraft] = useState(DEFAULT_FLOW_ITEM);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/admin/collaboration-content");
        const json = await res.json().catch(() => null);
        const data = json?.data?.collaboration;

        if (!isMounted || !res.ok || !json?.success || !data) return;

        const loadedReasons = Array.isArray(data.whyBenefits) && data.whyBenefits.length > 0 ? data.whyBenefits : [DEFAULT_REASON_ITEM];
        const loadedSchemes = Array.isArray(data.schemes) && data.schemes.length > 0 ? data.schemes : [DEFAULT_SCHEME_ITEM];
        const loadedFlows = Array.isArray(data.flowSteps) && data.flowSteps.length > 0 ? data.flowSteps : [DEFAULT_FLOW_ITEM];

        setContactForm({
          googleFormUrl: data.googleFormUrl || "",
          whatsappNumber: data.whatsappNumber || "",
          whatsappMessage: data.whatsappMessage || INITIAL_CONTACT_FORM.whatsappMessage,
        });

        setHeroData({
          subHeadline: data.heroSubHeadline || DEFAULT_HERO.subHeadline,
          notes: data.heroNotes || DEFAULT_HERO.notes,
        });

        setReasons(loadedReasons);
        setSchemes(loadedSchemes);
        setFlows(loadedFlows);

        setSelectedReasonIndex(0);
        setSelectedSchemeIndex(0);
        setSelectedFlowIndex(0);

        setReasonDraft(loadedReasons[0]);
        setSchemeDraft(loadedSchemes[0]);
        setFlowDraft(loadedFlows[0]);
      } catch (error) {
        console.error("Error loading collaboration settings:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const reasonItemsLabel = useMemo(() => reasons.map((item) => item.title || "Untitled"), [reasons]);
  const schemeItemsLabel = useMemo(() => schemes.map((item) => item.title || "Untitled"), [schemes]);
  const flowItemsLabel = useMemo(() => flows.map((item) => item.title || "Untitled"), [flows]);

  const saveReasonDraft = () => {
    setReasons((prev) => prev.map((item, idx) => (idx === selectedReasonIndex ? { ...reasonDraft } : item)));
  };

  const saveSchemeDraft = () => {
    setSchemes((prev) => prev.map((item, idx) => (idx === selectedSchemeIndex ? { ...schemeDraft } : item)));
  };

  const saveFlowDraft = () => {
    setFlows((prev) => prev.map((item, idx) => (idx === selectedFlowIndex ? { ...flowDraft } : item)));
  };

  const addReason = () => {
    setReasons((prev) => {
      const next = [...prev, { ...DEFAULT_REASON_ITEM }];
      const newIndex = next.length - 1;
      setSelectedReasonIndex(newIndex);
      setReasonDraft(next[newIndex]);
      return next;
    });
  };

  const addScheme = () => {
    setSchemes((prev) => {
      const next = [...prev, { ...DEFAULT_SCHEME_ITEM }];
      const newIndex = next.length - 1;
      setSelectedSchemeIndex(newIndex);
      setSchemeDraft(next[newIndex]);
      return next;
    });
  };

  const addFlow = () => {
    setFlows((prev) => {
      const next = [...prev, { ...DEFAULT_FLOW_ITEM }];
      const newIndex = next.length - 1;
      setSelectedFlowIndex(newIndex);
      setFlowDraft(next[newIndex]);
      return next;
    });
  };

  const deleteReason = () => {
    setReasons((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, idx) => idx !== selectedReasonIndex);
      const nextIndex = Math.max(0, selectedReasonIndex - 1);
      setSelectedReasonIndex(nextIndex);
      setReasonDraft(next[nextIndex]);
      return next;
    });
  };

  const deleteScheme = () => {
    setSchemes((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, idx) => idx !== selectedSchemeIndex);
      const nextIndex = Math.max(0, selectedSchemeIndex - 1);
      setSelectedSchemeIndex(nextIndex);
      setSchemeDraft(next[nextIndex]);
      return next;
    });
  };

  const deleteFlow = () => {
    setFlows((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, idx) => idx !== selectedFlowIndex);
      const nextIndex = Math.max(0, selectedFlowIndex - 1);
      setSelectedFlowIndex(nextIndex);
      setFlowDraft(next[nextIndex]);
      return next;
    });
  };

  const reorderReason = (index) => {
    const target = index === 0 ? 1 : index - 1;
    if (target >= reasons.length) return;
    setReasons((prev) => {
      const next = moveItem(prev, index, target);
      setSelectedReasonIndex(target);
      setReasonDraft(next[target]);
      return next;
    });
  };

  const reorderScheme = (index) => {
    const target = index === 0 ? 1 : index - 1;
    if (target >= schemes.length) return;
    setSchemes((prev) => {
      const next = moveItem(prev, index, target);
      setSelectedSchemeIndex(target);
      setSchemeDraft(next[target]);
      return next;
    });
  };

  const reorderFlow = (index) => {
    const target = index === 0 ? 1 : index - 1;
    if (target >= flows.length) return;
    setFlows((prev) => {
      const next = moveItem(prev, index, target);
      setSelectedFlowIndex(target);
      setFlowDraft(next[target]);
      return next;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setNotice("");

    try {
      const reasonsToSave = reasons.map((item, idx) => (idx === selectedReasonIndex ? { ...reasonDraft } : item));
      const schemesToSave = schemes.map((item, idx) => (idx === selectedSchemeIndex ? { ...schemeDraft } : item));
      const flowsToSave = flows.map((item, idx) => (idx === selectedFlowIndex ? { ...flowDraft } : item));

      const payload = {
        ...contactForm,
        heroSubHeadline: heroData.subHeadline,
        heroNotes: heroData.notes,
        whyBenefits: reasonsToSave,
        schemes: schemesToSave,
        flowSteps: flowsToSave,
      };

      const res = await fetch("/api/admin/collaboration-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "Gagal menyimpan pengaturan kolaborasi");
      }

      setNotice("Perubahan berhasil disimpan");
    } catch (error) {
      setNotice(error?.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const showNotice = (message) => {
    setNotice(message);
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const uploadDraftImage = async (file, section) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploadingSection(section);
    setUploadState((prev) => ({
      ...prev,
      [section]: { status: "uploading", message: `Mengunggah ${file.name}...` },
    }));

    try {
      const res = await fetch("/api/admin/collaboration-content/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json?.data?.url) {
        throw new Error(json?.error?.message || "Gagal upload gambar");
      }

      if (section === "reason") {
        setReasonDraft((prev) => ({ ...prev, imageUrl: json.data.url }));
      }

      if (section === "scheme") {
        setSchemeDraft((prev) => ({ ...prev, imageUrl: json.data.url }));
      }

      if (section === "flow") {
        setFlowDraft((prev) => ({ ...prev, imageUrl: json.data.url }));
      }

      setUploadState((prev) => ({
        ...prev,
        [section]: { status: "success", message: `Berhasil upload: ${file.name}` },
      }));
      showNotice("Upload gambar berhasil");
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        [section]: { status: "error", message: error?.message || "Upload gagal, silakan coba lagi" },
      }));
      showNotice(error?.message || "Terjadi kesalahan saat upload gambar");
    } finally {
      setUploadingSection("");
    }
  };

  useEffect(
    () => () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    },
    [],
  );

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

            <EditorSection
              title="Alasan Berkolaborasi*"
              items={reasonItemsLabel}
              selectedIndex={selectedReasonIndex}
              onSelect={(idx) => {
                setSelectedReasonIndex(idx);
                setReasonDraft(reasons[idx]);
              }}
              onReorder={reorderReason}
              form={reasonDraft}
              onChange={setReasonDraft}
              onAdd={addReason}
              onSave={saveReasonDraft}
              onDelete={deleteReason}
              showSubTitle
              showImageUrlField
              imageNote="Format: .jpg, .png"
              imageSize="Size: 500 x 220 px, Max. 3Mb"
              onUploadImage={(file) => uploadDraftImage(file, "reason")}
              uploadingImage={uploadingSection === "reason"}
              uploadFeedback={uploadState.reason}
            />

            <EditorSection
              title="Skema Berkolaborasi*"
              items={schemeItemsLabel}
              selectedIndex={selectedSchemeIndex}
              onSelect={(idx) => {
                setSelectedSchemeIndex(idx);
                setSchemeDraft(schemes[idx]);
              }}
              onReorder={reorderScheme}
              form={schemeDraft}
              onChange={setSchemeDraft}
              onAdd={addScheme}
              onSave={saveSchemeDraft}
              onDelete={deleteScheme}
              showSubTitle={false}
              showImageUrlField
              imageNote="Format: .jpg, .png"
              imageSize="Size: 380 x 480 px, Max. 3Mb"
              onUploadImage={(file) => uploadDraftImage(file, "scheme")}
              uploadingImage={uploadingSection === "scheme"}
              uploadFeedback={uploadState.scheme}
            />

            <EditorSection
              title="Cara & Alur Kolaborasi*"
              items={flowItemsLabel}
              selectedIndex={selectedFlowIndex}
              onSelect={(idx) => {
                setSelectedFlowIndex(idx);
                setFlowDraft(flows[idx]);
              }}
              onReorder={reorderFlow}
              form={flowDraft}
              onChange={setFlowDraft}
              onAdd={addFlow}
              onSave={saveFlowDraft}
              onDelete={deleteFlow}
              showSubTitle
              showImageUrlField
              imageNote="Format: .jpg, .png"
              imageSize="Size: 500 x 220 px, Max. 3Mb"
              onUploadImage={(file) => uploadDraftImage(file, "flow")}
              uploadingImage={uploadingSection === "flow"}
              uploadFeedback={uploadState.flow}
            />
          </div>
        ) : (
          <ContactSectionEditor contactForm={contactForm} onChangeContact={setContactForm} />
        )}

        {notice ? <p className="mt-4 text-sm text-[#4b3556]">{notice}</p> : null}
      </div>
    </div>
  );
}
