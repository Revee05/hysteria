"use client";

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";

export default function LayoutClient({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <main>{children}</main>
      <Footer />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
