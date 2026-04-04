const IDLE_UPLOAD_FEEDBACK = { status: "idle", message: "", index: null };

export function buildCollaborationSectionConfigs({
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
}) {
  return [
    {
      key: "reason",
      title: "Alasan Berkolaborasi*",
      items: reasonItemsLabel,
      selectedIndex: selectedReasonIndex,
      onSelect: (idx) => {
        setSelectedReasonIndex(idx);
        setReasonDraft(reasons[idx]);
      },
      onReorder: reorderReason,
      form: reasonDraft,
      onChange: setReasonDraft,
      onAdd: addReason,
      onSave: saveReasonDraft,
      onDelete: deleteReason,
      showSubTitle: true,
      imageSize: "Size: 500 x 220 px, Max. 3Mb",
      uploadingImage: uploadingSection === "reason",
      uploadFeedback: uploadState.reason.index === selectedReasonIndex ? uploadState.reason : IDLE_UPLOAD_FEEDBACK,
    },
    {
      key: "scheme",
      title: "Skema Berkolaborasi*",
      items: schemeItemsLabel,
      selectedIndex: selectedSchemeIndex,
      onSelect: (idx) => {
        setSelectedSchemeIndex(idx);
        setSchemeDraft(schemes[idx]);
      },
      onReorder: reorderScheme,
      form: schemeDraft,
      onChange: setSchemeDraft,
      onAdd: addScheme,
      onSave: saveSchemeDraft,
      onDelete: deleteScheme,
      showSubTitle: false,
      imageSize: "Size: 380 x 480 px, Max. 3Mb",
      uploadingImage: uploadingSection === "scheme",
      uploadFeedback: uploadState.scheme.index === selectedSchemeIndex ? uploadState.scheme : IDLE_UPLOAD_FEEDBACK,
    },
    {
      key: "flow",
      title: "Cara & Alur Kolaborasi*",
      items: flowItemsLabel,
      selectedIndex: selectedFlowIndex,
      onSelect: (idx) => {
        setSelectedFlowIndex(idx);
        setFlowDraft(flows[idx]);
      },
      onReorder: reorderFlow,
      form: flowDraft,
      onChange: setFlowDraft,
      onAdd: addFlow,
      onSave: saveFlowDraft,
      onDelete: deleteFlow,
      showSubTitle: true,
      imageSize: "Size: 500 x 220 px, Max. 3Mb",
      uploadingImage: uploadingSection === "flow",
      uploadFeedback: uploadState.flow.index === selectedFlowIndex ? uploadState.flow : IDLE_UPLOAD_FEEDBACK,
    },
  ];
}
