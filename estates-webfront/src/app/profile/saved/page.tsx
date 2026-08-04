"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/auth";

interface SavedProperty {
  _id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: number;
  returnRate?: string;
}

function formatPrice(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return n.toLocaleString("en-IN");
}

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/users/saved").then(async (r) => {
      if (r.ok) { const d = await r.json(); setProperties(Array.isArray(d) ? d : []); }
      setLoading(false);
    });
  }, []);

  async function unsave(id: string) {
    setProperties((p) => p.filter((x) => x._id !== id));
    await authFetch(`/api/users/saved/${id}`, { method: "DELETE" });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Saved Properties</h1>
        <p className="text-neutral-500 text-sm">Your bookmarked listings.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => <div key={i} className="bg-white rounded-[32px] h-72 animate-pulse border border-neutral-100" />)}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {properties.map((p) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} key={p._id} className="relative">
                <Link href={`/properties/${p._id}`} className="bg-white rounded-[32px] overflow-hidden border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col group cursor-pointer hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                  <div className="relative w-full h-[200px] overflow-hidden">
                    {p.images[0] ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full bg-neutral-100" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-[#ff5a36] transition-colors line-clamp-1">{p.title}</h3>
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">{p.city}, {p.state}</p>
                    <div className="flex items-center gap-3 text-xs font-semibold text-neutral-500 mb-4">
                      <span>{p.bedrooms} bed</span><div className="w-px h-3 bg-neutral-200" /><span>{p.bathrooms} bath</span><div className="w-px h-3 bg-neutral-200" /><span>{p.size.toLocaleString("en-IN")} sq.ft.</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-neutral-100 pt-4">
                      <span className="text-base font-bold text-neutral-900">₹{formatPrice(p.price)}</span>
                      {p.returnRate && <span className="text-emerald-500 font-bold text-sm">{p.returnRate}</span>}
                    </div>
                  </div>
                </Link>
                <button onClick={() => unsave(p._id)} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-100 flex items-center justify-center text-red-500 hover:text-neutral-400 transition-colors shadow-sm">
                  <svg className="w-4 h-4 fill-current" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-[32px] py-20 px-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#ff5a36]/5 flex items-center justify-center text-[#ff5a36] mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No Saved Properties</h3>
          <p className="text-neutral-500 text-sm max-w-sm mb-8">Browse the listings and tap the heart icon to save properties here.</p>
          <Link href="/properties" className="px-6 py-3 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors">Explore Listings</Link>
        </div>
      )}
    </motion.div>
  );
}
