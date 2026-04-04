export const INITIAL_CONTACT_FORM = {
  googleFormUrl: "",
  whatsappNumber: "",
  whatsappMessage: "Halo, saya tertarik untuk berkolaborasi dengan Hysteria",
};

export const DEFAULT_HERO = {
  subHeadline: "Kami membuka ruang kolaborasi bagi individu, komunitas, dan institusi.",
  notes: "Kolaborasi bagi kami bukan sekadar kerja sama, melainkan proses saling belajar.",
};

export const DEFAULT_REASON_ITEM = {
  title: "Pendekatan Kolaboratif yang Setara",
  subTitle: "Hysteria bekerja dengan prinsip kerja bersama.",
  imageUrl: "",
};

export const DEFAULT_SCHEME_ITEM = {
  title: "Kolaborasi Program dan Event",
  subTitle: "",
  imageUrl: "",
};

export const DEFAULT_FLOW_ITEM = {
  title: "1. Pengajuan ide/proposal",
  subTitle: "Mitra mengajukan ide atau bentuk kolaborasi.",
  imageUrl: "",
};

export function moveItem(list, from, to) {
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
