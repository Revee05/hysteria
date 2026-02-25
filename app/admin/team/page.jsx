"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import HeroSettingsTab from "./_components/HeroSettingsTab";
import TeamManagementTab from "./_components/TeamManagementTab";

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-4 sm:p-6 bg-white border rounded-lg">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Team Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">Kelola hero halaman tim dan manajemen kategori/anggota tim.</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="team settings tabs"
          variant="scrollable"
          scrollButtons={true}
          allowScrollButtonsMobile={true}
          sx={{
            "& .MuiTabs-scrollButtons": { display: "flex !important" },
            "& .MuiTabs-scrollButtons svg": { color: "rgba(0,0,0,0.6)" },
            "& .MuiTab-root": { textTransform: "none" },
          }}
        >
          <Tab label="Hero Page Team" id="tab-team-hero" aria-controls="tabpanel-team-hero" sx={{ minWidth: "auto" }} />
          <Tab label="Team Management" id="tab-team-management" aria-controls="tabpanel-team-management" sx={{ minWidth: "auto" }} />
        </Tabs>
      </Box>

      <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-team-hero" aria-labelledby="tab-team-hero">
        {activeTab === 0 && <HeroSettingsTab />}
      </div>

      <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-team-management" aria-labelledby="tab-team-management">
        {activeTab === 1 && <TeamManagementTab />}
      </div>
    </div>
  );
}
