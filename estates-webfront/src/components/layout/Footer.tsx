import Link from "next/link";
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiPhone, FiMail, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-[#18181B] text-[#94A3B8] pt-16 md:pt-20 pb-10 border-t border-purple-900/40 relative z-20 select-none">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 text-left">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                <svg
                  viewBox="0 0 32 32"
                  className="w-8 h-8 transition-transform duration-300 group-hover:scale-105"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#7C3AED" />
                  <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="#FFFFFF" />
                  <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#7C3AED" />
                  <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="#FFFFFF" />
                  <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#7C3AED" />
                  <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="#FFFFFF" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-sans font-extrabold text-2xl tracking-tight text-white leading-none whitespace-nowrap">
                    BookUrVisit
                  </span>
                  <span className="font-sans text-[10px] text-[#7C3AED] tracking-widest font-extrabold mt-0.5 leading-none uppercase whitespace-nowrap">
                    REAL ESTATE
                  </span>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mb-6">
                India's premier technology-driven real estate platform for buying, renting, and verified property investments across top Indian metro cities.
              </p>

              <div className="flex flex-col gap-2.5 text-xs text-neutral-400 mb-8">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                  <span>UB City Towers, MG Road, Bengaluru, Karnataka</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                  <span>+91 (800) 180-8888 (Toll Free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                  <span>support@bookurvisit.in</span>
                </div>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <Link href="#" className="w-9 h-9 rounded-full bg-[#27272A] hover:bg-[#7C3AED] flex items-center justify-center text-white transition-colors">
                <FiFacebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-[#27272A] hover:bg-[#7C3AED] flex items-center justify-center text-white transition-colors">
                <FiInstagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-[#27272A] hover:bg-[#7C3AED] flex items-center justify-center text-white transition-colors">
                <FiTwitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-[#27272A] hover:bg-[#7C3AED] flex items-center justify-center text-white transition-colors">
                <FiLinkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Links Column 1: Property Types */}
          <div className="lg:col-span-2">
            <h4 className="text-white text-xs font-extrabold tracking-wider uppercase mb-5 border-l-2 border-[#7C3AED] pl-2.5">
              Property Types
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/properties?intent=buy" className="hover:text-white transition-colors">
                  Buy Ready Homes
                </Link>
              </li>
              <li>
                <Link href="/properties?intent=rent" className="hover:text-white transition-colors">
                  Rent Apartments
                </Link>
              </li>
              <li>
                <Link href="/properties?type=Villa" className="hover:text-white transition-colors">
                  Luxury Villas
                </Link>
              </li>
              <li>
                <Link href="/properties?intent=commercial" className="hover:text-white transition-colors">
                  Commercial Offices
                </Link>
              </li>
              <li>
                <Link href="/properties?intent=plots" className="hover:text-white transition-colors">
                  Plots & Land
                </Link>
              </li>
              <li>
                <Link href="/properties?type=Penthouses" className="hover:text-white transition-colors">
                  Penthouses
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Home Services */}
          <div className="lg:col-span-3">
            <h4 className="text-white text-xs font-extrabold tracking-wider uppercase mb-5 border-l-2 border-[#7C3AED] pl-2.5">
              Essential Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/contact?service=packers-movers" className="hover:text-white transition-colors">
                  Packers & Movers
                </Link>
              </li>
              <li>
                <Link href="/contact?service=rental-agreement" className="hover:text-white transition-colors">
                  Rental Agreement E-Stamp
                </Link>
              </li>
              <li>
                <Link href="/contact?service=painting-cleaning" className="hover:text-white transition-colors">
                  Painting & Cleaning
                </Link>
              </li>
              <li>
                <Link href="/contact?service=interior-designers" className="hover:text-white transition-colors">
                  Interior Designers
                </Link>
              </li>
              <li>
                <Link href="/contact?service=click-earn" className="hover:text-white transition-colors">
                  Click & Earn Rewards
                </Link>
              </li>
              <li>
                <Link href="/contact?service=nri-estates" className="hover:text-white transition-colors">
                  Estates for NRIs
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Tools & Company */}
          <div className="lg:col-span-3">
            <h4 className="text-white text-xs font-extrabold tracking-wider uppercase mb-5 border-l-2 border-[#7C3AED] pl-2.5">
              Tools & Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/contact?tool=emi-calculator" className="hover:text-white transition-colors">
                  Home Loan EMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/contact?tool=home-loan-offers" className="hover:text-white transition-colors">
                  Best Home Loan Offers
                </Link>
              </li>
              <li>
                <Link href="/contact?tool=interiors-estimator" className="hover:text-white transition-colors">
                  Interiors Budget Estimator
                </Link>
              </li>
              <li>
                <Link href="/contact?tool=rates-trends" className="hover:text-white transition-colors">
                  Rates & Market Trends
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/agent/login" className="hover:text-white transition-colors">
                  Agent CRM Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 my-6" />

        {/* Bottom Metadata & Legal Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} BookUrVisit Real Estate Technologies. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors">
              RERA Compliance
            </Link>
            <Link href="/cookie-settings" className="hover:text-white transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
