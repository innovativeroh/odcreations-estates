"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  FiZap, 
  FiArrowRight, 
  FiArrowUpRight, 
  FiMapPin, 
  FiAward, 
  FiTrendingUp, 
  FiUsers, 
  FiCheckCircle 
} from "react-icons/fi";

const MOCK_ADS = [
  {
    id: "ad-1",
    tag: "Sponsored • Pre-Launch Project",
    title: "DLF Sky Villas & Luxury Penthouses",
    location: "Golf Course Extension Road, Gurgaon",
    highlights: "4 & 5 BHK Ultra-Luxury Residences with Private Elevators, Heated Pool & Sky Club",
    offer: "Pre-Launch Privilege: Save up to ₹25 Lakhs on Spot Booking",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Book Exclusive Site Visit",
    buttonHref: "/contact?type=advertiser-dlf-skyvillas"
  },
  {
    id: "ad-2",
    tag: "Sponsored • Developer Special Offer",
    title: "Godrej Woodsville Smart Township",
    location: "Whitefield, Bengaluru & Hinjewadi, Pune",
    highlights: "2 & 3 BHK Smart Homes with 50+ Modern Lifestyle Amenities & 80% Open Green Space",
    offer: "Flexible 10:90 Payment Plan & Home Loan Subsidy @ 6.99% Interest",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Download Brochure & Rates",
    buttonHref: "/contact?type=advertiser-godrej-woodsville"
  }
];

const ADVERTISE_BENEFITS = [
  {
    icon: FiUsers,
    title: "100K+ Active Buyers & NRIs",
    description: "Reach verified high-intent property buyers and real estate investors monthly."
  },
  {
    icon: FiTrendingUp,
    title: "Top Search Visibility",
    description: "Featured banner placement across high-traffic city & category pages."
  },
  {
    icon: FiCheckCircle,
    title: "Verified Qualified Leads",
    description: "Direct real-time lead delivery integrated directly into your builder CRM."
  }
];

export default function AdvertiseWithUs() {
  return (
    <section className="w-full bg-[#F4F0FE] py-14 md:py-20 px-4 sm:px-6 md:px-12 border-t border-purple-100/80 select-none">
      <div className="max-w-[1380px] mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="flex flex-col text-left max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>Partner & Media Solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight">
              Advertise With Us
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-2 leading-relaxed">
              Showcase your residential townships, luxury builder projects, and home brands directly to verified buyers & investors across India.
            </p>
          </div>

          <Link 
            href="/contact?type=advertise" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer flex-shrink-0"
          >
            <span>Become a Media Partner</span>
            <FiArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {/* Value Proposition Benefits Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {ADVERTISE_BENEFITS.map((benefit, idx) => {
            const IconComponent = benefit.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-purple-100/80 rounded-[24px] p-5 flex items-start gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-base font-bold text-[#111827]">{benefit.title}</h3>
                  <p className="text-xs text-[#64748B] font-normal mt-1 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TWO FEATURED ADVERTISEMENT CARDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {MOCK_ADS.map((ad, idx) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-purple-100/80 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:border-purple-200 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div className="relative w-full h-[240px] sm:h-[280px] bg-neutral-200">
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Tag Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#18181B] text-white shadow-xs flex items-center gap-1.5">
                      <FiAward className="w-3.5 h-3.5 text-amber-400" />
                      {ad.tag}
                    </span>
                  </div>

                  {/* Image Overlay Title & Location */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      {ad.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium mt-1">
                      <FiMapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{ad.location}</span>
                    </div>
                  </div>
                </div>

                {/* Ad Content Info */}
                <div className="p-6 text-left">
                  <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed mb-4">
                    {ad.highlights}
                  </p>

                  {/* Special Offer Box */}
                  <div className="bg-[#FAF8FF] border border-purple-200/80 rounded-2xl p-3.5 mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse flex-shrink-0" />
                    <span className="text-xs font-bold text-[#111827]">
                      {ad.offer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="px-6 pb-6 pt-0 text-left">
                <Link
                  href={ad.buttonHref}
                  className="w-full inline-flex items-center justify-between px-6 py-3.5 rounded-2xl bg-[#18181B] hover:bg-[#7C3AED] text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer group/btn"
                >
                  <span>{ad.buttonText}</span>
                  <FiArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
