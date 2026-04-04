import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_FLOW_ITEM,
  DEFAULT_HERO,
  DEFAULT_REASON_ITEM,
  DEFAULT_SCHEME_ITEM,
  INITIAL_CONTACT_FORM,
  moveItem,
} from "./constants";

export default function useCollaborationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSection, setUploadingSection] = useState("");
  const [notice, setNotice] = useState("");
  const [successToast, setSuccessToast] = useState({ open: false, message: "" });
  const noticeTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const [uploadState, setUploadState] = useState({
    reason: { status: "idle", message: "", index: null },
    scheme: { status: "idle", message: "", index: null },
    flow: { status: "idle", message: "", index: null },
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

  const showSuccessToast = (message) => {
    setSuccessToast({ open: true, message });
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccessToast((prev) => ({ ...prev, open: false }));
    }, 2600);
  };

  const saveReasonDraft = () => {
    setReasons((prev) => prev.map((item, idx) => (idx === selectedReasonIndex ? { ...reasonDraft } : item)));
    showSuccessToast("Bagian Alasan Berkolaborasi berhasil disimpan");
  };

  const saveSchemeDraft = () => {
    setSchemes((prev) => prev.map((item, idx) => (idx === selectedSchemeIndex ? { ...schemeDraft } : item)));
    showSuccessToast("Bagian Skema Berkolaborasi berhasil disimpan");
  };

  const saveFlowDraft = () => {
    setFlows((prev) => prev.map((item, idx) => (idx === selectedFlowIndex ? { ...flowDraft } : item)));
    showSuccessToast("Bagian Cara dan Alur Kolaborasi berhasil disimpan");
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
      showSuccessToast("Perubahan berhasil disimpan");
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

    const activeIndexBySection = {
      reason: selectedReasonIndex,
      scheme: selectedSchemeIndex,
      flow: selectedFlowIndex,
    };
    const activeIndex = activeIndexBySection[section];
    const currentImageBySection = {
      reason: reasonDraft?.imageUrl || "",
      scheme: schemeDraft?.imageUrl || "",
      flow: flowDraft?.imageUrl || "",
    };
    const oldImageUrl = currentImageBySection[section];

    const formData = new FormData();
    formData.append("image", file);
    if (oldImageUrl) {
      formData.append("oldUrl", oldImageUrl);
    }

    setUploadingSection(section);
    setUploadState((prev) => ({
      ...prev,
      [section]: { status: "uploading", message: `Mengunggah ${file.name}...`, index: activeIndex },
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
        [section]: { status: "success", message: `Berhasil upload: ${file.name}`, index: activeIndex },
      }));
      showNotice("Upload gambar berhasil");
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        [section]: { status: "error", message: error?.message || "Upload gagal, silakan coba lagi", index: activeIndex },
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
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    },
    [],
  );

  return {
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
  };
}
