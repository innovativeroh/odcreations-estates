"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FiMapPin, 
  FiHome, 
  FiChevronDown, 
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiSearch,
  FiX,
  FiTrendingUp,
  FiShield,
  FiCheckCircle,
  FiPause,
  FiPlay
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

const INTENT_TABS = [
  { id: "BUY", label: "BUY" },
  { id: "RENT", label: "RENT" },
  { id: "COMMERCIAL", label: "COMMERCIAL" },
  { id: "PLOTS", label: "PLOTS" }
];

const INDIAN_CITIES_LOCALITIES: Record<string, string[]> = {
  "Bengaluru, India": ["Whitefield", "Indiranagar", "Koramangala", "HSR Layout", "Electronic City", "JP Nagar", "Yelahanka"],
  "Mumbai, India": ["Bandra West", "Andheri West", "Powai", "Worli", "Juhu", "Lower Parel", "Thane West"],
  "Delhi NCR, India": ["Gurgaon Sector 54", "South Delhi", "Noida Sector 62", "Dwarka", "Golf Course Road", "Vasant Kunj"],
  "Goa, India": ["Panjim", "Calangute", "Anjuna", "Candolim", "North Goa Villas"],
  "Hyderabad, India": ["Gachibowli", "HITEC City", "Jubilee Hills", "Banjara Hills", "Kondapur"]
};

const LOCATIONS = Object.keys(INDIAN_CITIES_LOCALITIES);

const PRICE_RANGES = [
  "Any Budget",
  "₹25 L - ₹50 L",
  "₹50 L - ₹1.5 Cr",
  "₹1.5 Cr - ₹3 Cr",
  "₹3 Cr - ₹5 Cr",
  "₹5 Cr+"
];

const PROPERTY_TYPES = [
  "All Types",
  "2/3 BHK Flat",
  "Luxury Villa",
  "Builder Floor",
  "Penthouse",
  "Plot / Land"
];

const BACKGROUND_SLIDER_ITEMS = [
  {
    id: "slide-1",
    title: "Sobha Neopolis Luxury Villa",
    location: "Whitefield, Bengaluru",
    price: "₹2.4 Cr",
    tag: "Verified Villa",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80",
    description: "4BHK Luxury Villa with Private Garden — 100% Legal Title Cleared"
  },
  {
    id: "slide-2",
    title: "Prestige City Sky Duplex",
    location: "Worli, Mumbai",
    price: "₹4.8 Cr",
    tag: "Penthouse",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
    description: "Sea-Facing Residence with Private Terrace — Instant Move-in"
  },
  {
    id: "slide-3",
    title: "DLF SkyVillas Estate",
    location: "Golf Course Rd, Gurgaon",
    price: "₹3.5 Cr",
    tag: "Luxury Flat",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80",
    description: "Architectural Masterpiece with Smart Home Automation & 0% Brokerage"
  },
  {
    id: "slide-4",
    title: "Godrej Woodsville Gated Flat",
    location: "HSR Layout, Bengaluru",
    price: "₹1.75 Cr",
    tag: "3BHK Flat",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=80",
    description: "3BHK Premium Gated Residence — Free Cab Pickup for Site Visit"
  },
  {
    id: "slide-5",
    title: "The Horizon Oceanfront Villa",
    location: "Anjuna, Goa",
    price: "₹5.2 Cr",
    tag: "Beach Villa",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80",
    description: "Exclusive Modern Oceanfront Villa with Private Infinity Pool"
  }
];

export default function HousingHero() {
  const router = useRouter();

  // Search & Filter State
  const [activeIntent, setActiveIntent] = useState("BUY");
  const [selectedLocation, setSelectedLocation] = useState("Bengaluru, India");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("₹50 L - ₹1.5 Cr");
  const [selectedType, setSelectedType] = useState("2/3 BHK Flat");

  // Background Image Slider State
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isPausedManual, setIsPausedManual] = useState(false);

  // Auto-play effect
  useEffect(() => {
    if (isSliderHovered || isPausedManual) return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % BACKGROUND_SLIDER_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSliderHovered, isPausedManual]);

  const currentSlide = BACKGROUND_SLIDER_ITEMS[heroSlideIndex];

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<"location" | "price" | "type" | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Sync header location changes
  useEffect(() => {
    const handleLocationSync = (e: Event) => {
      const city = (e as CustomEvent).detail;
      if (city) {
        const matched = LOCATIONS.find(l => l.toLowerCase().includes(city.toLowerCase()));
        if (matched) {
          setSelectedLocation(matched);
        } else {
          setSelectedLocation(`${city}, India`);
        }
      }
    };
    window.addEventListener("header-location-change", handleLocationSync);
    return () => window.removeEventListener("header-location-change", handleLocationSync);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBrowse = (localityOverride?: string) => {
    const loc = localityOverride || searchQuery || selectedLocation;
    const params = new URLSearchParams({
      intent: activeIntent.toLowerCase(),
      location: loc,
      price: selectedPrice === "Any Budget" ? "" : selectedPrice,
      type: selectedType === "All Types" ? "" : selectedType,
      search: searchQuery
    });
    router.push(`/properties?${params.toString()}`);
  };

  const toggleDropdown = (type: "location" | "price" | "type") => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const localities = INDIAN_CITIES_LOCALITIES[selectedLocation] || INDIAN_CITIES_LOCALITIES["Bengaluru, India"];
  const filteredLocalities = searchQuery.trim()
    ? localities.filter((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
    : localities;

  return (
    <section 
      onMouseEnter={() => setIsSliderHovered(true)}
      onMouseLeave={() => setIsSliderHovered(false)}
      className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 lg:px-12 select-none overflow-hidden"
    >
      {/* ── FULL-BLEED BACKGROUND IMAGE SLIDER ── */}
      <div className="absolute inset-0 z-0 bg-neutral-950 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Multi-layered Vignette & Dark Overlay for Maximum Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 z-10 pointer-events-none" />
        
        {/* Subtle Ambient Violet Glow Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none z-10" />
      </div>

      {/* ── BACKGROUND SLIDER CONTROLS & CAPTION (BOTTOM OVERLAY) ── */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-30 flex items-center justify-between pointer-events-auto">
        
        {/* Current Slide Info Badge */}
        <motion.div 
          key={currentSlide.id + "-badge"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-white text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-white/90">{currentSlide.title}</span>
          <span className="text-white/40">•</span>
          <span className="text-purple-300 font-medium">{currentSlide.location}</span>
          <span className="text-white/40">•</span>
          <span className="font-extrabold text-amber-300">{currentSlide.price}</span>
        </motion.div>

        {/* Slide Indicators & Prev/Next Navigation */}
        <div className="flex items-center gap-3 ml-auto bg-black/50 backdrop-blur-md border border-white/15 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
          <button
            onClick={() => setHeroSlideIndex((prev) => (prev === 0 ? BACKGROUND_SLIDER_ITEMS.length - 1 : prev - 1))}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
            title="Previous Slide"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {BACKGROUND_SLIDER_ITEMS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  heroSlideIndex === idx ? "w-6 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setHeroSlideIndex((prev) => (prev + 1) % BACKGROUND_SLIDER_ITEMS.length)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
            title="Next Slide"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPausedManual(!isPausedManual)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 border-l border-white/20 pl-2 ml-1"
            title={isPausedManual ? "Play slideshow" : "Pause slideshow"}
          >
            {isPausedManual ? <FiPlay className="w-3.5 h-3.5" /> : <FiPause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── CENTERED HERO CONTENT CONTAINER ── */}
      <div className="relative z-20 max-w-[1000px] w-full mx-auto flex flex-col items-center text-center my-auto">
        
        {/* Top Trust Badges Row */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-4 sm:px-5 py-2 rounded-full shadow-2xl mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <FiShield className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>100% RERA Verified</span>
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="text-xs font-medium text-purple-200">Legal Title Deed Inspected</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-extrabold uppercase tracking-wider border border-purple-400/30">
            Free Cab Visit
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider">
            0% Brokerage
          </span>
        </motion.div>

        {/* Main Centered Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl drop-shadow-md"
        >
          We help people to realize their <span className="bg-gradient-to-r from-purple-300 via-amber-200 to-purple-200 bg-clip-text text-transparent">dream property</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-neutral-200 font-normal leading-relaxed max-w-2xl mt-4 sm:mt-6 mb-8 sm:mb-10 drop-shadow-sm"
        >
          Discover handpicked luxury flats, villas, plots, and commercial spaces across India's top prime locations with complete legal peace of mind.
        </motion.p>

        {/* ── CENTERED MASTER SEARCH & FILTER CONSOLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          ref={searchRef}
          className="w-full max-w-[860px] flex flex-col items-center gap-3 relative z-30"
        >
          
          {/* Centered Intent Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
            {INTENT_TABS.map((tab) => {
              const isActive = activeIntent === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveIntent(tab.id)}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-extrabold tracking-wider transition-all cursor-pointer ${
                    isActive 
                      ? "bg-white text-neutral-950 shadow-md scale-[1.02]" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main White Pill Search Bar Container */}
          <div className="w-full bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[28px] sm:rounded-[40px] p-2.5 sm:p-3 shadow-[0_24px_60px_rgba(0,0,0,0.4)] relative">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
              
              {/* Segment 1: Location & Search Input */}
              <div className="relative flex-1 min-w-0">
                <div 
                  onClick={() => toggleDropdown("location")}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50/70 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden min-w-0 w-full">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Location</span>
                    {showLocationInput ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search locality..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowAutocomplete(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleBrowse();
                          }}
                          className="text-sm font-bold text-neutral-900 bg-transparent outline-none w-full min-w-0"
                        />
                        {searchQuery && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery("");
                            }}
                            className="text-neutral-400 hover:text-neutral-700 flex-shrink-0"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-extrabold text-neutral-900 flex items-center justify-between gap-1 min-w-0">
                        <span className="truncate">{searchQuery || selectedLocation}</span>
                        <FiChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${openDropdown === "location" ? "rotate-180" : ""}`} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {(openDropdown === "location" || showAutocomplete) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 mt-3 w-72 bg-white border border-purple-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 text-left"
                    >
                      <div className="px-3 pb-2 mb-1 border-b border-neutral-100 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLocationInput(!showLocationInput);
                          }}
                          className="text-xs font-extrabold text-purple-700 hover:underline flex items-center gap-1.5"
                        >
                          <FiSearch className="w-3.5 h-3.5" />
                          {showLocationInput ? "Select City" : "Type Specific Locality"}
                        </button>
                      </div>

                      {!showLocationInput && (
                        <div className="max-h-56 overflow-y-auto">
                          <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Top Metro Cities</div>
                          {LOCATIONS.map((loc) => (
                            <button
                              key={loc}
                              onClick={() => {
                                setSelectedLocation(loc);
                                setSearchQuery("");
                                setOpenDropdown(null);
                                setShowAutocomplete(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-neutral-800 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="truncate">{loc}</span>
                              {selectedLocation === loc && !searchQuery && <FiCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {showLocationInput && (
                        <div className="max-h-56 overflow-y-auto">
                          <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Localities in {selectedLocation}</div>
                          {filteredLocalities.map((loc) => (
                            <button
                              key={loc}
                              onClick={() => {
                                setSearchQuery(loc);
                                setOpenDropdown(null);
                                setShowAutocomplete(false);
                                handleBrowse(loc);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-neutral-800 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="truncate">{loc}</span>
                              {searchQuery === loc && <FiCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider Line */}
              <div className="hidden md:block w-[1px] h-8 bg-neutral-200 flex-shrink-0" />

              {/* Segment 2: Price Range */}
              <div className="relative flex-1 min-w-0">
                <div 
                  onClick={() => toggleDropdown("price")}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50/70 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                    <TbCurrencyRupee className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden min-w-0 w-full">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Price Range</span>
                    <span className="text-sm font-extrabold text-neutral-900 flex items-center justify-between gap-1 min-w-0">
                      <span className="truncate">{selectedPrice}</span>
                      <FiChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${openDropdown === "price" ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openDropdown === "price" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 mt-3 w-56 bg-white border border-purple-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 text-left"
                    >
                      {PRICE_RANGES.map((pr) => (
                        <button
                          key={pr}
                          onClick={() => {
                            setSelectedPrice(pr);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-neutral-800 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{pr}</span>
                          {selectedPrice === pr && <FiCheck className="w-4 h-4 text-purple-600" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider Line */}
              <div className="hidden md:block w-[1px] h-8 bg-neutral-200 flex-shrink-0" />

              {/* Segment 3: Type of Property */}
              <div className="relative flex-1 min-w-0">
                <div 
                  onClick={() => toggleDropdown("type")}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50/70 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <FiHome className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden min-w-0 w-full">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Property Type</span>
                    <span className="text-sm font-extrabold text-neutral-900 flex items-center justify-between gap-1 min-w-0">
                      <span className="truncate">{selectedType}</span>
                      <FiChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${openDropdown === "type" ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openDropdown === "type" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full right-0 mt-3 w-56 bg-white border border-purple-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 text-left"
                    >
                      {PROPERTY_TYPES.map((pt) => (
                        <button
                          key={pt}
                          onClick={() => {
                            setSelectedType(pt);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-neutral-800 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{pt}</span>
                          {selectedType === pt && <FiCheck className="w-4 h-4 text-purple-600" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Search CTA Button */}
              <button
                onClick={() => handleBrowse()}
                className="w-full md:w-auto bg-neutral-900 hover:bg-black active:scale-95 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 sm:py-4 rounded-xl md:rounded-full transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
              >
                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span>Search</span>
              </button>

            </div>
          </div>

          {/* Centered Popular Hotspots Chips */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full scrollbar-none pt-2 text-xs">
            <span className="text-xs font-extrabold text-white/90 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
              <FiTrendingUp className="w-3.5 h-3.5 text-amber-300" />
              Hotspots:
            </span>
            {localities.slice(0, 5).map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setSearchQuery(loc);
                  handleBrowse(loc);
                }}
                className="px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-white/20 text-white font-semibold text-xs whitespace-nowrap transition-all border border-white/20 backdrop-blur-md flex-shrink-0 cursor-pointer hover:border-white/40"
              >
                {loc}
              </button>
            ))}
          </div>

        </motion.div>

      </div>

    </section>
  );
}
