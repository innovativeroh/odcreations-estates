"use client";

import Header from "@/components/layout/Header";
import HousingHero from "@/components/sections/HousingHero";
import FeaturedCategories from "@/components/sections/FeaturedCategories";
import AdviceAndTools from "@/components/sections/AdviceAndTools";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import ExploreCities from "@/components/sections/ExploreCities";
import FAQ from "@/components/sections/FAQ";
import AdvertiseWithUs from "@/components/sections/AdvertiseWithUs";
import VideoTestimonials from "@/components/sections/VideoTestimonials";
import PreFooterSEO from "@/components/sections/PreFooterSEO";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen w-full pt-20">
      {/* Upgraded Housing-style Hero Section */}
      <HousingHero />

      {/* Featured Categories Section */}
      <FeaturedCategories />

      {/* Advice & Tools Section */}
      <AdviceAndTools />

      {/* Main Platform Sections */}
      <FeaturedProperties />

      {/* Explore Cities Section */}
      <ExploreCities />
      <FAQ />

      {/* Advertise With Us Section */}
      <AdvertiseWithUs />

      {/* Video Testimonials Section */}
      <VideoTestimonials />

      {/* Pre-Footer Bengaluru Property Options Directory */}
      <PreFooterSEO />
    </main>
  );
}
