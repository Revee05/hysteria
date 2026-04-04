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
      <div className="mx-auto max-w-7xl overflow-hidden px-[20px] -mx-[20px]">
        <Swiper
          style={{ "--swiper-navigation-color": "#ff93c9" }}
          slidesPerView={1.1}
          spaceBetween={20}
          freeMode={true}
          navigation={true}
          modules={[FreeMode, Navigation]}
          breakpoints={{
            320: {
              slidesPerView: 1.1,
              spaceBetween: 10,
              navigation: false,
            },
            420: {
              slidesPerView: 1.6,
              spaceBetween: 10,
              navigation: false,
            },
            520: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 1.8,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 2.1,
              spaceBetween: 40,
            },
            1280: {
              slidesPerView: 2.6,
              spaceBetween: 40,
            },
          }}
          className="mySwiper !overflow-visible w-full h-[350px] sm:h-[400px] md:h-[550px] lg:h-[650px]">
          {historyImages.map((item, index) => (
            <SwiperSlide
              key={item.id || index}
              className="py-[20px] relative group overflow-visible">
              <div className="relative h-full overflow-hidden rounded-4xl bg-white shadow-[0px_0px_15px_rgba(0,0,0,0.15)] md:shadow-[0px_0px_15px_rgba(0,0,0,0.25)]">
                <div className="relative h-full">
                  <Image
                    src={item.imageUrl || "/image/tim-hero.png"}
                    alt={`Sejarah Hysteria ${index + 1}`}
                    fill
                    unoptimized={!(item.imageUrl || "").startsWith("/")}
                    className="object-fill transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
    //             />
    //           </div>
    //         </SwiperSlide>
    //       ))}
    //     </Swiper>
    //     {/* </div> */}
    //   </div>
  );
}
