"use client";

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";

export default function LayoutClient({ children, websiteInfo }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        websiteInfo={websiteInfo}
      />
      <main>{children}</main>
      <Footer websiteInfo={websiteInfo} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
