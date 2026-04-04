export function getOrganizerDisplay(organizers = []) {
  let hysteriaShown = false;

  return organizers
    .map((org) => {
      const item = org.categoryItem;
      if (!item) return null;

      // =========================
      // PROGRAM (categoryId = 1)
      // =========================
      if (item.categoryId === 1) {
        if (hysteriaShown) return null;
        hysteriaShown = true;

        return {
          key: "hysteria",
          label: "Hysteria",
          href: "/program",
        };
      }

      // =========================
      // PLATFORM (categoryId = 2)
      // =========================
      if (item.categoryId === 2) {
        let root = item;

        // naik ke parent paling atas
        while (root.parent) {
          root = root.parent;
        }

        return {
          key: org.id,
          label: root.title,
          href: `/platform/${root.slug}`,
        };
      }

      return null;
    })
    .filter(Boolean);
}