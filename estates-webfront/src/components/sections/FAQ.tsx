"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiArrowRight, FiPlus, FiMinus, FiHelpCircle } from "react-icons/fi";

const FAQS = [
  {
    question: "How does the real estate investment & property buying process work?",
    answer: "Getting started is easy. Browse our curated listings across top Indian metro cities, choose the property that matches your budget and goals, schedule a physical or virtual site visit, and complete legal verification & booking online or with our dedicated property advisor."
  },
  {
    question: "What types of properties are available on Estates?",
    answer: "We offer a wide range of verified properties including 2/3 BHK apartments, luxury villas, builder floors, commercial office spaces, penthouses, and residential investment plots."
  },
  {
    question: "Is this a good platform for first-time buyers & investors?",
    answer: "Yes, absolutely! We provide complete legal verification, transparent ROI market trends, free advisor consultations, and end-to-end guidance to make your first property purchase completely stress-free."
  },
  {
    question: "How much budget do I need to start investing in properties?",
    answer: "Properties start from residential plots and budget apartments around ₹25 Lakhs up to luxury sea-facing villas and commercial real estate exceeding ₹5 Crores."
  },
  {
    question: "When and how do I receive property documentation & rental returns?",
    answer: "For rental yield properties, returns are transferred directly into your bank account on a monthly basis. All legal e-stamping, title deeds, and registration documents are handed over securely upon agreement completion."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-14 md:py-20 px-4 sm:px-6 md:px-12 border-t border-neutral-200/80 select-none">
      <div className="max-w-[1380px] mx-auto w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column - Heading & Contact CTA Card */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
                <FiZap className="w-4 h-4" />
                <span>Help & Support</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight leading-tight mb-6">
                Got questions?<br />We have got answers.
              </h2>
            </div>
            
            {/* Consultation Card */}
            <div className="bg-[#F7F5FC] border border-purple-200/80 rounded-[24px] p-6 shadow-md text-left mt-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center mb-3">
                <FiHelpCircle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#111827] mb-1">Still have a question?</h4>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                Don't worry. We offer free 1-on-1 consultations with our real estate experts.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] hover:bg-[#27272A] text-white rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 shadow-sm cursor-pointer"
              >
                <span>Contact Us for Free Advice</span>
                <FiArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* Right Column - Accordion Items */}
          <div className="lg:col-span-7 space-y-4 w-full">
            {FAQS.map((faq, idx) => {
              const isOpen = activeIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-purple-100/80 rounded-[22px] p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-purple-200 transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full text-left flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors leading-snug">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EAE4FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center font-extrabold text-sm transition-colors">
                      {isOpen ? <FiMinus className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <p className="pt-3 mt-3 text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed border-t border-purple-100/80">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
