import React from 'react'

export default function MediaSection({ mediaURL }) {
  return (
    <section className=" sm:py-12 md:py-16 lg:py-20 text-black">
      {/* Container: responsive max-width and padding for small/medium/large screens */}
      <div className="mx-auto w-full max-w-[1100px] sm:max-w-[1200px] md:max-w-[1400px] lg:max-w-[1920px] px-4 sm:px-6 md:px-8">
        {/* Center the player and limit its width on large viewports */}
        <div className="mx-auto w-full max-w-4xl">
          {/* Aspect-ratio wrapper (16:9). Change paddingTop to alter ratio. */}
          <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute left-0 top-0 w-full h-full"
              src={mediaURL}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
