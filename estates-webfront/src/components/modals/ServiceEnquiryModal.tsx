"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiX, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiTruck, 
  FiFileText, 
  FiLayout, 
  FiCamera, 
  FiGlobe,
  FiZap,
  FiSend
} from "react-icons/fi";
import { FaPaintRoller } from "react-icons/fa6";
import toast from "react-hot-toast";

export const ALL_SERVICES = [
  {
    id: "packers-movers",
    title: "Packers & Movers",
    subtitle: "Safe, insured & hassle-free home relocation",
    badge: "New Offers",
    icon: FiTruck
  },
  {
    id: "rental-agreement",
    title: "Rental Agreement",
    subtitle: "Digital legal agreement with instant e-stamping",
    badge: "Instant E-Stamp",
    icon: FiFileText
  },
  {
    id: "painting-cleaning",
    title: "Painting & Cleaning",
    subtitle: "Professional deep home cleaning & fresh wall paint",
    badge: "Top Rated",
    icon: FaPaintRoller
  },
  {
    id: "interior-designers",
    title: "Interior Designers",
    subtitle: "Turnkey luxury interiors, modular kitchens & 3D space planning",
    badge: "Free 3D Consult",
    icon: FiLayout
  },
  {
    id: "click-earn",
    title: "Click & Earn",
    subtitle: "Post neighborhood property photos & win rewards",
    badge: "New Rewards",
    icon: FiCamera
  },
  {
    id: "nri-services",
    title: "Estates for NRIs",
    subtitle: "Dedicated property management & remote rental management",
    badge: "NRI Special",
    icon: FiGlobe
  }
];

interface ServiceEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
}

export default function ServiceEnquiryModal({
  isOpen,
  onClose,
  initialServiceId = "packers-movers"
}: ServiceEnquiryModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [timeframe, setTimeframe] = useState("Immediate");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  // Sync selected service when modal opens or initialServiceId changes
  useEffect(() => {
    if (isOpen) {
      setSelectedServiceId(initialServiceId || "packers-movers");
      setIsSubmitted(false);
    }
  }, [isOpen, initialServiceId]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentService = ALL_SERVICES.find(s => s.id === selectedServiceId) || ALL_SERVICES[0];
  const IconComponent = currentService.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !city.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call submit
    setTimeout(() => {
      const generatedRef = "REQ-" + Math.floor(100000 + Math.random() * 900000);
      setReferenceId(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Enquiry submitted successfully!");
    }, 1000);
  };

  const handleResetAndClose = () => {
    setFullName("");
    setPhone("");
    setCity("");
    setNotes("");
    setIsSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-md z-40 transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 w-full max-w-lg bg-white border border-purple-100 rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden text-left my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#18181B] via-[#27272A] to-[#18181B] p-6 text-white relative">
            <button
              onClick={handleResetAndClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex flex-col pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <FiZap className="w-3 h-3" /> Quick Enquiry
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold">
                    {currentService.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {currentService.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            {isSubmitted ? (
              /* Success Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                  <FiCheckCircle className="w-10 h-10" />
                </div>
                
                <h4 className="text-2xl font-extrabold text-neutral-900">Enquiry Received!</h4>
                <p className="text-sm text-neutral-600 font-normal mt-2 max-w-xs">
                  Thank you, <span className="font-bold text-neutral-900">{fullName}</span>. Our specialist for <span className="font-bold text-purple-700">{currentService.title}</span> will contact you shortly.
                </p>

                <div className="mt-6 bg-purple-50 border border-purple-100 rounded-2xl p-4 w-full text-center">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reference Code</span>
                  <div className="text-xl font-extrabold text-purple-700 tracking-wider mt-0.5">{referenceId}</div>
                  <span className="text-[11px] text-neutral-500 block mt-1">
                    ⚡ Estimated callback within 15 minutes
                  </span>
                </div>

                <button
                  onClick={handleResetAndClose}
                  className="mt-6 w-full bg-neutral-900 hover:bg-black text-white font-extrabold text-sm py-3.5 rounded-2xl transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              /* Enquiry Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Select Service Dropdown */}
                <div className="flex flex-col text-left">
                  <label className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                    <span>Select Service</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors cursor-pointer"
                  >
                    {ALL_SERVICES.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.title} ({srv.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name */}
                <div className="flex flex-col text-left">
                  <label className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <FiUser className="absolute left-3.5 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Phone & City (2 Columns on SM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="flex flex-col text-left">
                    <label className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                      <span>Phone Number</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <FiPhone className="absolute left-3.5 text-neutral-400 w-4 h-4" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="flex flex-col text-left">
                    <label className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                      <span>City / Locality</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <FiMapPin className="absolute left-3.5 text-neutral-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline Requirement */}
                <div className="flex flex-col text-left">
                  <label className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>When do you need this service?</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Immediate", "1 Week", "1 Month", "Planning"].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          timeframe === t
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="flex flex-col text-left">
                  <label className="text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                    <FiMessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Additional Requirements (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific requirements, 3BHK flat, relocation date..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold text-sm py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
