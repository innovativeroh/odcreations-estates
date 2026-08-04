"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowRight, FiZap, FiMapPin } from "react-icons/fi";

const CITIES = [
  {
    id: "jaipur",
    name: "Jaipur",
    tagline: "The Pink City",
    listings: "1,200+ Properties",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    href: "/properties?city=Jaipur"
  },
  {
    name: "Bengaluru",
    id: "bengaluru",
    tagline: "Silicon Valley of India",
    listings: "4,500+ Properties",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    href: "/properties?city=Bengaluru"
  },
  {
    id: "delhi",
    name: "Delhi NCR",
    tagline: "Capital & Tech Hubs",
    listings: "3,800+ Properties",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    href: "/properties?city=Delhi"
  },
  {
    id: "mumbai",
    name: "Mumbai",
    tagline: "Financial Capital & Seafront",
    listings: "5,200+ Properties",
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    href: "/properties?city=Mumbai"
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    tagline: "Cyberabad & Heritage",
    listings: "2,900+ Properties",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80",
    href: "/properties?city=Hyderabad"
  }
];

export default function ExploreCities() {
  return (
    <section className="w-full bg-white py-14 md:py-20 px-4 sm:px-6 md:px-12 border-t border-neutral-200/80 select-none">
      <div className="max-w-[1380px] mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>Prime Locations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight">
              Explore Top Cities
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-2 max-w-md">
              Discover luxury residences, commercial hubs, and investment hotspots across India's top real estate markets
            </p>
          </div>

          <Link 
            href="/properties" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer flex-shrink-0"
          >
            <span>Explore All Cities</span>
            <FiArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CITIES.map((city, idx) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                href={city.href}
                className="bg-white border border-purple-100/80 rounded-[28px] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer relative h-[320px] sm:h-[360px]"
              >
                {/* Background Unsplash City Image */}
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/90 backdrop-blur-md text-[#111827] shadow-xs flex items-center gap-1.5">
                    <FiMapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                    {city.tagline}
                  </span>
                </div>

                {/* Bottom Content Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex items-end justify-between">
                  <div className="flex flex-col text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {city.name}
                    </h3>
                    <span className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
                      {city.listings}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-[#111827] group-hover:bg-[#7C3AED] group-hover:text-white text-xs font-extrabold transition-colors shadow-md flex-shrink-0">
                    <span>Explore</span>
                    <FiArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
