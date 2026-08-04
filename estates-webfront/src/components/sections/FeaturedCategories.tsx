"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FiArrowUpRight,
  FiStar,
  FiZap
} from "react-icons/fi";
import ServiceEnquiryModal, { ALL_SERVICES } from "@/components/modals/ServiceEnquiryModal";

export default function FeaturedCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState("packers-movers");

  const handleOpenServiceModal = (serviceId: string) => {
    setActiveServiceId(serviceId);
    setIsModalOpen(true);
  };

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

          <button 
            onClick={() => handleOpenServiceModal("packers-movers")} 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <span>Explore All Services</span>
            <FiArrowUpRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ALL_SERVICES.map((service, idx) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div
                  onClick={() => handleOpenServiceModal(service.id)}
                  className="bg-white border border-purple-100/80 rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
                >
                  {/* Top Row: Custom Icon + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors duration-300 shadow-xs">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Badge */}
                    <span 
                      className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs bg-[#18181B] text-white group-hover:bg-[#7C3AED] transition-colors"
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

                  {/* Footer Action Button */}
                  <div className="pt-4 border-t border-purple-100/80 flex items-center justify-between text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">
                    <span>Avail Service</span>
                    <div className="w-8 h-8 rounded-full bg-[#EAE4FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center transition-colors">
                      <FiArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Interactive Service Enquiry Modal */}
      <ServiceEnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialServiceId={activeServiceId}
      />
    </section>
  );
}
