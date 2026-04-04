"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import HeroSettingsTab from "./_components/HeroSettingsTab";
import VisiMisiTab from "./_components/VisiMisiTab";
import SejarahTab from "./_components/SejarahTab";
import PanduanVisualTab from "./_components/PanduanVisualTab";

export default function TentangSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-4 sm:p-6 bg-white border rounded-lg">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Tentang Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">Kelola hero, visi & misi, sejarah hysteria, dan panduan visual.</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="tentang settings tabs"
          variant="scrollable"
          scrollButtons={true}
          allowScrollButtonsMobile={true}
          sx={{
            "& .MuiTabs-scrollButtons": { display: "flex !important" },
            "& .MuiTabs-scrollButtons svg": { color: "rgba(0,0,0,0.6)" },
            "& .MuiTab-root": { textTransform: "none" },
            "& .MuiTab-root.Mui-selected": { color: "#db2777" },
            "& .MuiTabs-indicator": { backgroundColor: "#db2777" },
          }}>
          <Tab
            label="Hero Page Tentang"
            id="tab-tentang-hero"
            aria-controls="tabpanel-tentang-hero"
            sx={{ minWidth: "auto" }}
          />
          <Tab
            label="Visi & Misi"
            id="tab-tentang-visi-misi"
            aria-controls="tabpanel-tentang-visi-misi"
            sx={{ minWidth: "auto" }}
          />
          <Tab
            label="Sejarah Hysteria"
            id="tab-tentang-sejarah"
            aria-controls="tabpanel-tentang-sejarah"
            sx={{ minWidth: "auto" }}
          />
          <Tab
            label="Panduan Visual"
            id="tab-tentang-panduan"
            aria-controls="tabpanel-tentang-panduan"
            sx={{ minWidth: "auto" }}
          />
        </Tabs>
      </Box>

      <div
        role="tabpanel"
        hidden={activeTab !== 0}
        id="tabpanel-tentang-hero"
        aria-labelledby="tab-tentang-hero">
        {activeTab === 0 && <HeroSettingsTab />}
      </div>

      <div
        role="tabpanel"
        hidden={activeTab !== 1}
        id="tabpanel-tentang-visi-misi"
        aria-labelledby="tab-tentang-visi-misi">
        {activeTab === 1 && <VisiMisiTab />}
      </div>

      <div
        role="tabpanel"
        hidden={activeTab !== 2}
        id="tabpanel-tentang-sejarah"
        aria-labelledby="tab-tentang-sejarah">
        {activeTab === 2 && <SejarahTab />}
      </div>

      <div
        role="tabpanel"
        hidden={activeTab !== 3}
        id="tabpanel-tentang-panduan"
        aria-labelledby="tab-tentang-panduan">
        {activeTab === 3 && <PanduanVisualTab />}
      </div>
    </div>
  );
}
