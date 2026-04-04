import * as visiMisiRepository from "../repositories/visiMisi.repository.js";
import * as sejarahRepository from "../repositories/sejarah.repository.js";
import * as panduanRepository from "../repositories/panduanVisual.repository.js";

const PAGE_SLUG = "tentang";

export async function getPublicTentangVisiMisi() {
  return visiMisiRepository.findTentangVisiMisiBySlug(PAGE_SLUG);
}

export async function getPublicSejarahItems() {
  return sejarahRepository.findSejarahItems({ isActive: true });
}

export async function getPublicPanduanVisualItems() {
  return panduanRepository.findPanduanVisualItems({ isActive: true });
}
