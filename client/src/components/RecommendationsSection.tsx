import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useData } from "@/contexts/DataContext";
import { ArrowUpRight, AlertCircle, Clock, TrendingUp, TrendingDown, Zap, RefreshCw } from "lucide-react";

const priorityConfig = {
  "高": { color: "#C62828", bg: "#FFEBEE", icon: AlertCircle, label: "高优先级" },
  "中": { color: "#E65100", bg: "#FFF3E0", icon: Clock, label: "中优先级" },
  "低": { color: "#1565C0", bg: "#E3F2FD", icon: ArrowUpRight, label: "低优先级" },
};

export default function RecommendationsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { derivedRecommendations, derivedInsight, derivedStrategyCopy, winRateData, hasChanges } = useData();

  const verdictConfig = {
    "领先": { color: "#2E7D32", bg: "#E8F5E9", icon: TrendingUp },
    "持平": { color: "#E65100", bg: "#FFF3E0", icon: Zap },
    "落后": { color: "#C62828", bg: "#FFEBEE", icon: TrendingDown },
  };
  const verdictInfo = verdictConfig[derivedInsight.verdict];
  const VerdictIcon = verdictInfo.icon;

  return (
    <section id="recommendations" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
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
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              战略建议与行动方案
            </h2>
            {hasChanges && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                <RefreshCw size={11} />
                已根据最新数据更新
              </span>
            )}
          </div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9] mb-4" />
          <p className="text-[#6B6B6B] max-w-3xl leading-relaxed">
            以下建议由系统根据当前数据实时推导生成。当您修改价格、指标、对比项或雷达图评分后，建议内容将自动更新，始终反映最新的竞争态势。
          </p>
        </motion.div>

        {/* Competitive Insight Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4 mb-10"
        >
          {/* Overall verdict */}
          <div
            className="rounded-2xl p-5 border flex items-center gap-4"
            style={{ backgroundColor: verdictInfo.bg, borderColor: verdictInfo.color + "30" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: verdictInfo.color + "20" }}
            >
              <VerdictIcon size={22} style={{ color: verdictInfo.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8B7355] mb-1">综合竞争态势</p>
              <p className="text-xl font-bold" style={{ color: verdictInfo.color }}>
                {derivedInsight.verdict}
              </p>
              <p className="text-xs text-[#6B6B6B]">综合评分 {derivedInsight.overallScore}/100</p>
            </div>
          </div>

          {/* Our advantages */}
          <div className="rounded-2xl p-5 border border-[#E8DFD0]/60 bg-white/80">
            <p className="text-xs font-semibold text-[#2E7D32] mb-2 flex items-center gap-1">
              <TrendingUp size={12} /> 核心优势
            </p>
            {derivedInsight.ourAdvantages.length > 0 ? (
              <ul className="space-y-1">
                {derivedInsight.ourAdvantages.slice(0, 3).map((adv, i) => (
                  <li key={i} className="text-xs text-[#1A1A2E] flex items-start gap-1.5">
                    <span className="text-[#2E7D32] mt-0.5 flex-shrink-0">✓</span>
                    {adv}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8B7355]">暂无明显优势维度</p>
            )}
          </div>

          {/* Our weaknesses */}
          <div className="rounded-2xl p-5 border border-[#E8DFD0]/60 bg-white/80">
            <p className="text-xs font-semibold text-[#C62828] mb-2 flex items-center gap-1">
              <TrendingDown size={12} /> 需补强短板
            </p>
            {derivedInsight.ourWeaknesses.length > 0 ? (
              <ul className="space-y-1">
                {derivedInsight.ourWeaknesses.slice(0, 3).map((w, i) => (
                  <li key={i} className="text-xs text-[#1A1A2E] flex items-start gap-1.5">
                    <span className="text-[#C62828] mt-0.5 flex-shrink-0">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8B7355]">暂无明显弱势维度</p>
            )}
          </div>
        </motion.div>

        {/* Strategy banner - dynamic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-gradient-to-r from-[#1A1A2E] to-[#2C3E50] rounded-2xl p-8 mb-12 text-white"
        >
          <p className="text-xs tracking-widest uppercase text-[#D4C5A9] mb-3">核心竞争策略</p>
          <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            「{derivedStrategyCopy.headline}」
          </h3>
          <p className="text-sm text-[#B0B0B0] leading-relaxed max-w-3xl">
            {derivedStrategyCopy.body}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-[#8B9DC3]">
            <span>综合胜率：{winRateData.total > 0 ? Math.round((winRateData.leadongWins / winRateData.total) * 100) : 0}%</span>
            <span>·</span>
            <span>胜出 {winRateData.leadongWins} / {winRateData.total} 项</span>
          </div>
        </motion.div>

        {/* Recommendation cards - dynamic */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {derivedRecommendations.map((rec, i) => {
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
                    {config.label}
                  </span>
                  {rec.metric && (
                    <span className="text-xs text-[#BFAE96] font-mono">{rec.metric}</span>
                  )}
                </div>
                <h4 className="font-bold text-[#1A1A2E] text-lg mb-3">{rec.area}</h4>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{rec.detail}</p>
              </motion.div>
            );
          })}
        </div>

        {derivedRecommendations.length === 0 && (
          <div className="text-center py-16 text-[#8B7355]">
            <p className="text-lg font-semibold mb-2">暂无建议</p>
            <p className="text-sm">请先在编辑面板中填写竞品数据，系统将自动生成针对性建议。</p>
          </div>
        )}
      </div>
    </section>
  );
}
