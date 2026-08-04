"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { authFetch } from "@/lib/auth";

interface Enquiry {
  _id: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
  property: { _id: string; title: string; price: number; images: string[]; city: string; state: string } | null;
}

const STATUS_STYLE: Record<string, string> = {
  new: "text-amber-600 bg-amber-50 border-amber-100",
  contacted: "text-emerald-600 bg-emerald-50 border-emerald-100",
  closed: "text-neutral-500 bg-neutral-50 border-neutral-100",
};

export default function ContactedPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/users/enquiries").then(async (r) => {
      if (r.ok) { const d = await r.json(); setEnquiries(Array.isArray(d) ? d : []); }
      setLoading(false);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">My Enquiries</h1>
        <p className="text-neutral-500 text-sm">Properties you've reached out about.</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[0,1].map((i) => <div key={i} className="bg-white rounded-[32px] h-32 animate-pulse border border-neutral-100" />)}</div>
      ) : enquiries.length > 0 ? (
        <div className="space-y-5">
          {enquiries.map((e) => (
            <div key={e._id} className="bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-[32px] p-6 flex flex-col md:flex-row gap-6 items-start">
              {e.property?.images?.[0] && (
                <div className="relative w-full md:w-36 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image src={e.property.images[0]} alt={e.property.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-grow space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    {e.property ? (
                      <Link href={`/properties/${e.property._id}`} className="text-lg font-bold text-neutral-900 hover:text-[#ff5a36] transition-colors">{e.property.title}</Link>
                    ) : <span className="text-lg font-bold text-neutral-400">Property unavailable</span>}
                    {e.property && <p className="text-xs text-neutral-400 font-semibold">{e.property.city}, {e.property.state}</p>}
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[e.status]}`}>{e.status}</span>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">{e.message}</p>
                <p className="text-[10px] text-neutral-400 font-semibold">{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-[32px] py-20 px-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#ff5a36]/5 flex items-center justify-center text-[#ff5a36] mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No Enquiries Yet</h3>
          <p className="text-neutral-500 text-sm max-w-sm mb-8">Submit an enquiry from any property page to track it here.</p>
          <Link href="/properties" className="px-6 py-3 bg-neutral-950 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors">Browse Properties</Link>
        </div>
      )}
    </motion.div>
  );
}
