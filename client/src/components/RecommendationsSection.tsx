import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useData } from "@/contexts/DataContext";
import type { AiStrategy } from "@/contexts/DataContext";
import { ArrowUpRight, AlertCircle, Clock, TrendingUp, TrendingDown, Zap, RefreshCw, Sparkles, CheckCircle } from "lucide-react";

const priorityConfig = {
  "高": { color: "#C62828", bg: "#FFEBEE", icon: AlertCircle, label: "高优先级" },
  "中": { color: "#E65100", bg: "#FFF3E0", icon: Clock, label: "中优先级" },
  "低": { color: "#1565C0", bg: "#E3F2FD", icon: ArrowUpRight, label: "低优先级" },
};

export default function RecommendationsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const {
    derivedRecommendations,
    derivedInsight,
    derivedStrategyCopy,
    winRateData,
    hasChanges,
    companies,
    comparisonData,
    radarData,
    keyMetrics,
    swotData,
    aiStrategy,
    setAiStrategy,
  } = useData();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);

  // Decide which data to display: AI-generated (if available) or rule-based
  const displayInsight = aiStrategy
    ? {
        verdict: aiStrategy.overallStatus,
        overallScore: aiStrategy.overallScore,
        ourAdvantages: [] as string[],
        ourWeaknesses: [] as string[],
      }
    : derivedInsight;

  const displayStrategy = aiStrategy
    ? { headline: aiStrategy.strategySummary, body: aiStrategy.strategyDetail }
    : derivedStrategyCopy;

  const displayRecommendations = aiStrategy
    ? aiStrategy.recommendations.map((r) => ({
        priority: r.priority,
        area: r.title,
        detail: r.detail,
        metric: r.area,
      }))
    : derivedRecommendations;

  const verdictConfig = {
    "领先": { color: "#2E7D32", bg: "#E8F5E9", icon: TrendingUp },
    "持平": { color: "#E65100", bg: "#FFF3E0", icon: Zap },
    "落后": { color: "#C62828", bg: "#FFEBEE", icon: TrendingDown },
  };
  const verdictInfo = verdictConfig[displayInsight.verdict] || verdictConfig["持平"];
  const VerdictIcon = verdictInfo.icon;

  // AI advantages/weaknesses from rule-based (always available)
  const ourAdvantages = derivedInsight.ourAdvantages;
  const ourWeaknesses = derivedInsight.ourWeaknesses;

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setJustGenerated(false);

    try {
      // Convert radarData to array format for API
      const radarArray = radarData.dimensions.map((dim: string, i: number) => ({
        dimension: dim,
        leadong: radarData.leadong[i],
        globalso: radarData.globalso[i],
      }));

      const response = await fetch("/api/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companies,
          comparisonData,
          radarData: radarArray,
          keyMetrics,
          winRate: winRateData,
          swotData,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const { strategy } = await response.json();
      setAiStrategy(strategy as AiStrategy);
      setJustGenerated(true);
      setTimeout(() => setJustGenerated(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "生成失败，请重试";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetToRuleBased = () => {
    setAiStrategy(null);
  };

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
          className="mb-10"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-semibold">Chapter 05</p>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              战略建议与行动方案
            </h2>
            {hasChanges && !aiStrategy && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                <RefreshCw size={11} />
                已根据最新数据更新
              </span>
            )}
            {aiStrategy && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFF8F0] to-[#F0F7FC] text-[#D4782A] border border-[#E8DFD0]">
                <Sparkles size={11} />
                AI 深度分析版
              </span>
            )}
          </div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9] mb-4" />
          <p className="text-[#6B6B6B] max-w-3xl leading-relaxed text-sm">
            {aiStrategy
              ? "以下内容由 AI 根据当前竞品数据深度分析生成，提供更具洞察力的战略建议。"
              : "以下建议由系统根据当前数据实时推导生成。修改任何数据后建议内容将自动更新，也可点击「AI深度分析」获得更有洞察力的建议。"}
          </p>
        </motion.div>

        {/* AI Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm ${
              isGenerating
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : justGenerated
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gradient-to-r from-[#D4782A] to-[#E8A04C] text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                AI 正在深度分析...
              </>
            ) : justGenerated ? (
              <>
                <CheckCircle size={15} />
                AI 分析已完成
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {aiStrategy ? "重新 AI 深度分析" : "AI 深度分析（推荐）"}
              </>
            )}
          </button>

          {aiStrategy && (
            <button
              onClick={handleResetToRuleBased}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-[#8B7355] bg-white border border-[#E8DFD0] hover:bg-[#F8F5F0] transition-colors"
            >
              <RefreshCw size={13} />
              切换回规则推导版
            </button>
          )}

          {generateError && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {generateError.includes("fetch") ? "AI 服务暂时不可用，请稍后重试" : generateError}
            </span>
          )}
        </motion.div>

        {/* Competitive Insight Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
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
                {displayInsight.verdict}
              </p>
              <p className="text-xs text-[#6B6B6B]">综合评分 {displayInsight.overallScore}/100</p>
            </div>
          </div>

          {/* Our advantages */}
          <div className="rounded-2xl p-5 border border-[#E8DFD0]/60 bg-white/80">
            <p className="text-xs font-semibold text-[#2E7D32] mb-2 flex items-center gap-1">
              <TrendingUp size={12} /> 核心优势
            </p>
            {ourAdvantages.length > 0 ? (
              <ul className="space-y-1">
                {ourAdvantages.slice(0, 3).map((adv, i) => (
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
            {ourWeaknesses.length > 0 ? (
              <ul className="space-y-1">
                {ourWeaknesses.slice(0, 3).map((w, i) => (
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

        {/* Strategy banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-gradient-to-r from-[#1A1A2E] to-[#2C3E50] rounded-2xl p-8 mb-12 text-white"
        >
          {aiStrategy && (
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={12} className="text-[#E8A04C]" />
              <span className="text-xs text-[#E8A04C] font-semibold tracking-wider uppercase">AI 深度分析</span>
            </div>
          )}
          <p className="text-xs tracking-widest uppercase text-[#D4C5A9] mb-3">核心竞争策略</p>
          <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            「{displayStrategy.headline}」
          </h3>
          <p className="text-sm text-[#B0B0B0] leading-relaxed max-w-3xl">
            {displayStrategy.body}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-[#8B9DC3]">
            <span>综合胜率：{winRateData.total > 0 ? Math.round((winRateData.leadongWins / winRateData.total) * 100) : 0}%</span>
            <span>·</span>
            <span>胜出 {winRateData.leadongWins} / {winRateData.total} 项</span>
          </div>
        </motion.div>

        {/* Recommendation cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayRecommendations.map((rec, i) => {
            const config = priorityConfig[rec.priority] || priorityConfig["中"];
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

        {displayRecommendations.length === 0 && (
          <div className="text-center py-16 text-[#8B7355]">
            <p className="text-lg font-semibold mb-2">暂无建议</p>
            <p className="text-sm">请先在编辑面板中填写竞品数据，系统将自动生成针对性建议。</p>
          </div>
        )}

        {/* Bottom hint */}
        <p className="text-center text-xs text-[#B0A090] mt-8">
          {aiStrategy
            ? "当前显示 AI 深度分析结果 · 修改数据后建议重新生成以获取最新分析"
            : "数据修改后建议内容自动更新 · 点击「AI 深度分析」获得更有洞察力的战略建议"}
        </p>
      </div>
    </section>
  );
}
