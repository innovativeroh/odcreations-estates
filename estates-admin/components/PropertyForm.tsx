"use client";

import { useState, useRef } from "react";
import { uploadToR2 } from "@/lib/api";
import toast from "react-hot-toast";

export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: string;
  size: string;
  bedrooms: string;
  bathrooms: string;
  type: string;
  status: string;
  targetAmount: string;
  featured: boolean;
  images: string[];
}

export const emptyForm = (): PropertyFormData => ({
  title: "",
  description: "",
  location: "",
  city: "",
  state: "",
  price: "",
  size: "",
  bedrooms: "0",
  bathrooms: "0",
  type: "apartment",
  status: "available",
  targetAmount: "",
  featured: false,
  images: [],
});

interface Props {
  initial?: PropertyFormData;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  submitLabel: string;
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-300 focus:bg-white transition-all";

const selectCls =
  "w-full bg-[#f8f9fa] border border-neutral-100 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-neutral-300 focus:bg-white transition-all appearance-none";

export default function PropertyForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<PropertyFormData>(initial ?? emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof PropertyFormData, val: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToR2(file, "properties");
      set("images", [...form.images, url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Basic Information</h3>

        <Field label="Property Title">
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Prestige Lakeside Villas, Phase II"
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            className={`${inputCls} resize-none`}
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Detailed description of the property..."
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <div className="relative">
              <select className={selectCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="plot">Plot</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>

          <Field label="Status">
            <div className="relative">
              <select className={selectCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="available">Available</option>
                <option value="funded">Funded</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set("featured", !form.featured)}
            className={`w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${form.featured ? "bg-neutral-950" : "bg-neutral-200"}`}
          >
            <span
              className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${form.featured ? "left-[22px]" : "left-0.5"}`}
            />
          </div>
          <span className="text-sm font-medium text-neutral-700">Feature on homepage</span>
        </label>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Location</h3>
        <Field label="Full Address / Area">
          <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Whitefield, Bengaluru" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City">
            <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Bengaluru" required />
          </Field>
          <Field label="State">
            <input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Karnataka" required />
          </Field>
        </div>
      </div>

      {/* Financials */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Financials</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Total Price (₹)">
            <input type="number" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="5000000" required min="0" />
          </Field>
          <Field label="Target Raise (₹)">
            <input type="number" className={inputCls} value={form.targetAmount} onChange={(e) => set("targetAmount", e.target.value)} placeholder="5000000" required min="0" />
          </Field>
        </div>
      </div>

      {/* Property details */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Property Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Size (sq ft)">
            <input type="number" className={inputCls} value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="1800" required min="0" />
          </Field>
          <Field label="Bedrooms">
            <input type="number" className={inputCls} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="3" min="0" />
          </Field>
          <Field label="Bathrooms">
            <input type="number" className={inputCls} value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="2" min="0" />
          </Field>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Images</h3>

        <div className="grid grid-cols-4 gap-3">
          {form.images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => set("images", form.images.filter((_, idx) => idx !== i))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
          >
            {uploading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[9px] font-semibold uppercase tracking-wide">Add Image</span>
              </>
            )}
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <p className="text-[10px] text-neutral-400">Images upload directly to Cloudflare R2. Accepted: JPG, PNG, WebP.</p>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3.5 bg-neutral-950 text-white font-bold text-sm rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-md shadow-neutral-950/10"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
