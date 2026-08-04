"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiZap, FiCheckCircle, FiShield, FiTrendingUp, FiUsers, FiEye, FiArrowRight } from "react-icons/fi";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const stats = [
  { value: "₹8,000Cr+", label: "Total Invested" },
  { value: "20K+", label: "Happy Buyers" },
  { value: "150K+", label: "Properties Listed" },
  { value: "8–12%", label: "Avg. Return Value" },
];

const values = [
  {
    icon: FiShield,
    title: "Trust & Legal Audit",
    desc: "Every property listed on OD Creations is legally vetted with clean RERA title deeds before it ever reaches our platform.",
  },
  {
    icon: FiTrendingUp,
    title: "Data-Driven Research",
    desc: "Every listing is backed by deep market intelligence, rental yield estimates, and locality price growth analytics.",
  },
  {
    icon: FiUsers,
    title: "Inclusive Access",
    desc: "Premium real estate shouldn't require massive initial capital. Explore verified options starting from budget homes to luxury villas.",
  },
  {
    icon: FiEye,
    title: "Full Transparency",
    desc: "Live dashboards, direct owner connections, and 0 hidden fees — you always know where your money goes.",
  },
];

const team = [
  {
    name: "Vikram Malhotra",
    role: "Founder & CEO",
    image: "/james-r.png",
    bio: "Former real estate investment banker. Built OD Creations to democratise real estate for Indian buyers.",
  },
  {
    name: "Priya Sharma",
    role: "Head of Acquisitions",
    image: "/property-1.png",
    bio: "15+ years in real estate acquisitions across Bengaluru, Mumbai, and Delhi NCR markets.",
  },
  {
    name: "Arjun Mehta",
    role: "Chief Technology Officer",
    image: "/property-2.png",
    bio: "Ex-tech lead. Passionate about building fast, transparent, and secure prop-tech infrastructure.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex flex-col w-full pt-20 bg-[#F4F0FE] select-none text-left">

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 px-4 sm:px-6 md:px-12 border-b border-purple-200/80">
        <div className="max-w-[1380px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left text */}
            <div className="lg:col-span-7 flex flex-col">
              <motion.div {...fadeUp(0)} className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
                <FiZap className="w-4 h-4" />
                <span>Our Vision</span>
              </motion.div>

              <motion.h1
                {...fadeUp(0.07)}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight tracking-tight mb-6"
              >
                We believe smart property investments shouldn't require a fortune
              </motion.h1>

              <motion.p {...fadeUp(0.14)} className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-8 max-w-xl font-normal">
                OD Creations was built on a simple idea — verified Indian real estate should be transparent, accessible, and hassle-free for every home buyer and investor.
              </motion.p>

              <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 bg-[#18181B] hover:bg-[#27272A] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Browse Properties</span>
                  <FiArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white border border-purple-200/80 text-[#111827] hover:bg-[#F7F5FC] px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Talk to an Advisor</span>
                </Link>
              </motion.div>
            </div>

            {/* Right Card Image */}
            <motion.div
              {...fadeUp(0.1)}
              className="lg:col-span-5 relative rounded-[32px] overflow-hidden h-[340px] md:h-[420px] bg-white border border-purple-100/80 shadow-xl"
            >
              <Image src="/building-facade.png" alt="OD Creations HQ" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-[20px] border border-purple-100/80 shadow-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0 font-bold">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] font-extrabold uppercase">Platform Growth YTD</p>
                  <p className="text-sm font-extrabold text-[#111827]">+12.4% Average Return Value</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-white py-12 md:py-16 px-4 sm:px-6 md:px-12 border-b border-purple-200/80">
        <div className="max-w-[1380px] mx-auto w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp(i * 0.07)}
                className="bg-[#F7F5FC] border border-purple-200/80 rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center"
              >
                <span className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">{s.value}</span>
                <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider mt-1.5">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles & Values Section */}
      <section className="w-full bg-[#FAF8FF] py-16 md:py-24 px-4 sm:px-6 md:px-12 border-b border-purple-200/80">
        <div className="max-w-[1380px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
                <FiZap className="w-4 h-4" />
                <span>Our Principles</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
                Principles that guide every decision
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm font-normal">
              From property verification to deal closures — these values are baked into every layer of OD Creations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const IconComp = v.icon;
              return (
                <motion.div
                  key={v.title}
                  {...fadeUp(i * 0.08)}
                  className="bg-white border border-purple-100/80 rounded-[28px] p-6 shadow-md hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center mb-6 font-bold shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">{v.title}</h3>
                    <p className="text-xs text-[#64748B] font-normal leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full bg-white py-16 md:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-[1380px] mx-auto w-full">
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
                <FiZap className="w-4 h-4" />
                <span>Leadership</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
                The people behind OD Creations
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm font-normal">
              Experienced real estate operators and tech builders dedicated to elevating Indian real estate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp(i * 0.1)}
                className="bg-[#F7F5FC] border border-purple-200/80 rounded-[28px] p-5 shadow-md hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="relative w-full h-64 rounded-[22px] overflow-hidden bg-neutral-200 mb-5 flex-shrink-0">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1">{member.role}</span>
                <h3 className="text-lg font-bold text-[#111827] mb-2">{member.name}</h3>
                <p className="text-xs text-[#64748B] font-normal leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
