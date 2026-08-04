"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-xs text-neutral-400 font-medium">Last updated: July 5, 2026</p>
          </div>

          <p className="text-neutral-500 text-sm md:text-base leading-relaxed">
            At BookUrVisit, we value the trust you place in us when sharing your personal details. This Privacy Policy details how we collect, process, audit, and secure your personal and financial information when utilizing our fractional real estate investment portal.
          </p>

          <div className="border-t border-neutral-100 my-8" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">1. Information We Collect</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              To verify accredited investor status and execute fractional share purchases, we collect:
            </p>
            <ul className="list-disc pl-5 text-neutral-500 text-sm space-y-2 leading-relaxed">
              <li>Personal identifiers (Full Name, email addresses, phone numbers, location details).</li>
              <li>KYC documents (government identity prints, tax identification codes, accreditation affidavits).</li>
              <li>Financial indices (linked bank coordinates, intended wire amounts, wallet logs).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">2. How We Utilize Your Data</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Your information is compiled strictly to:
            </p>
            <ul className="list-disc pl-5 text-neutral-500 text-sm space-y-2 leading-relaxed">
              <li>Confirm compliance with regulatory financial criteria (KYC/AML checks).</li>
              <li>Allocate fractional ownership portions and coordinate dividend payouts.</li>
              <li>Send transaction confirmation reports and security check digests.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">3. Information Protection</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              We leverage bank-grade cryptographic protocols (SSL/TLS encryptions) to safeguard financial transfers. Under no circumstances do we lease or sell user identity details to third-party marketing entities.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">4. User Rights & Deletion requests</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              You maintain the absolute right to audit, rectify, or delete your accumulated personal profiles. To request file deletions, you can initiate a formal application on our dedicated{" "}
              <Link href="/data-deletion" className="text-[#ff5a36] font-bold hover:underline">
                User Data Deletion
              </Link>{" "}
              portal.
            </p>
          </section>

        </motion.article>

      </div>
    </div>
  );
}
