"use client";

import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import TimHero from "./_components/TimHero";
import ProfileCard from "./_components/ProfileCard";
import ProfileSlider from "./_components/ProfileSlider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

export default function TimPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team", { method: "GET" });
        const json = await res.json().catch(() => null);
        if (!isMounted) return;
        if (json?.success) {
          const list = Array.isArray(json.data?.categories) ? json.data.categories : [];
          setCategories(list);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  const orderedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories]);

  const primaryCategory = orderedCategories[0];
  const sliderCategories = orderedCategories.slice(1);

  return (
    <main className={`${poppins.variable} font-sans bg-white min-h-screen pb-32`}>
      <TimHero />

      {/* Section 1: Pengelola Hysteria (Grid) */}
      <section className="py-20 relative px-4 md:px-0">
        <div className="max-w-[1400px] mx-auto mt-12 md:mt-24">
          <h2 className="text-center font-bold text-[32px] md:text-[40px] leading-[1.5] mb-16 text-black font-poppins">{primaryCategory?.name || "Pengelola Hysteria"}</h2>

          {loading && !primaryCategory ? (
            <div className="text-center text-sm text-zinc-500">Memuat data tim...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-[35px] gap-y-16 justify-items-center">
              {(primaryCategory?.members || []).map((member) => (
                <ProfileCard
                  key={member.id}
                  name={member.name}
                  role={member.role}
                  imageUrl={member.imageUrl}
                  email={member.email}
                  instagram={member.instagram}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {sliderCategories.map((category) => (
        <ProfileSlider
          key={category.id}
          title={category.name}
          profiles={(category.members || []).map((member) => ({
            name: member.name,
            role: member.role,
            imageUrl: member.imageUrl,
            email: member.email,
            instagram: member.instagram,
          }))}
        />
      ))}
    </main>
  );
}
