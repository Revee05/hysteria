"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import HeroManagement from "./_component/HeroManagement.jsx";
import PlatformKami from "./_component/PlatformKami.jsx";

const TAB_HERO = 0;
const TAB_PLATFORM = 1;

export default function PageHome() {
  const [activeTab, setActiveTab] = useState(TAB_HERO);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Home Section</h1>
        <p className="mt-1 text-xs text-zinc-600 sm:text-sm">Kelola Hero Management dan Platform Kami dari satu tempat.</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="dashboard section tabs"
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
            label="Hero Management"
            id="tab-dashboard-hero"
            aria-controls="tabpanel-dashboard-hero"
            sx={{ minWidth: "auto" }}
          />
          <Tab
            label="Platform Kami"
            id="tab-dashboard-platform"
            aria-controls="tabpanel-dashboard-platform"
            sx={{ minWidth: "auto" }}
          />
        </Tabs>
      </Box>

      <div
        role="tabpanel"
        hidden={activeTab !== TAB_HERO}
        id="tabpanel-dashboard-hero"
        aria-labelledby="tab-dashboard-hero">
        {activeTab === TAB_HERO && <HeroManagement />}
      </div>

      <div
        role="tabpanel"
        hidden={activeTab !== TAB_PLATFORM}
        id="tabpanel-dashboard-platform"
        aria-labelledby="tab-dashboard-platform">
        {activeTab === TAB_PLATFORM && <PlatformKami />}
      </div>
    </div>
  );
}
