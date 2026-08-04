"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMapPin, 
  FiMaximize2, 
  FiArrowUpRight, 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiZap, 
  FiSliders,
  FiRotateCcw 
} from "react-icons/fi";
import { BiBed, BiBath } from "react-icons/bi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface BackendProperty {
  _id: string;
  title: string;
  description: string;
  type: string;
  transactionType: string;
  submitterRole: string;
  price: number;
  city: string;
  state: string;
  address: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  featured: boolean;
  yearBuilt?: number;
  createdAt: string;
}

const SAMPLE_PROPERTIES: BackendProperty[] = [
  {
    _id: "p1",
    title: "Opera Ananda Luxury Villa",
    description: "Spacious 4 BHK luxury villa with private garden, smart automation, and 24/7 clubhouse access.",
    type: "villa",
    transactionType: "sale",
    submitterRole: "agent",
    price: 24000000,
    city: "Bengaluru",
    state: "Karnataka",
    address: "Whitefield, Bengaluru",
    size: 2800,
    bedrooms: 4,
    bathrooms: 4,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p2",
    title: "Empire State Seafront Apartment",
    description: "Premium sea-facing 3 BHK residence with panoramic ocean views and private elevator deck.",
    type: "apartment",
    transactionType: "sale",
    submitterRole: "owner",
    price: 48000000,
    city: "Mumbai",
    state: "Maharashtra",
    address: "Bandra West, Mumbai",
    size: 3200,
    bedrooms: 3,
    bathrooms: 4,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p3",
    title: "Skyline Royal Penthouse",
    description: "Ultra-luxury penthouse with private heated pool, sky lounge, and 360-degree city views.",
    type: "apartment",
    transactionType: "sale",
    submitterRole: "agent",
    price: 31000000,
    city: "Gurgaon",
    state: "Delhi NCR",
    address: "Golf Course Road, Gurgaon",
    size: 2500,
    bedrooms: 3,
    bathrooms: 3,
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p4",
    title: "Vinay Heights Modern Residence",
    description: "Contemporary 3 BHK builder floor in prime locality with Italian marble flooring.",
    type: "house",
    transactionType: "sale",
    submitterRole: "owner",
    price: 8500000,
    city: "Jaipur",
    state: "Rajasthan",
    address: "Vaishali Nagar, Jaipur",
    size: 1450,
    bedrooms: 3,
    bathrooms: 2,
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"],
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p5",
    title: "Azure Seafront Villa",
    description: "Portuguese-style luxury beach villa surrounded by tropical gardens and private infinity pool.",
    type: "villa",
    transactionType: "sale",
    submitterRole: "agent",
    price: 19500000,
    city: "Panjim",
    state: "Goa",
    address: "Panjim, Goa",
    size: 1900,
    bedrooms: 3,
    bathrooms: 3,
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p6",
    title: "Gachibowli Tech Towers",
    description: "Modern high-rise 2 BHK apartment near major IT parks with club amenities.",
    type: "apartment",
    transactionType: "rent",
    submitterRole: "owner",
    price: 45000,
    city: "Hyderabad",
    state: "Telangana",
    address: "HITEC City, Hyderabad",
    size: 1650,
    bedrooms: 2,
    bathrooms: 2,
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80"],
    featured: false,
    createdAt: new Date().toISOString()
  }
];

function formatPrice(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const PROPERTY_TYPES = ["apartment", "villa", "house", "commercial", "plot", "pg_hostel"] as const;
const TRANSACTION_TYPES = ["sale", "rent", "lease"] as const;

function intentToFilters(intent: string): { transactionType?: string; type?: string } {
  switch (intent) {
    case "buy": return { transactionType: "sale" };
    case "rent": return { transactionType: "rent" };
    case "commercial": return { type: "commercial" };
    case "plots": return { type: "plot" };
    case "pg-co-living": return { type: "pg_hostel" };
    default: return {};
  }
}

function normalizeType(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "_");
  return (PROPERTY_TYPES as readonly string[]).includes(cleaned) ? cleaned : null;
}

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  villa: "Villa",
  house: "House",
  commercial: "Commercial",
  plot: "Plot",
  pg_hostel: "PG / Hostel",
};

const TRANSACTION_LABELS: Record<string, string> = {
  sale: "Buy",
  rent: "Rent",
  lease: "Lease",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<BackendProperty[]>(SAMPLE_PROPERTIES);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(400000000);
  const [minBeds, setMinBeds] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [transactionType, setTransactionType] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [directOnly, setDirectOnly] = useState<boolean>(false);
  const [heroIntent, setHeroIntent] = useState<string>("");

  const fetchProperties = useCallback(async (filters: { transactionType?: string; type?: string; city?: string }) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: "100" });
      if (filters.transactionType) qs.set("transactionType", filters.transactionType);
      if (filters.type) qs.set("type", filters.type);
      if (filters.city) qs.set("city", filters.city);
      const res = await fetch(`${API_BASE}/api/properties?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data?.properties?.length) {
        setProperties(data.properties);
      } else {
        setProperties(SAMPLE_PROPERTIES);
      }
    } catch {
      setProperties(SAMPLE_PROPERTIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties({ transactionType: transactionType || undefined, type: propertyType || undefined });
  }, [fetchProperties, transactionType, propertyType]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    const loc = params.get("city") || params.get("location");
    const intent = params.get("intent");
    const explicitTransactionType = params.get("transactionType");
    const explicitType = params.get("type");
    const direct = params.get("direct");

    if (search) setSearchQuery(search);
    if (loc && loc !== "All") setSelectedCities([loc]);
    if (direct === "true") setDirectOnly(true);

    if (intent) {
      setHeroIntent(intent);
      const mapped = intentToFilters(intent);
      if (mapped.transactionType) setTransactionType(mapped.transactionType);
      if (mapped.type) setPropertyType(mapped.type);
    }
    if (explicitTransactionType && (TRANSACTION_TYPES as readonly string[]).includes(explicitTransactionType)) {
      setTransactionType(explicitTransactionType);
    }
    if (explicitType) {
      const normalized = normalizeType(explicitType);
      if (normalized) setPropertyType(normalized);
    }
  }, []);

  const cityList = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties]);

  const filtered = useMemo(() => {
    let result = [...properties];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.state.toLowerCase().includes(q)
      );
    }
    if (selectedCities.length > 0) {
      result = result.filter((p) => selectedCities.includes(p.city));
    }
    result = result.filter((p) => p.price <= maxPrice);
    if (minBeds) result = result.filter((p) => p.bedrooms >= minBeds);
    if (directOnly) result = result.filter((p) => p.submitterRole === "owner");

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [properties, searchQuery, selectedCities, maxPrice, minBeds, sortBy, directOnly]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCities([]);
    setMaxPrice(400000000);
    setMinBeds(null);
    setSortBy("default");
    setTransactionType("");
    setPropertyType("");
    setDirectOnly(false);
    setHeroIntent("");
  };

  const pageHeading = TRANSACTION_LABELS[transactionType]
    ? `Properties to ${TRANSACTION_LABELS[transactionType]}`
    : TYPE_LABELS[propertyType]
    ? TYPE_LABELS[propertyType] + " Listings"
    : "Verified Property Directory";

  const formatSlider = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(0)} Cr`;
    return `₹${(n / 100000).toFixed(0)} L`;
  };

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-purple-100 pb-4">
        <div className="flex items-center gap-2">
          <FiSliders className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="font-bold text-[#111827] text-base">Search Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-extrabold text-[#7C3AED] hover:text-[#18181B] transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <FiRotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Looking To Tabs */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">Looking To</h4>
        <div className="flex gap-2">
          {["", ...TRANSACTION_TYPES].map((tt) => (
            <button
              key={tt || "any"}
              onClick={() => setTransactionType(tt)}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl border-2 transition-all cursor-pointer ${
                transactionType === tt
                  ? "bg-[#18181B] border-[#18181B] text-white shadow-xs"
                  : "bg-white border-[#18181B]/20 text-[#64748B] hover:border-[#18181B] hover:text-[#111827]"
              }`}
            >
              {tt ? TRANSACTION_LABELS[tt] : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type Dropdown */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">Property Type</h4>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full bg-white border border-purple-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#111827] outline-none cursor-pointer"
        >
          <option value="">All Property Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Direct Owner Toggle */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#111827]">
          <input
            type="checkbox"
            checked={directOnly}
            onChange={(e) => setDirectOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[#18181B] accent-[#7C3AED]"
          />
          Owner listings only (No Brokerage)
        </label>
      </div>

      {/* City Filter */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">Select Cities</h4>
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {cityList.map((city) => (
            <label key={city} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#64748B] hover:text-[#111827]">
              <input
                type="checkbox"
                checked={selectedCities.includes(city)}
                onChange={() => setSelectedCities((prev) => prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city])}
                className="w-4 h-4 rounded border-[#18181B] accent-[#7C3AED]"
              />
              {city}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-baseline">
          <h4 className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">Max Price</h4>
          <span className="text-xs font-extrabold text-[#111827]">{formatSlider(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={10000000}
          max={400000000}
          step={5000000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
          className="w-full accent-[#7C3AED] cursor-pointer bg-neutral-200 h-1.5 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 font-extrabold">
          <span>₹1 Cr</span>
          <span>₹40 Cr</span>
        </div>
      </div>

      {/* Bedroom Filter */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">Min Bedrooms</h4>
        <div className="flex gap-2">
          {[null, 2, 3, 4].map((beds) => (
            <button
              key={beds ?? "any"}
              onClick={() => setMinBeds(beds)}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl border-2 transition-all cursor-pointer ${
                minBeds === beds
                  ? "bg-[#18181B] border-[#18181B] text-white shadow-xs"
                  : "bg-white border-[#18181B]/20 text-[#64748B] hover:border-[#18181B] hover:text-[#111827]"
              }`}
            >
              {beds ? `${beds}+` : "Any"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F4F0FE] min-h-screen pt-28 pb-24 px-4 sm:px-6 md:px-12 select-none">
      <div className="max-w-[1380px] mx-auto w-full">

        {/* Page Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
              <FiZap className="w-4 h-4" />
              <span>{heroIntent === "pg-co-living" ? "PG & Co-Living Spaces" : "Verified Listings"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight">{pageHeading}</h1>
          </div>

          {/* Search Bar Input */}
          <div className="w-full lg:max-w-lg bg-white rounded-full border border-purple-200/80 p-1.5 flex items-center shadow-md">
            <FiSearch className="w-5 h-5 text-[#7C3AED] ml-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search locality, city, project name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 text-xs sm:text-sm font-bold text-[#111827] placeholder:text-neutral-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1 mr-2 text-neutral-400 hover:text-[#111827]">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sorting & Filter Count Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-200/80">
          <span className="text-xs sm:text-sm font-extrabold text-[#111827]">
            Showing <span className="text-[#7C3AED]">{filtered.length}</span> Verified Properties
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-purple-200/80 text-xs font-extrabold text-[#111827] shadow-xs"
            >
              <FiFilter className="w-4 h-4 text-[#7C3AED]" />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-purple-200/80 rounded-full px-4 py-2 text-xs font-extrabold text-[#111827] outline-none cursor-pointer shadow-xs"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-3 bg-white border border-purple-100/80 rounded-[28px] p-6 shadow-md sticky top-28 text-left">
            {renderFilters()}
          </div>

          {/* Properties Listings Grid */}
          <div className="lg:col-span-9">
            {filtered.length === 0 ? (
              <div className="bg-white border border-purple-100/80 rounded-[28px] p-12 text-center shadow-md">
                <h3 className="text-xl font-bold text-[#111827] mb-2">No matching properties found</h3>
                <p className="text-xs text-[#64748B] mb-6">Try relaxing your price filters or searching a different city.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full bg-[#18181B] text-white text-xs font-bold shadow-md hover:bg-[#27272A]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((property, idx) => (
                  <motion.div
                    key={`${property._id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/properties/${property._id}`}
                      className="bg-white border border-purple-100/80 rounded-[28px] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer text-left"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative w-full h-[200px] sm:h-[220px] rounded-[22px] overflow-hidden mb-4 bg-neutral-100 border border-purple-100/60">
                          {property.images[0] ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-200" />
                          )}

                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#18181B] text-white shadow-xs">
                              {property.transactionType === "sale" ? "For Sale" : property.transactionType === "rent" ? "For Rent" : "Lease"}
                            </span>
                          </div>
                        </div>

                        {/* Title & Location */}
                        <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                          {property.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium my-2">
                          <FiMapPin className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                          <span>{property.city}, {property.state}</span>
                        </div>

                        {/* Specs Row */}
                        <div className="flex items-center gap-3 text-xs text-[#64748B] font-semibold my-3 pt-3 border-t border-purple-100/80">
                          <span className="flex items-center gap-1">
                            <FiMaximize2 className="w-3.5 h-3.5 text-neutral-400" />
                            {property.size.toLocaleString("en-IN")} sq.ft
                          </span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="flex items-center gap-1">
                            <BiBed className="w-4 h-4 text-neutral-400" />
                            {property.bedrooms} Bed
                          </span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="flex items-center gap-1">
                            <BiBath className="w-4 h-4 text-neutral-400" />
                            {property.bathrooms} Bath
                          </span>
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100/80">
                        <span className="text-lg font-extrabold text-[#111827]">
                          {formatPrice(property.price)}
                        </span>

                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAE4FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white text-xs font-extrabold transition-colors">
                          <span>View</span>
                          <FiArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>

                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full max-w-md bg-white h-full p-6 overflow-y-auto flex flex-col text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-6">
                <h3 className="font-bold text-[#111827] text-lg">Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-neutral-500">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {renderFilters()}

              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 mt-8 bg-[#18181B] text-white rounded-full font-bold text-xs shadow-md"
              >
                Apply Filters
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
