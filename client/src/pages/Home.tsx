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
import EditPanel from "@/components/EditPanel";
import { useData } from "@/contexts/DataContext";
import { Pencil, MessageSquare } from "lucide-react";

function FloatingEditButton() {
  const { setEditPanelOpen, setEditSection, hasChanges, userNotes } = useData();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      {hasChanges && (
        <div className="bg-[#D4782A] text-white text-[10px] px-2 py-1 rounded-full text-center animate-pulse">
          已修改
        </div>
      )}
      {userNotes.length > 0 && (
        <button
          onClick={() => {
            setEditSection("notes");
            setEditPanelOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-[#E8DFD0] flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all group relative"
        >
          <MessageSquare size={18} className="text-[#8B7355]" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4782A] text-white text-[10px] flex items-center justify-center font-bold">
            {userNotes.length}
          </span>
        </button>
      )}
      <button
        onClick={() => {
          setEditSection("overview");
          setEditPanelOpen(true);
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4782A] to-[#B8621F] shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all text-white"
        title="打开数据编辑面板"
      >
        <Pencil size={20} />
      </button>
    </div>
  );
}

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

      {/* Floating edit button & panel */}
      <FloatingEditButton />
      <EditPanel />
    </div>
  );
}
