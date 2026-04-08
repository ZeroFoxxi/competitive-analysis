/**
 * 外贸营销型网站运营服务竞品分析报告
 * Design: Business Insight Magazine style
 * Color: Warm cream base, Leadong amber-orange, Globalso steel-blue
 * Typography: Playfair Display + Noto Serif SC for headings, Source Sans 3 + Noto Sans SC for body
 */

import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import OverviewSection from "@/components/OverviewSection";
import RadarSection from "@/components/RadarSection";
import ComparisonSection from "@/components/ComparisonSection";
import SwotSection from "@/components/SwotSection";
import RecommendationsSection from "@/components/RecommendationsSection";
import AnalysisToolSection from "@/components/AnalysisToolSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <NavBar />

      <div id="hero">
        <HeroSection />
      </div>

      <div id="overview">
        <OverviewSection />
      </div>

      <div id="radar">
        <RadarSection />
      </div>

      <div id="comparison">
        <ComparisonSection />
      </div>

      <div id="swot">
        <SwotSection />
      </div>

      <div id="recommendations">
        <RecommendationsSection />
      </div>

      <div id="tool">
        <AnalysisToolSection />
      </div>

      <Footer />
    </div>
  );
}
