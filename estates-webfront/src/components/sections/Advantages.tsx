"use client";

import { motion } from "framer-motion";

const advantages = [
  {
    title: "Steady Returns",
    desc: "Earn passive income through rental yields & appreciation.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    )
  },
  {
    title: "Reliable Growth",
    desc: "Real estate often outperforms traditional asset classes.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/>
        <line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/>
        <polyline points="4,14 10,8 15,13 21,3"/>
      </svg>
    )
  },
  {
    title: "Clear Insights",
    desc: "Trends and performance reports right at your fingertips.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2v10l5.5 5.5"/>
      </svg>
    )
  },
  {
    title: "Expert Guidance",
    desc: "Our professionals support you through every stage.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    )
  },
  {
    title: "Long-Term Value",
    desc: "Invest in appreciating assets for generational wealth.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        <path d="M12 12v6M9 15l3-3 3 3"/>
      </svg>
    )
  }
];

export default function Advantages() {
  // We duplicate the array to allow seamless infinite scrolling
  const carouselItems = [...advantages, ...advantages];

  return (
    <section className="w-full bg-[#f8f9fa] pt-20 md:pt-28 pb-10 overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <span className="text-[#ff5a36] font-semibold text-sm mb-4 block tracking-wide">- Advantages of investments</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
            Invest Smarter. Gain the winning edge with Brickwise Today
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button className="px-6 py-2.5 bg-white border border-neutral-200 rounded-full text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
            Find the best deal
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="flex gap-2 hidden sm:flex">
            <button className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm text-neutral-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm text-neutral-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        {/* Left and Right Fade Masks for seamless loop appearance */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 pointer-events-none" />

        {/* Carousel Container */}
        <div className="flex overflow-hidden pb-8 pt-4">
          <motion.div
            className="flex gap-6 pl-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 35, // Adjust duration for scrolling speed
            }}
          >
            {carouselItems.map((adv, idx) => (
              <div
                key={idx}
                className="w-[300px] flex-shrink-0 bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mb-10 shadow-md">
                  {adv.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{adv.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {adv.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
