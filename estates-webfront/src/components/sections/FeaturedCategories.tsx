"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FiTruck, 
  FiFileText, 
  FiLayout, 
  FiCamera, 
  FiGlobe, 
  FiArrowUpRight,
  FiStar,
  FiZap
} from "react-icons/fi";
import { FaPaintRoller } from "react-icons/fa6";

const SERVICES = [
  {
    id: "packers-movers",
    title: "Packers & Movers",
    subtitle: "Safe, insured & hassle-free home relocation",
    badge: "New Offers",
    badgeType: "accent",
    icon: FiTruck,
    href: "/contact?service=packers-movers"
  },
  {
    id: "rental-agreement",
    title: "Rental Agreement",
    subtitle: "Digital legal agreement with instant e-stamping",
    badge: "Instant E-Stamp",
    badgeType: "dark",
    icon: FiFileText,
    href: "/contact?service=rental-agreement"
  },
  {
    id: "painting-cleaning",
    title: "Painting & Cleaning",
    subtitle: "Professional deep home cleaning & fresh wall paint",
    badge: "Top Rated",
    badgeType: "dark",
    icon: FaPaintRoller,
    href: "/contact?service=painting-cleaning"
  },
  {
    id: "interior-designers",
    title: "Interior Designers",
    subtitle: "Turnkey luxury interiors, modular kitchens & 3D space planning",
    badge: "Free 3D Consult",
    badgeType: "dark",
    icon: FiLayout,
    href: "/contact?service=interior-designers"
  },
  {
    id: "click-earn",
    title: "Click & Earn",
    subtitle: "Post neighborhood property photos & win rewards",
    badge: "New",
    badgeType: "accent",
    icon: FiCamera,
    href: "/contact?service=click-earn"
  },
  {
    id: "nri-services",
    title: "Estates for NRIs",
    subtitle: "Dedicated property management & remote rental management",
    badge: "NRI Special",
    badgeType: "dark",
    icon: FiGlobe,
    href: "/contact?service=nri-services"
  }
];

export default function FeaturedCategories() {
  return (
    <section className="w-full bg-[#F7F5FC] py-14 md:py-20 px-4 sm:px-6 md:px-12 select-none border-t border-purple-100/80">
      <div className="max-w-[1380px] mx-auto w-full">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>On-Demand Property Solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight">
              Essential Home Services
            </h2>
          </div>

          <Link 
            href="/contact?type=services" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <span>Explore All Services</span>
            <FiArrowUpRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES.map((service, idx) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  href={service.href}
                  className="bg-white border border-purple-100/80 rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
                >
                  {/* Top Row: Custom Icon + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors duration-300 shadow-xs">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Badge */}
                    <span 
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                        service.badgeType === "accent"
                          ? "bg-[#7C3AED] text-white"
                          : "bg-[#18181B] text-white"
                      }`}
                    >
                      <FiStar className="w-3 h-3 text-amber-300 fill-amber-300" />
                      {service.badge}
                    </span>
                  </div>

                  {/* Content: Title & Subtitle */}
                  <div className="flex flex-col text-left mb-6">
                    <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-2 leading-relaxed">
                      {service.subtitle}
                    </p>
                  </div>

                  {/* Footer Action Link */}
                  <div className="pt-4 border-t border-purple-100/80 flex items-center justify-between text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">
                    <span>Avail Service</span>
                    <div className="w-8 h-8 rounded-full bg-[#EAE4FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center transition-colors">
                      <FiArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
