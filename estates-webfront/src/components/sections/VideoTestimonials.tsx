"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlay, 
  FiX, 
  FiZap, 
  FiStar, 
  FiCheckCircle, 
  FiMapPin, 
  FiTrendingUp,
  FiVolume2
} from "react-icons/fi";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  propertyType: string;
  stat: string;
  statLabel: string;
  quote: string;
  rating: number;
  thumbnail: string;
  videoUrl: string;
  duration: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Vikram & Ananya R.",
    role: "Luxury Villa Buyers",
    location: "Whitefield, Bengaluru",
    propertyType: "4 BHK Independent Villa",
    stat: "₹2.8 Cr",
    statLabel: "Property Booked",
    quote: "OD Creations made our site visit seamless with free cab pickup. We inspected 5 villas and finalized our dream home in just 10 days with complete legal peace of mind!",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-41564-large.mp4",
    duration: "1:45 min",
  },
  {
    id: "testimonial-2",
    name: "Dr. Rajesh & Priya Nair",
    role: "NRI Real Estate Investors",
    location: "Dubai & Mumbai",
    propertyType: "3 BHK High-Rise Apartment",
    stat: "11.4%",
    statLabel: "Annual Rental Yield",
    quote: "As NRIs in Dubai, managing property purchase remotely felt daunting. OD Creations provided live video walkthroughs, full RERA legal audits, and placed tenants immediately.",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-modern-skyscrapers-in-a-city-41484-large.mp4",
    duration: "2:10 min",
  },
  {
    id: "testimonial-3",
    name: "Siddharth & Meera K.",
    role: "First-Time Homeowners",
    location: "HSR Layout, Bengaluru",
    propertyType: "3 BHK Premium Gated Flat",
    stat: "₹3.5 Lakhs",
    statLabel: "Saved in Brokerage",
    quote: "0% brokerage fees and absolute transparency! Their dedicated advisor arranged our HDFC home loan approval within 48 hours. Best experience ever.",
    rating: 5,
    thumbnail: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sun-shining-through-the-windows-of-a-living-room-41561-large.mp4",
    duration: "1:30 min",
  },
];

export default function VideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<Testimonial | null>(null);

  return (
    <section className="w-full bg-[#FAF9FF] py-16 md:py-24 px-4 sm:px-6 md:px-12 select-none border-t border-purple-100/80 text-left">
      <div className="max-w-[1380px] mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>Real Customer Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight leading-tight">
              Hear directly from our happy buyers & investors
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md font-normal leading-relaxed">
            Watch verified video reviews from real home buyers and NRI investors who found their ideal properties through OD Creations.
          </p>
        </div>

        {/* 3 Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-purple-100/80 rounded-[28px] overflow-hidden shadow-md hover:shadow-2xl hover:border-purple-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => setActiveVideo(t)}
            >
              <div>
                {/* Video Thumbnail Container with Play Overlay */}
                <div className="relative w-full h-[220px] sm:h-[250px] bg-neutral-900 overflow-hidden">
                  <Image
                    src={t.thumbnail}
                    alt={t.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/90 via-[#18181B]/30 to-transparent" />

                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-[#18181B]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1.5">
                    <FiVolume2 className="w-3 h-3 text-amber-400" />
                    <span>{t.duration}</span>
                  </div>

                  {/* Property Location Tag */}
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-[#111827] flex items-center gap-1 shadow-xs">
                    <FiMapPin className="w-3 h-3 text-[#7C3AED]" />
                    <span>{t.location}</span>
                  </div>

                  {/* Prominent Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-16 h-16 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#6D28D9] transition-all duration-300 ring-4 ring-white/30">
                      <FiPlay className="w-7 h-7 ml-1 fill-white" />
                    </div>
                  </div>

                  {/* Bottom Highlight Stat overlay */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white">
                    <div>
                      <span className="text-[10px] text-neutral-300 font-extrabold uppercase tracking-wider block">{t.statLabel}</span>
                      <span className="text-xl font-extrabold text-amber-300 tracking-tight">{t.stat}</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#EAE4FF] text-[#7C3AED] px-2.5 py-1 rounded-full">
                      {t.propertyType}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xs sm:text-sm text-[#111827] font-semibold leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                </div>
              </div>

              {/* Author Footer */}
              <div className="px-6 pb-6 pt-0 border-t border-purple-100/60 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#EAE4FF] text-[#7C3AED] font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#111827] leading-tight flex items-center gap-1">
                      {t.name}
                      <FiCheckCircle className="w-3 h-3 text-[#7C3AED] fill-[#7C3AED]/10" />
                    </span>
                    <span className="text-[10px] text-[#64748B] font-normal">{t.role}</span>
                  </div>
                </div>

                <button className="pt-4 text-xs font-extrabold text-[#7C3AED] group-hover:underline flex items-center gap-1">
                  <span>Watch Story</span>
                  <FiPlay className="w-3 h-3 fill-current" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Fullscreen Video Modal Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-neutral-900 border border-purple-300/30 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-[#18181B] border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center font-extrabold text-sm">
                    {activeVideo.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight flex items-center gap-1.5">
                      <span>{activeVideo.name}</span>
                      <span className="text-[10px] font-extrabold bg-[#7C3AED] text-white px-2 py-0.5 rounded-full uppercase">Verified Buyer</span>
                    </h3>
                    <p className="text-xs text-neutral-400">{activeVideo.role} • {activeVideo.location}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Modal Footer Description */}
              <div className="p-4 sm:p-6 bg-[#18181B] text-neutral-300 text-xs sm:text-sm font-normal leading-relaxed border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="max-w-xl">
                  "{activeVideo.quote}"
                </p>
                <div className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-xl flex-shrink-0">
                  <FiTrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">{activeVideo.statLabel}: <span className="text-amber-400">{activeVideo.stat}</span></span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
