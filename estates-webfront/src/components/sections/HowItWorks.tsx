"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HowItWorks() {
  return (
    <section className="w-full bg-[#f8f9fa] pt-28 pb-32 overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-20">
          <div className="lg:col-span-7 max-w-2xl">
            <span className="text-[#ff5a36] font-semibold text-sm mb-4 block tracking-wide">- How it works?</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
              Invest with confidence<br />in just a few steps
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-8">
            <p className="text-neutral-500 text-base md:text-lg leading-relaxed max-w-md">
              Follow our transparent, data-driven process and start building wealth through real estate today.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          
          {/* Curved Connecting Lines (Visible only on large desktop screens) */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block z-20">
            {/* Arrow 1 (Step 1 -> Step 2) - Starts near top-right of Card 1, curves up then down to Card 2 */}
            <svg className="absolute w-[10%] h-[60px] top-[8%] left-[21%] text-[#ff5a36]" viewBox="0 0 100 60" fill="none">
              <circle cx="10" cy="30" r="4" className="fill-[#ff5a36]" />
              <path 
                d="M10 30 C 35 10, 65 10, 85 30" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                strokeLinecap="round" 
              />
              <path 
                d="M78 30 L85 30 L85 23" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>

            {/* Arrow 2 (Step 2 -> Step 3) - Starts near bottom-right of Card 2, curves down then up to Card 3 */}
            <svg className="absolute w-[10%] h-[60px] top-[48%] left-[45%] text-[#ff5a36]" viewBox="0 0 100 60" fill="none">
              <circle cx="10" cy="20" r="4" className="fill-[#ff5a36]" />
              <path 
                d="M10 20 C 35 45, 65 45, 85 20" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                strokeLinecap="round" 
              />
              <path 
                d="M78 22 L85 20 L83 13" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>

            {/* Arrow 3 (Step 3 -> Step 4) - Starts near bottom-right of Card 3, curves down then up to Card 4 */}
            <svg className="absolute w-[10%] h-[60px] top-[48%] left-[69%] text-[#ff5a36]" viewBox="0 0 100 60" fill="none">
              <circle cx="10" cy="20" r="4" className="fill-[#ff5a36]" />
              <path 
                d="M10 20 C 35 45, 65 45, 85 20" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                strokeLinecap="round" 
              />
              <path 
                d="M78 22 L85 20 L83 13" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100/50 flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-bold text-neutral-400 block mb-2 tracking-widest">STEP 1</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Create an account</h3>
              </div>
              <div className="bg-[#fcfdfe] rounded-2xl border border-neutral-100 p-6 flex flex-col items-center justify-center h-[180px] shadow-inner">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="w-24 h-2.5 bg-neutral-100 rounded-full mt-4" />
                <div className="w-16 h-2 bg-neutral-100/70 rounded-full mt-2" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100/50 flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-bold text-neutral-400 block mb-2 tracking-widest">STEP 2</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Discover properties</h3>
              </div>
              <div className="relative rounded-2xl overflow-hidden h-[180px] flex items-center justify-center bg-neutral-50 border border-neutral-100">
                {/* World Map Dotted Pattern Background */}
                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Stacked Images Cards */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute w-[80px] h-[100px] rounded-lg overflow-hidden border-2 border-white shadow-md transform -rotate-12 -translate-x-12 translate-y-2">
                    <Image src="/property-1.png" alt="Prop 1" fill className="object-cover" />
                  </div>
                  <div className="absolute w-[80px] h-[100px] rounded-lg overflow-hidden border-2 border-white shadow-md transform rotate-12 translate-x-12 translate-y-2">
                    <Image src="/property-3.png" alt="Prop 3" fill className="object-cover" />
                  </div>
                  
                  {/* Front centered preview card */}
                  <div className="absolute z-10 w-[110px] bg-white rounded-xl shadow-lg border border-neutral-100/80 p-2 flex flex-col transform -translate-y-2">
                    <div className="relative w-full h-[60px] rounded-lg overflow-hidden mb-1.5">
                      <Image src="/property-2.png" alt="Prop 2" fill className="object-cover" />
                    </div>
                    <span className="text-[8px] font-bold text-neutral-800 truncate">Modern Architectural...</span>
                    <span className="text-[6px] text-neutral-400 truncate">Catonsville, MD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100/50 flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-bold text-neutral-400 block mb-2 tracking-widest">STEP 3</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Invest with confidence</h3>
              </div>
              <div className="bg-[#fcfdfe] rounded-2xl border border-neutral-100 p-6 flex flex-col items-center justify-center h-[180px] shadow-inner relative">
                {/* Back card decoration */}
                <div className="absolute w-[85%] h-[120px] bg-white rounded-xl border border-neutral-100/60 shadow-sm transform -rotate-3 translate-y-1 z-0" />
                
                {/* Front card */}
                <div className="relative z-10 w-[95%] bg-white rounded-xl border border-neutral-100 shadow-md p-4 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-[#ff5a36] mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-20 h-2 bg-neutral-100 rounded-full" />
                  <div className="w-14 h-1.5 bg-neutral-100/70 rounded-full mt-2" />
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100/50 flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-bold text-neutral-400 block mb-2 tracking-widest">STEP 4</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Earn and track</h3>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-100 h-[180px] shadow-sm flex flex-col justify-between p-4 relative overflow-hidden">
                {/* Mini property metadata header */}
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200">
                    <Image src="/property-2.png" alt="Prop mini" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-800">Glasshouse Retreat</span>
                    <span className="text-[7px] text-neutral-400">Austin, TX</span>
                  </div>
                </div>

                {/* Minimal line chart representation */}
                <div className="relative w-full h-[70px] mt-4 flex items-end">
                  <svg className="w-full h-full text-[#ff5a36]" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5a36" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#ff5a36" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0 45 Q20 40 35 25 T70 30 T100 10 L100 50 L0 50 Z" 
                      fill="url(#chartGrad)" 
                    />
                    <path 
                      d="M0 45 Q20 40 35 25 T70 30 T100 10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    {/* Highlight node indicator */}
                    <circle cx="70" cy="30" r="3" fill="#ff5a36" />
                  </svg>

                  {/* Return rate badge absolutely positioned */}
                  <span className="absolute top-[10px] right-[25%] bg-[#ff5a36] text-[8px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm">
                    7.8%
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
