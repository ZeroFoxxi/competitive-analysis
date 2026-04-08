import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { swotData, COLORS } from "@/lib/data";
import { Shield, AlertTriangle, Lightbulb, Zap } from "lucide-react";

const swotConfig = [
  { key: "strengths" as const, label: "优势 Strengths", icon: Shield, color: "#2E7D32", bg: "#E8F5E9" },
  { key: "weaknesses" as const, label: "劣势 Weaknesses", icon: AlertTriangle, color: "#C62828", bg: "#FFEBEE" },
  { key: "opportunities" as const, label: "机会 Opportunities", icon: Lightbulb, color: "#1565C0", bg: "#E3F2FD" },
  { key: "threats" as const, label: "威胁 Threats", icon: Zap, color: "#E65100", bg: "#FFF3E0" },
];

export default function SwotSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeCompany, setActiveCompany] = useState<"leadong" | "globalso">("leadong");
  const data = swotData[activeCompany];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#F8F5F0] relative overflow-hidden">
      {/* CSS background decoration replacing CDN image */}
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-[0.06]">
        <div className="absolute top-[10%] right-[10%] w-48 h-48 rounded-full bg-gradient-to-br from-[#2980B9] to-[#5DADE2] blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-32 h-32 rounded-full bg-gradient-to-br from-[#D4782A] to-[#E8A04C] blur-2xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-semibold">Chapter 04</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            SWOT 战略分析
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9]" />
        </motion.div>

        {/* Company toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-3 mb-10"
        >
          <button
            onClick={() => setActiveCompany("leadong")}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeCompany === "leadong"
                ? "text-white shadow-lg scale-105"
                : "text-[#6B6B6B] bg-white/60 border border-[#E8DFD0] hover:bg-white"
            }`}
            style={activeCompany === "leadong" ? { backgroundColor: COLORS.leadong } : {}}
          >
            领动臻选版
          </button>
          <button
            onClick={() => setActiveCompany("globalso")}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeCompany === "globalso"
                ? "text-white shadow-lg scale-105"
                : "text-[#6B6B6B] bg-white/60 border border-[#E8DFD0] hover:bg-white"
            }`}
            style={activeCompany === "globalso" ? { backgroundColor: COLORS.globalso } : {}}
          >
            全球搜 SEO Plus
          </button>
        </motion.div>

        {/* SWOT Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {swotConfig.map((config, i) => {
            const Icon = config.icon;
            const items = data[config.key];
            return (
              <motion.div
                key={`${activeCompany}-${config.key}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#E8DFD0]/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon size={20} style={{ color: config.color }} />
                  </div>
                  <h3 className="font-bold text-[#1A1A2E]">{config.label}</h3>
                </div>
                <ul className="space-y-3">
                  {items.map((item, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 + j * 0.05 }}
                      className="flex items-start gap-3 text-sm text-[#4A4A4A] leading-relaxed"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
