"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import Image from "next/image";

export default function SejarahHysteria({ items = [] }) {
  const historyImages = Array.isArray(items) ? items : [];

  return (
    <div className="w-full px-4">
      {historyImages.length === 0 ? <div className="text-center text-sm text-zinc-500">Belum ada data sejarah.</div> : null}
      <Swiper
        slidesPerView={1.2}
        spaceBetween={20}
        freeMode={true}
        navigation={true}
        modules={[FreeMode, Navigation]}
        breakpoints={{
          640: {
            slidesPerView: 2.2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3.2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 2.95,
            spaceBetween: 40,
          },
        }}
        className="mySwiper w-full h-[600px]">
        {historyImages.map((item, index) => (
          <SwiperSlide
            key={item.id || index}
            className="relative group overflow-hidden rounded-xl bg-gray-200">
            <div className="relative h-full">
              <Image
                src={item.imageUrl || "/image/tim-hero.png"}
                alt={`Sejarah Hysteria ${index + 1}`}
                fill
                unoptimized={!(item.imageUrl || "").startsWith("/")}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
