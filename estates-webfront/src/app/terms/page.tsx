"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
        </div>

        {/* Article Body */}
        <motion.article 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] p-8 md:p-12 space-y-8"
        >
          <div>
            <span className="text-[#ff5a36] font-semibold text-xs mb-3 block tracking-wide uppercase">Legal Guidelines</span>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">Terms & Conditions</h1>
            <p className="text-xs text-neutral-400 font-medium">Last updated: July 5, 2026</p>
          </div>

          <p className="text-neutral-500 text-sm md:text-base leading-relaxed">
            Welcome to OD Creations. These Terms & Conditions govern your access to and use of our fractional real estate investment portal, mobile assets interface, and related financial distribution channels.
          </p>

          <div className="border-t border-neutral-100 my-8" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">1. Acceptance of Agreement</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              By accessing, browsing, or creating an account on the Estates platform, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you are prohibited from utilizing our investment services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">2. Fractional Share Ownership & Payouts</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Fractional real estate assets represent co-ownership rights managed through institutional trusts. Yield numbers represent target calculations and are not guaranteed, subject to market demand fluctuations and vacancy variances.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">3. Accredited Investor Representations</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Certain high-yield offerings are restricted to accredited investors. By applying for these slots, you represent that you satisfy the required minimum income and net worth parameters mandated by local securities laws.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">4. Governing Law</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              These Terms & Conditions are governed by the laws of India. Any litigation, mediation, or dispute resolution proceedings arising from the use of our services will be subject to the exclusive jurisdiction of the courts located in Bangalore, Karnataka, India.
            </p>
          </section>

        </motion.article>

      </div>
    </div>
  );
}
