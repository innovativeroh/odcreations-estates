"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiSend } from "react-icons/fi";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const channels = [
  {
    icon: FiMail,
    label: "Email Us",
    value: "support@bookurvisit.in",
    sub: "Response within 24 hours",
  },
  {
    icon: FiPhone,
    label: "Call Toll Free",
    value: "+91 (800) 180-8888",
    sub: "Mon–Sat, 9am – 7pm IST",
  },
  {
    icon: FiMapPin,
    label: "Headquarters",
    value: "UB City Towers, MG Road",
    sub: "Bengaluru, Karnataka 560001",
  },
];

const topics = [
  "Property Buying / Site Visit Inquiry",
  "Selling or Listing a Property",
  "Home Services (Interiors / Movers / Agreement)",
  "Financial Tools & Home Loans",
  "NRI Real Estate Investment Desk",
  "Advertise With Us / Media Partner",
  "Other Assistance",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", topic: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main className="flex flex-col w-full pt-20 bg-[#F4F0FE] select-none text-left min-h-screen">

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 px-4 sm:px-6 md:px-12 border-b border-purple-200/80">
        <div className="max-w-[1380px] mx-auto w-full text-center flex flex-col items-center">
          <motion.div {...fadeUp(0)} className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
            <FiZap className="w-4 h-4" />
            <span>Support & Assistance</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.07)}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight tracking-tight max-w-3xl mb-4"
          >
            We'd love to hear from you
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="text-xs sm:text-sm text-[#64748B] max-w-xl leading-relaxed font-normal">
            Whether you're looking for a new home, scheduling a site visit, or seeking expert advice, our team at BookUrVisit is here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact Channels Grid */}
      <section className="w-full bg-white py-12 md:py-16 px-4 sm:px-6 md:px-12 border-b border-purple-200/80">
        <div className="max-w-[1380px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((c, i) => {
              const IconComp = c.icon;
              return (
                <motion.div
                  key={c.label}
                  {...fadeUp(i * 0.08)}
                  className="bg-[#F7F5FC] border border-purple-200/80 rounded-[24px] p-6 shadow-md flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center font-bold flex-shrink-0">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider">{c.label}</span>
                    <h3 className="text-base font-bold text-[#111827] mt-0.5">{c.value}</h3>
                    <p className="text-xs text-[#64748B] font-normal mt-1">{c.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Form Section */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-[1380px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Info Card */}
            <div className="lg:col-span-5 bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider mb-2">
                <FiZap className="w-4 h-4" />
                <span>Quick Advisory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-4">
                Schedule a 1-on-1 Consultation
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-normal leading-relaxed mb-6">
                Our property advisors offer personalized property recommendations, home loan assistance, legal checks, and site visit arrangements across India.
              </p>

              <div className="space-y-4 pt-4 border-t border-purple-100">
                <div className="flex items-center gap-3 text-xs font-bold text-[#111827]">
                  <div className="w-5 h-5 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Free Property Consultation</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#111827]">
                  <div className="w-5 h-5 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span>Verified Legal & RERA Checks</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#111827]">
                  <div className="w-5 h-5 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span>Free Cab Pickup for Site Visits</span>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="lg:col-span-7 bg-white border border-purple-100/80 rounded-[28px] p-6 sm:p-8 shadow-lg">
              {submitted ? (
                <div className="bg-[#FAF8FF] border border-purple-200/80 rounded-[22px] p-8 text-center">
                  <FiCheckCircle className="w-12 h-12 text-[#7C3AED] mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-[#111827] mb-2">Message Received!</h3>
                  <p className="text-xs text-[#64748B]">Thank you for reaching out. Our property expert will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-bold text-[#111827] mb-4">Send Us a Message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="rohan@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1.5">Inquiry Topic</label>
                      <select
                        name="topic"
                        required
                        value={formData.topic}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none cursor-pointer"
                      >
                        <option value="">Select a topic</option>
                        {topics.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider mb-1.5">Message / Details</label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="Tell us how we can help you with your property needs..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8FF] border border-purple-200/80 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Submit Message</span>
                    <FiSend className="w-4 h-4 text-amber-400" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
