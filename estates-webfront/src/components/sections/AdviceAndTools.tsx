"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FiCompass, 
  FiTrendingUp, 
  FiArrowRight, 
  FiChevronRight,
  FiZap
} from "react-icons/fi";
import { BsCalculator } from "react-icons/bs";
import { TbCurrencyRupee } from "react-icons/tb";

const ADVICE_TOOLS = [
  {
    id: "emi-calculator",
    title: "EMI Calculator",
    description: "Know how much you'll have to pay every month on your home loan",
    icon: BsCalculator,
    badge: "Calculator",
    href: "/contact?tool=emi-calculator"
  },
  {
    id: "home-loan-offers",
    title: "Best Home Loan Offers",
    description: "Get the lowest bank interest rates curated just for your financial profile",
    icon: TbCurrencyRupee,
    badge: "Lowest ROI",
    href: "/contact?tool=home-loan-offers"
  },
  {
    id: "interiors-estimator",
    title: "Interiors Budget Estimator",
    description: "Know the exact cost of getting your full or partial home interiors done",
    icon: FiCompass,
    badge: "Estimator",
    href: "/contact?tool=interiors-estimator"
  },
  {
    id: "rates-trends",
    title: "Rates & Market Trends",
    description: "Know all about property price appreciation & valuation trends in your city",
    icon: FiTrendingUp,
    badge: "Live Data",
    href: "/contact?tool=rates-trends"
  }
];

export default function AdviceAndTools() {
  return (
    <section className="w-full bg-white py-14 md:py-20 px-4 sm:px-6 md:px-12 border-t border-neutral-200/80 select-none">
      <div className="max-w-[1380px] mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>Smart Real Estate Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight">
              Advice & Tools
            </h2>
          </div>

          <Link 
            href="/contact?type=tools" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <span>Explore All Financial Tools</span>
            <FiArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ADVICE_TOOLS.map((tool, idx) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  href={tool.href}
                  className="bg-[#F8F5FF] border border-purple-200/80 rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:bg-[#F3EEFF] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
                >
                  {/* Top Row: Icon Container + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-purple-200/80 text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors duration-300 shadow-xs">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#18181B] text-white">
                      {tool.badge}
                    </span>
                  </div>

                  {/* Content: Title & Description */}
                  <div className="flex flex-col text-left mb-6">
                    <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors leading-snug">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-4 border-t border-purple-200/80 flex items-center justify-between text-xs font-extrabold text-[#7C3AED] group-hover:text-[#18181B] transition-colors">
                    <span className="flex items-center gap-1">
                      View now
                      <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
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
