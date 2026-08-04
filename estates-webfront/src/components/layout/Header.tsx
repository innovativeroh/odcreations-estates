"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredUser, clearAuth, type AuthUser } from "@/lib/auth";
import { FiMapPin, FiChevronDown, FiPlusCircle, FiUser, FiLogOut } from "react-icons/fi";

const CITIES = ["Bengaluru", "Mumbai", "Delhi NCR", "Goa", "Hyderabad", "Jaipur"];

type MenuNodeType = "category" | "custom_url" | "website_url";
type MenuVisibility = "always" | "logged_in" | "logged_out" | "role";

interface MenuNode {
  _id: string;
  label: string;
  type: MenuNodeType;
  url?: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  highlight: boolean;
  icon?: string;
  visibility: MenuVisibility;
  roles: string[];
  children: MenuNode[];
}

function isNodeVisible(node: MenuNode, user: AuthUser | null): boolean {
  switch (node.visibility) {
    case "logged_in":
      return !!user;
    case "logged_out":
      return !user;
    case "role":
      return !!user && Array.isArray(node.roles) && node.roles.includes(user.role);
    case "always":
    default:
      return true;
  }
}

function filterMenuTree(nodes: MenuNode[] | undefined, user: AuthUser | null): MenuNode[] {
  if (!nodes) return [];
  return nodes
    .filter((node) => isNodeVisible(node, user))
    .map((node) => ({ ...node, children: filterMenuTree(node.children, user) }))
    .filter((node) => node.type !== "category" || node.children.length > 0);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const postPropertyHref = user ? "/profile/post-property" : "/login?next=/profile/post-property";

  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string | null>(null);

  const [rawMenuTree, setRawMenuTree] = useState<MenuNode[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuNode[]>([]);

  useEffect(() => {
    setUser(getStoredUser());
    const handler = () => setUser(getStoredUser());
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${API}/api/menu`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data: MenuNode[]) => setRawMenuTree(Array.isArray(data) ? data : []))
      .catch(() => setRawMenuTree([]));
  }, []);

  useEffect(() => {
    setMenuCategories(filterMenuTree(rawMenuTree, user));
  }, [rawMenuTree, user]);

  useEffect(() => {
    const syncLocationVal = (e: Event) => {
      setSelectedCity((e as CustomEvent).detail);
    };
    window.addEventListener("home-location-sync", syncLocationVal);
    window.addEventListener("header-location-change", syncLocationVal);

    return () => {
      window.removeEventListener("home-location-sync", syncLocationVal);
      window.removeEventListener("header-location-change", syncLocationVal);
    };
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    window.dispatchEvent(new CustomEvent("header-location-change", { detail: city }));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F0FE]/90 backdrop-blur-md border-b border-purple-200/60 h-20 shadow-xs transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4 relative select-none">
        
        {/* Left Brand & City Selector */}
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <svg
              viewBox="0 0 32 32"
              className="w-8 h-8 transition-transform duration-300 group-hover:scale-105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#7C3AED" />
              <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="#18181B" />
              <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#7C3AED" />
              <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="#18181B" />
              <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#7C3AED" />
              <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="#18181B" />
            </svg>
            <div className="flex flex-col text-left">
              <span className="font-sans font-extrabold text-xl tracking-tight text-[#111827] leading-none whitespace-nowrap">
                BookUrVisit
              </span>
              <span className="font-sans text-[10px] text-[#7C3AED] tracking-widest font-extrabold mt-0.5 leading-none uppercase whitespace-nowrap">
                REAL ESTATE
              </span>
            </div>
          </Link>

          {/* City Selector Pill */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 md:py-2 rounded-full bg-white hover:bg-[#FAF8FF] text-xs font-extrabold text-[#111827] transition-all cursor-pointer border border-purple-200/80 shadow-xs whitespace-nowrap"
            >
              <FiMapPin className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
              <span className="whitespace-nowrap">{selectedCity}</span>
              <FiChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            </button>

            <AnimatePresence>
              {showCityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full left-0 mt-2 w-52 bg-white border border-purple-100 rounded-2xl shadow-2xl p-2 z-50 text-[#111827]"
                >
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider border-b border-purple-100 mb-1">
                    Select City
                  </div>
                  {CITIES.map((city) => (
                    <div
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`px-3 py-2 hover:bg-[#F4F0FE] rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        city === selectedCity ? "text-[#7C3AED] bg-[#EAE4FF]" : "text-[#111827]"
                      }`}
                    >
                      {city}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Navigation Dropdowns */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full flex-shrink-0">
          {menuCategories.map((cat) => (
            <div
              key={cat._id}
              className="relative h-full flex items-center flex-shrink-0"
              onMouseEnter={() => setActiveMenuCategory(cat.label)}
              onMouseLeave={() => setActiveMenuCategory(null)}
            >
              <button className="flex items-center gap-1 text-xs md:text-sm font-extrabold text-[#111827] hover:text-[#7C3AED] transition-colors py-2 cursor-pointer whitespace-nowrap">
                <span className="whitespace-nowrap">{cat.label}</span>
                <FiChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              </button>

              <AnimatePresence>
                {activeMenuCategory === cat.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute top-full left-0 mt-0 w-64 bg-white border border-purple-100 rounded-2xl shadow-2xl p-2.5 z-50 text-[#111827]"
                  >
                    {cat.children.map((item) =>
                      item.type === "website_url" && item.openInNewTab ? (
                        <a
                          key={item._id}
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setActiveMenuCategory(null)}
                          className={`block px-3.5 py-2 hover:bg-[#F4F0FE] rounded-xl text-xs font-bold transition-colors ${
                            item.highlight ? "text-[#7C3AED] font-extrabold bg-[#EAE4FF]" : "text-[#111827] hover:text-[#7C3AED]"
                          }`}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item._id}
                          href={item.url || "#"}
                          {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          onClick={() => setActiveMenuCategory(null)}
                          className={`block px-3.5 py-2 hover:bg-[#F4F0FE] rounded-xl text-xs font-bold transition-colors ${
                            item.highlight ? "text-[#7C3AED] font-extrabold bg-[#EAE4FF]" : "text-[#111827] hover:text-[#7C3AED]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right Utilities & Account */}
        <div className="hidden md:flex items-center gap-3 xl:gap-4 flex-shrink-0">
          <Link
            href={postPropertyHref}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold border border-purple-200/80 transition-all shadow-md hover:scale-105 whitespace-nowrap flex-shrink-0"
          >
            <FiPlusCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="whitespace-nowrap">Post Property</span>
            <span className="bg-amber-400 text-[#18181B] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ml-0.5 whitespace-nowrap">
              FREE
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 border-l border-purple-200/80 pl-3 flex-shrink-0">
              <Link href="/profile" className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-200 text-xs font-bold text-[#111827] transition-all bg-white hover:bg-[#F4F0FE] whitespace-nowrap shadow-xs">
                <div className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate whitespace-nowrap">{user.name}</span>
              </Link>
              <button
                onClick={() => { clearAuth(); router.push("/"); }}
                title="Sign Out"
                className="p-2 text-neutral-500 hover:text-[#7C3AED] transition-colors flex-shrink-0 cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-purple-200/80 pl-3 flex-shrink-0">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-[#18181B] hover:bg-[#27272A] text-xs font-bold text-white transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md"
              >
                <FiUser className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="whitespace-nowrap">Login</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 md:hidden text-[#111827] hover:text-[#7C3AED] focus:outline-none flex-shrink-0 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 right-0 bg-white border-b-2 border-[#18181B] shadow-2xl px-6 py-6 flex flex-col gap-5 md:hidden z-50 text-[#111827] max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider">Navigation Menu</span>
              <Link
                href={postPropertyHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-full border border-[#18181B]"
              >
                Post Property FREE
              </Link>
            </div>

            {menuCategories.map((cat) => (
              <div key={cat._id} className="flex flex-col gap-2 text-left">
                <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider">{cat.label}</span>
                <div className="grid grid-cols-1 gap-1 pl-2">
                  {cat.children.map((item) =>
                    item.type === "website_url" && item.openInNewTab ? (
                      <a
                        key={item._id}
                        href={item.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-xs font-bold py-1.5 transition-colors ${
                          item.highlight ? "text-[#7C3AED] font-extrabold" : "text-[#111827] hover:text-[#7C3AED]"
                        }`}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item._id}
                        href={item.url || "#"}
                        {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-xs font-bold py-1.5 transition-colors ${
                          item.highlight ? "text-[#7C3AED] font-extrabold" : "text-[#111827] hover:text-[#7C3AED]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className="border-t border-purple-100 pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl border border-purple-200 text-xs font-bold text-[#111827]">
                    My Profile ({user.name})
                  </Link>
                  <button onClick={() => { clearAuth(); setIsMobileMenuOpen(false); router.push("/"); }} className="w-full text-center py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-bold">
                  Login to Account
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
