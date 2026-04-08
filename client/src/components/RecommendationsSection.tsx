import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useData } from "@/contexts/DataContext";
import { ArrowUpRight, AlertCircle, Clock } from "lucide-react";

const priorityConfig = {
  "高": { color: "#C62828", bg: "#FFEBEE", icon: AlertCircle },
  "中": { color: "#E65100", bg: "#FFF3E0", icon: Clock },
  "低": { color: "#1565C0", bg: "#E3F2FD", icon: ArrowUpRight },
};

export default function RecommendationsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { recommendations } = useData();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* CSS background decoration replacing CDN image */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#D4782A]/20 via-transparent to-[#2980B9]/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,120,42,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(41,128,185,0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-semibold">Chapter 05</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            战略建议与行动方案
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9] mb-4" />
          <p className="text-[#6B6B6B] max-w-3xl leading-relaxed">
            基于以上分析，领动的核心优势在于服务深度和方法论体系。建议在保持这一优势的同时，重点补齐AI能力和内容产出的短板，采取「深度服务 + AI赋能」的差异化策略。
          </p>
        </motion.div>

        {/* Strategy banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-gradient-to-r from-[#1A1A2E] to-[#2C3E50] rounded-2xl p-8 mb-12 text-white"
        >
          <p className="text-xs tracking-widest uppercase text-[#D4C5A9] mb-3">核心竞争策略</p>
          <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            「有温度的智能化运营服务」
          </h3>
          <p className="text-sm text-[#B0B0B0] leading-relaxed max-w-3xl">
            将上门调研、专属顾问、系统化运营闭环等服务优势与AI技术深度融合，打造差异化品牌定位。在竞品强调工具和数据的同时，领动应强调"人+AI"的协同价值。
          </p>
        </motion.div>

        {/* Recommendation cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((rec, i) => {
            const config = priorityConfig[rec.priority];
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#E8DFD0]/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: config.bg, color: config.color }}
                  >
                    <Icon size={12} />
                    {rec.priority}优先级
                  </span>
                  <span className="text-xs text-[#BFAE96]">#{i + 1}</span>
                </div>
                <h4 className="font-bold text-[#1A1A2E] text-lg mb-3">{rec.area}</h4>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{rec.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
