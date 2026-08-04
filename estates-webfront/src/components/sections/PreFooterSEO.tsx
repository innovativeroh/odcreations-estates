"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronRight, FiZap } from "react-icons/fi";

const POPULAR_SEARCHES = {
  BUY: {
    residential: [
      "Property for Sale in Bengaluru",
      "Flats in Bengaluru",
      "Studio Apartments in Bengaluru",
      "Resale House in Bengaluru",
      "Luxury Villas for Sale in Bengaluru",
      "Independent House for Sale in Bengaluru",
      "Penthouse in Bengaluru",
      "Ready To Move Flats in Bengaluru",
      "Gated Communities in Bengaluru"
    ],
    bhk: [
      "1 BHK Flats in Bengaluru",
      "2 BHK Flats in Bengaluru",
      "3 BHK Flats in Bengaluru",
      "4 BHK Flats in Bengaluru",
      "1 BHK House for Sale in Bengaluru",
      "2 BHK House for Sale in Bengaluru",
      "3 BHK House for Sale in Bengaluru",
      "2 BHK Villa for Sale in Bengaluru",
      "3 BHK Villa for Sale in Bengaluru",
      "4 BHK Villa for Sale in Bengaluru"
    ],
    flatLocalities: [
      "Flats for Sale in Whitefield",
      "Flats for Sale in Indiranagar",
      "Flats for Sale in Koramangala",
      "Flats for Sale in HSR Layout",
      "Flats for Sale in Electronic City",
      "Flats for Sale in JP Nagar",
      "Flats for Sale in Yelahanka",
      "Flats for Sale in Marathahalli",
      "Flats for Sale in Sarjapur Road",
      "Flats for Sale in Bellandur"
    ],
    houseLocalities: [
      "Villa for Sale in Whitefield",
      "House for Sale in Indiranagar",
      "House for Sale in Koramangala",
      "House for Sale in HSR Layout",
      "Commercial Office in MG Road",
      "Villa for Sale in Yelahanka",
      "House for Sale in JP Nagar",
      "Plot for Sale in Electronic City",
      "Independent House in Hebbal",
      "Gated Villa in Sarjapur Road"
    ]
  },
  RENT: {
    residential: [
      "Property for Rent in Bengaluru",
      "Flats for Rent in Bengaluru",
      "Studio Apartments for Rent in Bengaluru",
      "House for Rent in Bengaluru",
      "Villas for Rent in Bengaluru",
      "Furnished Apartments in Bengaluru",
      "PG & Co-Living in Bengaluru",
      "Owner Direct Rentals in Bengaluru",
      "Short Term Rentals in Bengaluru"
    ],
    bhk: [
      "1 BHK Flat for Rent in Bengaluru",
      "2 BHK Flat for Rent in Bengaluru",
      "3 BHK Flat for Rent in Bengaluru",
      "4 BHK Flat for Rent in Bengaluru",
      "1 BHK House for Rent in Bengaluru",
      "2 BHK House for Rent in Bengaluru",
      "3 BHK House for Rent in Bengaluru",
      "Furnished 2 BHK in Bengaluru",
      "Furnished 3 BHK in Bengaluru"
    ],
    flatLocalities: [
      "Flats for Rent in Whitefield",
      "Flats for Rent in Indiranagar",
      "Flats for Rent in Koramangala",
      "Flats for Rent in HSR Layout",
      "Flats for Rent in Electronic City",
      "Flats for Rent in JP Nagar",
      "Flats for Rent in Yelahanka",
      "Flats for Rent in Marathahalli",
      "Flats for Rent in Sarjapur Road",
      "Flats for Rent in Bellandur"
    ],
    houseLocalities: [
      "Villa for Rent in Whitefield",
      "House for Rent in Indiranagar",
      "House for Rent in Koramangala",
      "House for Rent in HSR Layout",
      "Office Space for Lease in MG Road",
      "Villa for Rent in Yelahanka",
      "House for Rent in JP Nagar",
      "Commercial Shop in Electronic City",
      "House for Rent in Hebbal"
    ]
  }
};

export default function PreFooterSEO() {
  const [activeTab, setActiveTab] = useState<"BUY" | "RENT">("BUY");

  const currentData = POPULAR_SEARCHES[activeTab];

  return (
    <section className="w-full bg-[#F7F5FC] py-12 md:py-16 px-4 sm:px-6 md:px-12 border-t border-purple-100/80 select-none">
      <div className="max-w-[1380px] mx-auto w-full">
        
        {/* Main Card Frame */}
        <div className="bg-white border border-purple-100/80 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-lg text-left">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-purple-100/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1.5">
                <FiZap className="w-4 h-4" />
                <span>Real Estate Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight relative inline-block">
                Property Options in Bengaluru
                <span className="block h-1 w-14 bg-[#7C3AED] rounded-full mt-1.5" />
              </h2>
            </div>

            {/* Buy / Rent Tabs */}
            <div className="flex items-center gap-2 bg-[#F4F0FE] p-1.5 rounded-full border border-purple-200/80 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("BUY")}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "BUY"
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#111827]"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab("RENT")}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "RENT"
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#111827]"
                }`}
              >
                Rent
              </button>
            </div>
          </div>

          {/* 4 Categorized Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Column 1: Popular Residential Searches */}
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-bold text-[#111827] mb-3 pb-2 border-b border-purple-100/80 flex items-center justify-between">
                <span>Popular Residential Searches</span>
              </h3>
              <ul className="space-y-2">
                {currentData.residential.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/properties?intent=${activeTab.toLowerCase()}&search=${encodeURIComponent(item)}`}
                      className="text-xs text-[#64748B] hover:text-[#7C3AED] transition-colors flex items-center gap-1 group py-0.5"
                    >
                      <span className="line-clamp-1">{item}</span>
                      <FiChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-[#7C3AED] transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Popular BHK Searches */}
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-bold text-[#111827] mb-3 pb-2 border-b border-purple-100/80 flex items-center justify-between">
                <span>Popular BHK Searches</span>
              </h3>
              <ul className="space-y-2">
                {currentData.bhk.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/properties?intent=${activeTab.toLowerCase()}&search=${encodeURIComponent(item)}`}
                      className="text-xs text-[#64748B] hover:text-[#7C3AED] transition-colors flex items-center gap-1 group py-0.5"
                    >
                      <span className="line-clamp-1">{item}</span>
                      <FiChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-[#7C3AED] transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Popular Flat Searches */}
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-bold text-[#111827] mb-3 pb-2 border-b border-purple-100/80 flex items-center justify-between">
                <span>Popular Flat Searches</span>
              </h3>
              <ul className="space-y-2">
                {currentData.flatLocalities.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/properties?intent=${activeTab.toLowerCase()}&search=${encodeURIComponent(item)}`}
                      className="text-xs text-[#64748B] hover:text-[#7C3AED] transition-colors flex items-center gap-1 group py-0.5"
                    >
                      <span className="line-clamp-1">{item}</span>
                      <FiChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-[#7C3AED] transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Popular House Searches */}
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-bold text-[#111827] mb-3 pb-2 border-b border-purple-100/80 flex items-center justify-between">
                <span>Popular House Searches</span>
              </h3>
              <ul className="space-y-2">
                {currentData.houseLocalities.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/properties?intent=${activeTab.toLowerCase()}&search=${encodeURIComponent(item)}`}
                      className="text-xs text-[#64748B] hover:text-[#7C3AED] transition-colors flex items-center gap-1 group py-0.5"
                    >
                      <span className="line-clamp-1">{item}</span>
                      <FiChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-[#7C3AED] transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
