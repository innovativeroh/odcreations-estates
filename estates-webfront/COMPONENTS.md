# Reusable Components & Design Tokens Guide — BookUrVisit

This document lists the design system, color palette tokens, reusable component layouts, and vector assets used in the **BookUrVisit Webfront** project to maintain visual consistency across all pages.

---

## 🎨 1. Design System & Color Palette Tokens

The hero section and design system use a curated modern pastel-lavender & high-contrast dark aesthetic:

### Primary Palette Tokens
- **Background Soft Lavender Canvas**: `#F4F0FE` / `#F6F3FF`
- **Accent Purple / Violet**: `#7C3AED` (Primary interactive highlights, badges, checkmarks)
- **Soft Lilac Badge Background**: `#EAE4FF` / `#E6DBFF` (Icon containers, avatar background frames)
- **Deep Midnight / Off-Black**: `#18181B` (Strong borders, primary CTA buttons, statement banners)
- **Primary Text Charcoal**: `#111827` (Headlines, titles, card labels)
- **Muted Slate Gray**: `#64748B` / `#94A3B8` (Subtitles, filter category labels, advisor role titles)
- **Advisor Social Pill Color**: `#524B6B` (Social media action buttons on advisor card)
### Section Color Hierarchy
- **Hero Section (`HousingHero`)**: Soft Lavender Canvas (`bg-[#F4F0FE]`)
- **Essential Services (`FeaturedCategories`)**: Warm Pastel Off-White Canvas (`bg-[#F7F5FC]`) with solid white black-bordered cards (`bg-white border-2 border-[#18181B]`).
- **Advice & Tools (`AdviceAndTools`)**: Crisp Studio White Canvas (`bg-white`) with soft lilac tinted cards (`bg-[#F8F5FF] border-2 border-[#18181B]`).

---

## 🏗️ 2. Hero Section Architecture & Components

The hero section consists of a **two-column layout**:
- **Left Column**: High-impact headline, subtext, and a 3-option segmented dropdown filter bar with a dark action button.
- **Right Column**: Dual-card visual composition with 2px solid black borders, rounded corners (`32px`/`36px`), a floating Property Advisor profile card, and a background architectural sketch linework.

---

## 🧩 3. Key Component Specs & Code Snippets

### A. Architectural Blueprint Linework SVG Background

Renders subtle vector building outlines on the right side of the canvas to give an artistic real-estate blueprint effect.

```tsx
<div className="absolute right-0 top-0 bottom-0 w-full lg:w-[65%] pointer-events-none opacity-80 z-0 overflow-hidden">
  <svg
    viewBox="0 0 900 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full object-right object-contain"
  >
    <g stroke="#D6C5FB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
      {/* High-rise tower outlines */}
      <path d="M720 100 V780 H880 V100 Z" />
      <path d="M720 100 L760 60 H880 L880 100" />
      {/* Window matrix grid */}
      <path d="M740 140 H770 V180 H740 Z M790 140 H820 V180 H790 Z" />
      {/* Ground horizon line */}
      <path d="M400 780 H900" strokeWidth="2" />
    </g>
  </svg>
</div>
```

---

### B. Segmented Dropdown Search / Filter Console

A rounded pill container featuring 3 parameter sections (Location, Price, Type of Property) with circle icon badges and interactive dropdown menus, paired with a solid dark **Browse** button.

```tsx
<div className="w-full max-w-[660px] bg-white border-2 border-[#18181B] rounded-[28px] p-2.5 sm:p-3 shadow-md">
  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
    
    {/* Filter Item Example */}
    <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F8F6FF] cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center">
        <FiMapPin className="w-5 h-5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[11px] font-medium text-[#94A3B8]">Location</span>
        <span className="text-sm font-bold text-[#111827] flex items-center gap-1">
          Bengaluru, India <FiChevronDown className="w-4 h-4 text-[#64748B]" />
        </span>
      </div>
    </div>

    <div className="hidden md:block w-[1px] h-8 bg-neutral-200" />

    {/* Action Button */}
    <button className="bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-sm px-8 py-3.5 rounded-[18px]">
      Browse
    </button>
  </div>
</div>
```

---

### C. Floating Property Advisor Profile Card

Positioned over the top right corner of the primary property card. Displays agent info, social media buttons, and avatar photo in a lavender frame.

```tsx
<div className="absolute -top-6 -right-4 sm:-right-8 z-30 bg-white border-2 border-[#18181B] rounded-[22px] p-3.5 flex items-center gap-3.5 shadow-xl">
  <div className="flex flex-col text-left">
    <span className="font-bold text-sm text-[#111827]">Rohan Sharma</span>
    <span className="text-[11px] text-[#64748B] font-medium mb-2">Property Advisor</span>
    
    {/* Social Buttons */}
    <div className="flex items-center gap-1.5">
      <a href="tel:..." className="w-6 h-6 rounded-full bg-[#524B6B] hover:bg-[#7C3AED] text-white flex items-center justify-center">
        <FiPhone className="w-3 h-3" />
      </a>
    </div>
  </div>

  {/* Advisor Avatar */}
  <div className="w-14 h-16 rounded-xl bg-[#E6DBFF] overflow-hidden relative">
    <Image src={avatarUrl} alt="Advisor Photo" fill className="object-cover object-top" />
  </div>
</div>
```

---

### D. Dual Hero Property Image Card Framing System

```tsx
{/* Card 1: Suburban House + Dark Bottom Banner */}
<div className="relative flex flex-col w-full max-w-[370px]">
  {/* Top Image Frame */}
  <div className="w-full h-[250px] border-2 border-[#18181B] rounded-t-[32px] overflow-hidden bg-neutral-200 relative">
    <Image src={cottageImage} alt="Dream Villa in India" fill className="object-cover" />
  </div>

  {/* Attached Statement Banner */}
  <div className="w-full bg-[#18181B] border-2 border-t-0 border-[#18181B] rounded-b-[32px] p-5 text-white">
    <p className="text-xs sm:text-sm text-neutral-300">
      We provide top-rated verified properties with complete legal checks across India
    </p>
  </div>
</div>

{/* Card 2: Modern Tall Apartment Building Card */}
<div className="w-full max-w-[270px] h-[400px] border-2 border-[#18181B] rounded-[36px] overflow-hidden bg-neutral-200 relative shadow-xl">
  <Image src={apartmentBuildingImage} alt="Modern High-Rise Property" fill className="object-cover" />
</div>
```

---

### E. On-Demand Essential Property Services Cards Grid

Renders 6 high-value value-added property services (Packers & Movers, Rental Agreement, Painting & Cleaning, Pay Tuition & Rent, Click & Earn, Estates for NRIs) with custom icon containers, star pill badges, and dark borders.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Link
    href="/contact?service=packers-movers"
    className="bg-white border-2 border-[#18181B] rounded-[28px] p-6 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
  >
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="w-14 h-14 rounded-2xl bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center">
        <FiTruck className="w-7 h-7" />
      </div>
      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#7C3AED] text-white uppercase">
        New Offers
      </span>
    </div>

    <div className="flex flex-col text-left mb-6">
      <h3 className="text-xl font-bold text-[#111827]">Packers & Movers</h3>
      <p className="text-xs text-[#64748B] mt-2">Safe, insured & hassle-free home relocation</p>
    </div>

    <div className="pt-4 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-[#111827]">
      <span>Avail Service</span>
      <FiArrowUpRight className="w-4 h-4" />
    </div>
  </Link>
</div>
```

---

### F. Featured Properties Infinite Marquee Carousel

Renders an interactive infinite horizontal scroll marquee with pause-on-hover capability and edge-fade gradient masks on a soft pastel lavender canvas (`bg-[#F4F0FE]`). Uses solid 2px black outline property cards (`border-2 border-[#18181B] rounded-[28px]`), top image frames, Indian pricing (`₹2.4 Cr`), location badges, bed/bath/sq.ft metrics, and interactive `"View Details"` action triggers.

```tsx
<div className="bg-white border-2 border-[#18181B] rounded-[28px] p-5 shadow-md hover:shadow-xl transition-all">
  <div className="relative h-[240px] rounded-[22px] overflow-hidden mb-4">
    <Image src={propertyImage} alt="Property" fill className="object-cover" />
    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-[#18181B] text-white">
      For Sale
    </span>
  </div>

  <h3 className="text-xl font-bold text-[#111827]">Opera Ananda Villa</h3>
  <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium my-2">
    <FiMapPin className="text-[#7C3AED]" /> Whitefield, Bengaluru
  </div>

  <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100">
    <span className="text-xl font-extrabold text-[#111827]">₹2.4 Cr</span>
    <span className="px-3.5 py-1.5 rounded-xl bg-[#EAE4FF] text-[#7C3AED] font-extrabold text-xs">
      View Details
    </span>
  </div>
</div>
---

### G. Explore Top Cities Component System

Renders city location showcases using Unsplash imagery, solid 2px black outline frames (`border-2 border-[#18181B] rounded-[28px]`), dark gradient overlays, location badges, property counts, and interactive `"Explore ↗"` buttons for Jaipur, Bengaluru, Delhi NCR, Mumbai, and Hyderabad.

```tsx
<div className="bg-white border-2 border-[#18181B] rounded-[28px] overflow-hidden relative h-[360px]">
  <Image src={cityUnsplashImage} alt="Jaipur" fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

  <div className="absolute top-4 left-4">
    <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/90 text-[#111827]">
      The Pink City
    </span>
  </div>

  <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between text-white">
    <div>
      <h3 className="text-3xl font-bold">Jaipur</h3>
      <span className="text-sm text-neutral-300">1,200+ Properties</span>
    </div>
    <span className="px-4 py-2 rounded-xl bg-white text-[#111827] font-extrabold text-xs">
      Explore ↗
    </span>
  </div>
</div>
```

---

### H. FAQ Accordion Component System

Renders interactive collapsible question items using solid 2px black outline cards (`border-2 border-[#18181B] rounded-[22px]`), purple plus/minus toggle buttons (`bg-[#EAE4FF] text-[#7C3AED]`), and a consultation card for free advisor inquiries.

```tsx
<div className="bg-white border-2 border-[#18181B] rounded-[22px] p-5 shadow-sm">
  <button className="w-full text-left flex items-center justify-between gap-4">
    <span className="text-lg font-bold text-[#111827]">
      How does the real estate investment process work?
    </span>
    <span className="w-8 h-8 rounded-full bg-[#EAE4FF] text-[#7C3AED] flex items-center justify-center font-extrabold">
      +
    </span>
  </button>
</div>
```

---

### I. Advertise With Us Media Partner Component System

Renders developer partnership benefit cards and 2 featured project advertisement cards (*DLF Sky Villas & Godrej Woodsville*) using high-res Unsplash imagery, solid 2px black outline frames (`border-2 border-[#18181B] rounded-[32px]`), builder offer badges, and interactive CTA buttons.

```tsx
<div className="bg-white border-2 border-[#18181B] rounded-[32px] overflow-hidden shadow-md">
  <div className="relative h-[280px]">
    <Image src={adImage} alt="Project Ad" fill className="object-cover" />
    <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase bg-[#18181B] text-white">
      Sponsored • Featured Project
    </span>
  </div>

  <div className="p-6">
    <h3 className="text-2xl font-bold text-[#111827]">DLF Sky Villas</h3>
    <p className="text-xs text-[#64748B] mt-2">4 & 5 BHK Ultra-Luxury Residences</p>
    <div className="mt-4 p-3 bg-[#FAF8FF] border border-purple-200 rounded-2xl text-xs font-bold text-[#111827]">
      Pre-Launch Privilege: Save up to ₹25 Lakhs on Spot Booking
    </div>
  </div>
</div>
```

---

### J. Pre-Footer Property Options Directory (Bengaluru)

Renders a 4-column search directory titled **"Property Options in Bengaluru"** with Buy/Rent pill toggles inside a solid 2px black outline container frame (`border-2 border-[#18181B] rounded-[32px]`). Includes Popular Residential Searches, BHK Searches, Flat Locality Searches, and House/Commercial Searches for Bengaluru.

```tsx
<div className="bg-white border-2 border-[#18181B] rounded-[32px] p-8 shadow-md">
  <div className="flex items-center justify-between pb-6 mb-8 border-b border-purple-100">
    <h2 className="text-3xl font-bold text-[#111827]">Property Options in Bengaluru</h2>
    <div className="flex gap-2">
      <button className="px-5 py-2 rounded-full bg-[#18181B] text-white text-xs font-extrabold">Buy</button>
      <button className="px-5 py-2 rounded-full text-[#64748B] text-xs font-extrabold">Rent</button>
    </div>
  </div>

  <div className="grid grid-cols-4 gap-8">
    {/* 4 Search Columns */}
  </div>
</div>
```

---

### K. Global Header & Footer Design System Alignment

- **Header Navbar**: `fixed top-0 left-0 right-0 z-50 bg-[#F4F0FE]/90 backdrop-blur-md border-b-2 border-[#18181B]/15 h-20 shadow-xs`
- **City Selector Pill**: `bg-white border-2 border-[#18181B] rounded-full px-3.5 py-2 font-extrabold text-[#111827]`
- **Post Property Button**: `bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-2 border-[#18181B] rounded-full px-4.5 py-2 text-xs font-extrabold shadow-sm`
- **User Account Pill**: `bg-[#18181B] text-white border-2 border-[#18181B] rounded-full px-5 py-2 text-xs font-bold`
- **Footer Container**: `bg-[#18181B] text-[#94A3B8] pt-20 pb-10 border-t-2 border-[#18181B]` with purple left-bordered column titles (`border-l-2 border-[#7C3AED]`).

---

## 🚀 4. Full Application Migration Status

All primary routes and user interfaces across the **BookUrVisit** platform have been fully migrated to the unified design system:

1. **Home Page (`/`)**: Hero console, Home Services, Advice & Tools, Infinite Marquee Properties, Explore Cities, FAQs, Advertise With Us, Video Testimonials (Interactive Lightbox Modal), and Pre-Footer Bengaluru directory.
2. **Real Estate Directory (`/properties`)**: Filter sidebar, range sliders, city selection, sorting, and responsive property cards.
3. **Property Details Page (`/properties/[id]`)**: Hero gallery composition, specs overview, price highlights, amenities grid, inquiry advisor card, Related Properties recommendations section, and Property Options Directory.
4. **About Us Page (`/about`)**: Company story, statistics grid, core principles, and leadership team showcase.
5. **Contact Us Page (`/contact`)**: Support channels, consultation inquiry form, and topic selectors.
6. **Authentication Pages (`/login`, `/signup`)**: Auth card containers, input fields, and brand showcases.
7. **User Profile Dashboard (`/profile`, `/profile/*`)**: User profile layout, quick action cards, and navigation drawer.

### 🎨 Global Styling Standards:
- **Canvas Colors**: Soft Lavender (`bg-[#F4F0FE]`), Off-White Lavender Tint (`bg-[#F7F5FC]`), Studio White (`bg-white`).
- **Cards & Containers**: Sleek modern luxury cards with delicate purple borders (`border border-purple-100/80`), soft ambient drop shadows (`shadow-[0_10px_30px_rgba(0,0,0,0.03)]`), and smooth hover elevation (`hover:shadow-2xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300`).
- **Accents & Buttons**: Royal Violet badge accents (`#7C3AED`), midnight CTA buttons (`#18181B`), and gold micro-badges (`#F59E0B`).
