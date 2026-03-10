"use client";

import { useState, useMemo } from "react";
import PosterCard from "./cards/PosterCard";
import MockUpPosterCard from "./cards/MockUpPosterCard";
import Tooltip from '@mui/material/Tooltip';
import SortMenu from "@/components/ui/SortMenu";
import Pagination from "@/components/ui/Pagination";

/**
 * GridBody — layout "grid"
 *
 * Renders:
 *  - Search input
 *  - Filter tag buttons (optional)
 *  - Responsive card grid (Tailwind-based cards)
 *  - Pagination
 *
 * Props:
 *   items   : Array<{ src, alt?, title, subtitle?, tag? }>
 *   filters : string[]  (unique tag labels for filtering)
 */

const DUMMY_FILTERS = ["Having Fun Artlab", "Peltoe", "test1", "test2", "test3"];

const DUMMY_ITEMS = [
  { src: "/image/DummyPoster.webp", title: "AI SUNRISE WALK MERAPI", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "NIGHT MARKET SEMARANG", tag: "Having Fun Artlab", badge: "Akan Berlangsung", meta: "Sabtu, 14 Maret 2026" },
  { src: "/image/DummyPoster.webp", title: "BATIK WORKSHOP PELTOE", tag: "Peltoe", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "PRINTMAKING DASAR", tag: "Peltoe", badge: "Sedang Berlangsung", meta: "Sabtu, 7 Maret 2026" },
  { src: "/image/DummyPoster.webp", title: "ZINE MAKING 101", tag: "Having Fun Artlab", badge: "Telah Berakhir", meta: "Sabtu, 28 Feb 2026" },
  { src: "/image/DummyPoster.webp", title: "URBAN SKETCHING SESSION", tag: "test1", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "MURAL & STREET ART", tag: "test2", badge: "Akan Berlangsung", meta: "Sabtu, 21 Maret 2026" },
  { src: "/image/DummyPoster.webp", title: "FOTO JALANAN", tag: "test2", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "KOLASE & MIXED MEDIA", tag: "Peltoe", badge: "Telah Berakhir", meta: "Sabtu, 22 Feb 2026" },
  { src: "/image/DummyPoster.webp", title: "DESAIN POSTER ANALOG", tag: "test3", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "LINOCUT PRINTING", tag: "test3", badge: "Akan Berlangsung", meta: "Sabtu, 28 Maret 2026" },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
  { src: "/image/DummyPoster.webp", title: "BOOKBINDING WORKSHOP", tag: "Having Fun Artlab", badge: null, meta: null },
];

const DEFAULT_ITEMS_PER_PAGE = 10; // default: 5 kolom × 2 baris

export default function GridBody({ items = [], filters = [] }) {
  const resolvedItems = items.length > 0 ? items : DUMMY_ITEMS;
  const resolvedFilters = filters.length > 0 ? filters : DUMMY_FILTERS;
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showFilters, setShowFilters] = useState(true);
  const [sortMode, setSortMode] = useState("terbaru");
  const [page, setPage] = useState(1);

  const toggleFilters = () => setShowFilters((s) => !s);

  /* ---------- filtering + search ---------- */
  const parseMetaDate = (meta) => {
    if (!meta) return null;
    if (meta instanceof Date) return meta.getTime();
    // try native parse first
    const native = Date.parse(meta);
    if (!Number.isNaN(native)) return native;
    // try to parse Indonesian-ish format like "Sabtu, 14 Maret 2026" or "14 Maret 2026"
    const months = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    };
    const m = String(meta).match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
    if (m) {
      const day = parseInt(m[1], 10);
      const monName = m[2];
      const year = parseInt(m[3], 10);
      const month = months[monName];
      if (typeof month === "number") return new Date(year, month, day).getTime();
    }
    return null;
  };
  const filteredItems = useMemo(() => {
    let result = resolvedItems;

    // Filter by tag
    if (activeFilter !== "Semua") {
      result = result.filter((item) => item.tag === activeFilter);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.subtitle || "").toLowerCase().includes(q) ||
          (item.tag || "").toLowerCase().includes(q)
      );
    }

    // Apply sorting
    const sorted = [...result];
    const getTs = (it) => parseMetaDate(it.meta);

    if (sortMode === "terbaru") {
      sorted.sort((a, b) => {
        const ta = getTs(a);
        const tb = getTs(b);
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;
        return tb - ta;
      });
    } else if (sortMode === "terlama") {
      sorted.sort((a, b) => {
        const ta = getTs(a);
        const tb = getTs(b);
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;
        return ta - tb;
      });
    } else if (sortMode === "a-z") {
      sorted.sort((a, b) => ("" + (a.title || "")).localeCompare("" + (b.title || "")));
    } else if (sortMode === "z-a") {
      sorted.sort((a, b) => ("" + (b.title || "")).localeCompare("" + (a.title || "")));
    }

    return sorted;
  }, [resolvedItems, activeFilter, search, sortMode]);

  /* ---------- pagination ---------- */
  const isMockupLayout = resolvedItems.some((item) => item.meta === "mockup");
  const itemsPerPage = isMockupLayout ? 8 : DEFAULT_ITEMS_PER_PAGE;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when filter/search changes
  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setPage(1);
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  

  const allFilters = ["Semua", ...resolvedFilters];
 

  

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-24 py-10">
      {/* Search bar */}
      <div className="flex justify-center items-center gap-3 mb-6">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-5 pr-12 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
          {/* Search icon */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        </div>

        {/* Action icons filter tag (hidden for mockup layout) */}
        {!isMockupLayout && (
          <Tooltip title="Filter Tag" arrow>
            <button
              className="flex-none w-10 h-10 border border-zinc-300 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:bg-pink-50 transition cursor-pointer"
              aria-label="Toggle filter tags"
              aria-expanded={showFilters}
              aria-controls="filter-tags"
              onClick={toggleFilters}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </Tooltip>
        )}
        {/* shared sort menu component (icon-only control) */}
        <SortMenu
          value={sortMode}
          onChange={(m) => {
            setSortMode(m);
            setPage(1);
          }}
          className="flex-none"
        />
      </div>

      {/* Filter (hidden for mockup layout) */}
      {resolvedFilters.length > 0 && !isMockupLayout && (
        <div id="filter-tags" className={`${showFilters ? "block" : "hidden"} flex flex-wrap gap-2 justify-center mb-8`}>
          {allFilters.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow cursor-pointer"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Grid — Tailwind-based cards */}
      {paginatedItems.length > 0 ? (
        <div className={`grid gap-5 ${ isMockupLayout ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-5' }`}>
          {paginatedItems.map((item, i) =>
            item.meta === "mockup" ? (
              <MockUpPosterCard
                key={i}
                imageUrl={item.imageUrl}
                alt={item.alt}
                year={item.year}
                title={item.title}
                prevdescription={item.prevdescription}
                href={item.href || item.url}
                buttonLabel={item.buttonLabel}
              />
            ) : (
              <PosterCard
                key={i}
                imageUrl={item.imageUrl || item.src}
                alt={item.alt}
                title={item.title}
                description={item.description}
                tags={item.tags}
                meta={item.year}
              />
            )
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-400">
          <p>Tidak ada item yang ditemukan.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination className="mt-5 gap-2" totalPages={totalPages} currentPage={page} onPageChange={setPage} jumpStep={5} maxVisible={15} />
    </div>
  );
}
