import { motion } from "framer-motion";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { keyMetrics, COLORS } from "@/lib/data";
import { TrendingUp, TrendingDown, Equal, Zap } from "lucide-react";

function MetricBar({ label, leadong, globalso, unit, delay }: {
  label: string; leadong: number; globalso: number; unit: string; delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const maxVal = Math.max(leadong, globalso);
  const leadongPct = (leadong / maxVal) * 100;
  const globalsoPct = (globalso / maxVal) * 100;
  const leadongCount = useCountUp(leadong, 1800, 0, isVisible);
  const globalsoCount = useCountUp(globalso, 1800, 0, isVisible);

  const formatNum = (n: number) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + "万";
    return n.toLocaleString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="mb-6"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-[#4A4A4A]">{label}</span>
        <div className="flex gap-6 text-sm">
          <span style={{ color: COLORS.leadong }} className="font-bold">{formatNum(leadongCount)}{unit}</span>
          <span style={{ color: COLORS.globalso }} className="font-bold">{formatNum(globalsoCount)}{unit}</span>
        </div>
      </div>
      <div className="flex gap-1 h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${leadongPct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          className="rounded-l-full"
          style={{ backgroundColor: COLORS.leadong }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${globalsoPct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          className="rounded-r-full"
          style={{ backgroundColor: COLORS.globalso }}
        />
      </div>
    </motion.div>
  );
}

export default function OverviewSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-semibold">Chapter 01</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            核心指标概览
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9]" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: VS visual + company cards */}
          <div>
            {/* CSS-based VS visual replacing the CDN image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-2xl overflow-hidden mb-8 shadow-lg relative h-56"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4782A]/10 via-[#F8F5F0] to-[#2980B9]/10" />
              {/* Decorative circles */}
              <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-[#D4782A]/8 blur-2xl" />
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#2980B9]/8 blur-2xl" />
              {/* VS content */}
              <div className="relative z-10 h-full flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4782A] to-[#E8A04C] flex items-center justify-center mb-3 mx-auto shadow-md">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-[#D4782A]">领动臻选版</p>
                  <p className="text-xs text-[#8B7355] mt-1">深度服务型</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#2C3E50] flex items-center justify-center shadow-lg">
                    <Zap size={22} className="text-[#F5C88A]" />
                  </div>
                  <span className="text-xs font-bold text-[#8B7355] tracking-wider">VS</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2980B9] to-[#5DADE2] flex items-center justify-center mb-3 mx-auto shadow-md">
                    <TrendingDown size={28} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-[#2980B9]">全球搜 SEO Plus</p>
                  <p className="text-xs text-[#8B7355] mt-1">技术工具型</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {/* Leadong card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-5 rounded-xl border-2 border-[#D4782A]/20 bg-[#FFF8F0]"
              >
                <div className="w-8 h-1 rounded-full bg-[#D4782A] mb-3" />
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">领动</h3>
                <p className="text-xs text-[#6B6B6B] mb-3">臻选版</p>
                <p className="text-2xl font-bold text-[#D4782A]">22.8<span className="text-sm font-normal text-[#8B7355]">万/年</span></p>
              </motion.div>

              {/* Globalso card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-5 rounded-xl border-2 border-[#2980B9]/20 bg-[#F0F7FC]"
              >
                <div className="w-8 h-1 rounded-full bg-[#2980B9] mb-3" />
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">全球搜</h3>
                <p className="text-xs text-[#6B6B6B] mb-3">SEO Plus</p>
                <p className="text-2xl font-bold text-[#2980B9]">19.8<span className="text-sm font-normal text-[#8B7355]">万/年</span></p>
              </motion.div>
            </div>
          </div>

          {/* Right: Metric bars */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-[#E8DFD0]/50">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              关键数据对比
            </h3>
            <div className="flex items-center gap-6 mb-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.leadong }} />
                <span className="text-[#6B6B6B]">领动臻选版</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.globalso }} />
                <span className="text-[#6B6B6B]">全球搜 SEO Plus</span>
              </div>
            </div>
            {keyMetrics.map((m, i) => (
              <MetricBar
                key={m.label}
                label={m.label}
                leadong={m.leadong}
                globalso={m.globalso}
                unit={m.unit}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
