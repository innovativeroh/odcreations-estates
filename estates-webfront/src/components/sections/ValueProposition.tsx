import Image from "next/image";

export default function ValueProposition() {
  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden relative border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        


        {/* Bottom Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Content */}
          <div className="flex flex-col items-start pr-0 lg:pr-12">
            <span className="text-[#ff5a36] font-semibold text-sm mb-4 tracking-wide">- Reason to choose us</span>
            <h2 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-neutral-900 leading-[1.1] mb-6 tracking-tight">
              Discover the value behind smart property investments
            </h2>
            <p className="text-neutral-500 text-base md:text-lg mb-10 max-w-md leading-relaxed">
              We handle the heavy lifting by conducting in-depth research, analyzing the numbers, and finding high-performing properties for you.
            </p>
            <button className="bg-neutral-950 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 group shadow-md shadow-neutral-950/10">
              Find the best for you 
              <span className="group-hover:translate-x-1 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </button>
          </div>

          {/* Right Column Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Card 1: Smart Suggestions */}
            <div className="bg-[#f8f9fa] rounded-[32px] p-8 flex flex-col items-start relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-white rounded-full px-4 py-2.5 shadow-sm border border-neutral-100 flex items-center gap-2 mb-12">
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span className="text-[11px] font-bold text-neutral-400 tracking-wide">Search with "AI"</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Smart Suggestions</h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-[200px]">
                AI scans listings to find your best-fit property.
              </p>
            </div>

            {/* Card 2: Trusted Investor */}
            <div className="bg-[#f8f9fa] rounded-[32px] p-8 flex flex-col items-start relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-neutral-900 rounded-2xl shadow-md flex items-center justify-center mb-10">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">99% Trusted Investor</h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-[200px]">
                Users trust our picks and return for more deals.
              </p>
            </div>

            {/* Card 3: Invest Where it Matters */}
            <div className="col-span-1 md:col-span-2 bg-[#f8f9fa] rounded-[32px] p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between group hover:-translate-y-1 transition-transform duration-300 min-h-[220px]">
              
              {/* Dotted Background Map Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)", backgroundSize: "16px 16px" }} />

              {/* Text Content */}
              <div className="flex flex-col relative z-20 w-full md:w-1/2 md:pr-4">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Invest Where it Matters</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-[220px]">
                  We pinpoint High-demand, high-grow areas backed by market data.
                </p>
              </div>

              {/* Graphic Content */}
              <div className="relative w-full md:w-1/2 h-44 md:h-full mt-10 md:mt-0 flex justify-end items-center z-10">
                
                {/* Dashed Arrow */}
                <svg className="absolute left-[5%] top-[50%] w-32 h-16 text-neutral-300 opacity-80" viewBox="0 0 100 50" fill="none">
                  <path d="M 0 15 Q 50 40 90 20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                  <path d="M 85 15 L 90 20 L 85 25" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>

                {/* Red Pin Badge */}
                <div className="absolute left-[15%] top-[35%] flex items-center gap-2 z-30 transform -rotate-6">
                  <div className="w-3.5 h-3.5 bg-[#ff5a36] rounded-full shadow-md relative">
                    <div className="absolute inset-0 bg-[#ff5a36] rounded-full animate-ping opacity-50" />
                  </div>
                  <div className="bg-[#ff5a36] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md tracking-wide">
                    ₹12,000
                  </div>
                </div>

                {/* Secondary Tilted Card (Behind) */}
                <div className="absolute right-4 top-8 w-48 h-32 md:h-36 bg-white rounded-xl shadow-md p-2 transform -rotate-3 scale-95 opacity-80 border border-neutral-100 z-10 transition-transform duration-500 group-hover:rotate-0">
                  <div className="relative w-full h-20 md:h-24 rounded-lg overflow-hidden bg-neutral-100 mb-2" />
                  <div className="w-3/4 h-2 bg-neutral-100 rounded mb-1.5" />
                  <div className="w-1/2 h-1.5 bg-neutral-50 rounded" />
                </div>

                {/* Mini Property Card (Tilted) */}
                <div className="relative w-48 h-36 md:h-40 bg-white rounded-xl shadow-xl p-2 pb-4 transform rotate-6 translate-x-2 border border-neutral-100 z-20 overflow-hidden transition-transform duration-500 group-hover:rotate-3">
                  <div className="relative w-full h-20 md:h-24 rounded-lg overflow-hidden bg-neutral-100 mb-3">
                    <Image src="/property-1.png" alt="Property" fill className="object-cover" />
                  </div>
                  <h4 className="font-bold text-[11px] text-neutral-900 mb-0.5 leading-tight truncate">Modern Architectural Mar...</h4>
                  <span className="text-[9px] text-neutral-400 block truncate font-medium">Catonsville, MD</span>
                </div>
                
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
