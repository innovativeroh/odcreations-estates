"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FiMapPin, 
  FiMaximize2, 
  FiArrowUpRight, 
  FiArrowRight,
  FiZap 
} from "react-icons/fi";
import { BiBed, BiBath } from "react-icons/bi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface PropertyItem {
  _id: string;
  title: string;
  city: string;
  state: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  images: string[];
  transactionType: string;
}

const SAMPLE_PROPERTIES: PropertyItem[] = [
  {
    _id: "p1",
    title: "Opera Ananda Luxury Villa",
    city: "Bengaluru",
    state: "Karnataka",
    size: 2800,
    bedrooms: 4,
    bathrooms: 4,
    price: 24000000,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"],
    transactionType: "For Sale"
  },
  {
    _id: "p2",
    title: "Empire State Seafront Apartment",
    city: "Mumbai",
    state: "Maharashtra",
    size: 3200,
    bedrooms: 3,
    bathrooms: 4,
    price: 48000000,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"],
    transactionType: "For Sale"
  },
  {
    _id: "p3",
    title: "Skyline Royal Penthouse",
    city: "Gurgaon",
    state: "Delhi NCR",
    size: 2500,
    bedrooms: 3,
    bathrooms: 3,
    price: 31000000,
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"],
    transactionType: "For Sale"
  },
  {
    _id: "p4",
    title: "Vinay Heights Modern Residence",
    city: "Jaipur",
    state: "Rajasthan",
    size: 1450,
    bedrooms: 3,
    bathrooms: 2,
    price: 8500000,
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"],
    transactionType: "For Sale"
  },
  {
    _id: "p5",
    title: "Azure Seafront Villa",
    city: "Panjim",
    state: "Goa",
    size: 1900,
    bedrooms: 3,
    bathrooms: 3,
    price: 19500000,
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80"],
    transactionType: "For Sale"
  },
  {
    _id: "p6",
    title: "Gachibowli Tech Towers",
    city: "Hyderabad",
    state: "Telangana",
    size: 1650,
    bedrooms: 2,
    bathrooms: 2,
    price: 14000000,
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80"],
    transactionType: "For Sale"
  }
];

function formatPrice(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyItem[]>(SAMPLE_PROPERTIES);

  useEffect(() => {
    fetch(`${API_BASE}/api/properties?limit=12`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.properties?.length) setProperties(d.properties);
      })
      .catch(() => {});
  }, []);

  // Triple array for seamless infinite marquee loop
  const loopedProperties = [...properties, ...properties, ...properties];

  return (
    <section className="w-full bg-[#F4F0FE] py-14 md:py-20 overflow-hidden border-t border-purple-100/80 select-none">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-12 mb-8 md:mb-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>Verified Listings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight">
              Featured Properties
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-2 max-w-md">
              Discover high-returning investment & luxury residential properties across prime Indian cities
            </p>
          </div>

          <Link 
            href="/properties" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer flex-shrink-0"
          >
            <span>View All Properties</span>
            <FiArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

      </div>

      {/* Infinite Marquee Strip with Side Fade Gradient Masks */}
      <div className="w-full relative">
        {/* Edge Fade Masks matching the #F4F0FE background */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-36 bg-gradient-to-r from-[#F4F0FE] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-36 bg-gradient-to-l from-[#F4F0FE] to-transparent z-20 pointer-events-none" />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-properties {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-33.3333%, 0, 0); }
          }
          .animate-marquee-properties {
            display: flex;
            gap: 28px;
            width: max-content;
            animation: marquee-properties 45s linear infinite;
          }
          .animate-marquee-properties:hover { animation-play-state: paused; }
        ` }} />

        <div className="overflow-hidden py-4">
          <div className="animate-marquee-properties px-4">
            {loopedProperties.map((property, idx) => (
              <Link
                key={`${property._id}-${idx}`}
                href={`/properties/${property._id}`}
                className="w-[310px] sm:w-[360px] flex-shrink-0 bg-white border border-purple-100/80 rounded-[28px] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Property Image Container */}
                  <div className="relative w-full h-[220px] sm:h-[240px] rounded-[22px] overflow-hidden mb-4 bg-neutral-100 border border-purple-100/60">
                    {property.images[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200" />
                    )}

                    {/* Transaction Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#18181B] text-white shadow-xs">
                        {property.transactionType || "For Sale"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium my-2">
                    <FiMapPin className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                    <span>{property.city}, {property.state}</span>
                  </div>

                  {/* Property Specs Row */}
                  <div className="flex items-center gap-4 text-xs text-[#64748B] font-semibold my-3 pt-3 border-t border-purple-100/80">
                    <span className="flex items-center gap-1">
                      <FiMaximize2 className="w-3.5 h-3.5 text-neutral-400" />
                      {property.size.toLocaleString("en-IN")} sq.ft
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span className="flex items-center gap-1">
                      <BiBed className="w-4 h-4 text-neutral-400" />
                      {property.bedrooms} Bed
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span className="flex items-center gap-1">
                      <BiBath className="w-4 h-4 text-neutral-400" />
                      {property.bathrooms} Bath
                    </span>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100/80">
                  <span className="text-lg sm:text-xl font-extrabold text-[#111827]">
                    {formatPrice(property.price)}
                  </span>

                  <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#EAE4FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white text-xs font-extrabold transition-colors">
                    <span>View Details</span>
                    <FiArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
