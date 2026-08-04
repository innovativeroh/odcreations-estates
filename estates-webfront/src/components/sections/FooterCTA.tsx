"use client";

import Image from "next/image";

export default function FooterCTA() {
  return (
    <section className="w-full relative bg-white overflow-hidden">
      
      {/* Background Split: Grey top half to match the FAQ section above it */}
      <div className="absolute top-0 inset-x-0 h-[180px] bg-[#f8f9fa] z-0 pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-6">
        
        {/* Banner Card - Overlapping */}
        <div className="bg-white rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.06)] border border-neutral-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative min-h-[420px]">
          
          {/* Left Column Content */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between items-start">
            <div className="w-full">
              {/* Badge Icon */}
              <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mb-8 shadow-md text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4 tracking-tight">
                Build wealth with<br />confidence
              </h2>
              
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
                Join thousands of investors who trust us to deliver long-term returns through real estate.
              </p>
            </div>
            
            <button className="px-6 py-3.5 bg-neutral-950 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-md shadow-neutral-950/20 whitespace-nowrap group">
              Get Started
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors group-hover:translate-x-0.5 transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right Column Image */}
          <div className="relative w-full h-[280px] lg:h-auto min-h-[300px]">
            <Image 
              src="/building-facade.png" 
              alt="Modern Building Facade"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-24 flex flex-col items-center text-center">
          <span className="text-[#ff5a36] font-semibold text-sm mb-4 block tracking-wide">-Newsletter</span>
          
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-8 tracking-tight max-w-3xl">
            Subscribe our newsletter for latest<br className="hidden md:block" /> news and daily updates
          </h3>
          
          {/* Subscription Input Bar */}
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-lg bg-white rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.06)] border border-neutral-100/80 p-2 flex items-center"
          >
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-grow bg-transparent px-6 py-3 outline-none text-neutral-800 placeholder-neutral-400 text-sm"
              required
            />
            <button 
              type="submit"
              className="px-8 py-3.5 bg-neutral-950 text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
