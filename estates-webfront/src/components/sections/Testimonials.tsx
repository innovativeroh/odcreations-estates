"use client";

import Image from "next/image";
import { useRef } from "react";

const testimonials = [
  {
    id: 1,
    name: "Sophia M.",
    role: "First-time Investor",
    quote: "BricksWall made property investment simple and stress-free. Their team guided me through every step, from research to purchase, ensuring I made the right choice. I've already seen great returns on my first investment!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    isPhotoCard: false
  },
  {
    id: 2,
    name: "James R",
    role: "Long-term Client",
    quote: "",
    avatar: "/james-r.png",
    photoBg: "/james-r.png",
    isPhotoCard: true
  },
  {
    id: 3,
    name: "Arjun K.",
    role: "Young Professional",
    quote: "I was hesitant about getting into property investment, but BricksWall made the entire process seamless. Their expertise and market insights gave me the confidence I needed to take the leap.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isPhotoCard: false
  },
  {
    id: 4,
    name: "Linda H",
    role: "Entrepreneur",
    quote: "BricksWall isn't just about property deals—they help you build a strategy for long-term wealth. Thanks to their guidance, I've diversified my portfolio and secured passive income streams.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    isPhotoCard: false
  },
  {
    id: 5,
    name: "Michael S.",
    role: "Experienced Investor",
    quote: "Working with BricksWall has been one of my best financial decisions. Their attention to detail, deep market knowledge, and transparent approach set them apart from any other investment platform.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isPhotoCard: false
  }
];

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full bg-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[#ff5a36] font-semibold text-sm mb-4 block tracking-wide">- Trusted by investors</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
              Confidence, echoed by<br />investors
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-white border border-neutral-200 rounded-full text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 border-l border-neutral-200 pl-4">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm text-neutral-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm text-neutral-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Row */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t) => {
            if (t.isPhotoCard) {
              return (
                <div 
                  key={t.id}
                  className="w-[320px] md:w-[360px] h-[400px] flex-shrink-0 snap-start relative rounded-[32px] overflow-hidden group shadow-md"
                >
                  {/* Background Photo */}
                  <Image 
                    src={t.photoBg || ""} 
                    alt={t.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Content inside photo card */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-md">
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{t.name}</h4>
                      <span className="text-sm text-neutral-300 font-medium">{t.role}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={t.id}
                className="w-[320px] md:w-[360px] h-[400px] flex-shrink-0 snap-start bg-white rounded-[32px] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
              >
                <div>
                  {/* Profile Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-8 border border-neutral-100">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Quote */}
                  <p className="text-neutral-700 text-sm md:text-base leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                
                {/* Author Info */}
                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-0.5">{t.name}</h4>
                  <span className="text-sm text-neutral-400 font-medium">{t.role}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
