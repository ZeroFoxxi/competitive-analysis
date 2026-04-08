import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export default function HeroSection() {
  const { companies, comparisonData, winRateData } = useData();
  const totalItems = winRateData.total;
  const totalDimensions = comparisonData.length;
  const priceTag = `${(companies.leadong.price / 10000).toFixed(1)}万 vs ${(companies.globalso.price / 10000).toFixed(1)}万 元/年`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Pure CSS background - no CDN images */}
      <div className="absolute inset-0 bg-[#F8F5F0]">
        {/* Warm gradient orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#D4782A]/12 to-[#E8A04C]/8 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#2980B9]/10 to-[#5DADE2]/6 blur-3xl" />
        <div className="absolute top-[30%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-[#D4C5A9]/15 to-transparent blur-2xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(26,26,46,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6 font-medium" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Competitive Analysis Report · 2026
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-[#1A1A2E]"
          style={{ fontFamily: "'Noto Serif SC', 'Playfair Display', serif" }}
        >
          外贸营销服务
          <br />
          <span className="bg-gradient-to-r from-[#D4782A] to-[#2980B9] bg-clip-text text-transparent">
            竞品深度分析
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center gap-8 mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#D4782A]" />
            <span className="text-lg text-[#4A4A4A] font-medium">领动臻选版</span>
          </div>
          <span className="text-2xl font-light text-[#BFAE96]">vs</span>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#2980B9]" />
            <span className="text-lg text-[#4A4A4A] font-medium">全球搜 SEO Plus</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="text-lg text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed mb-12"
          style={{ fontFamily: "'Source Sans 3', 'Noto Sans SC', sans-serif" }}
        >
          基于8大维度、46项指标的全方位对比分析，
          <br className="hidden sm:block" />
          为您的外贸独立站运营决策提供数据支撑
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[priceTag, `${totalItems}项指标对比`, `${totalDimensions}大分析维度`].map((tag, i) => (
            <span
              key={i}
              className="px-5 py-2 rounded-full text-sm font-medium border border-[#D4C5A9]/60 text-[#6B5B3E] bg-[#F8F5F0]/80 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-[#8B7355]"
        >
          <span className="text-xs tracking-widest uppercase">向下滚动</span>
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
