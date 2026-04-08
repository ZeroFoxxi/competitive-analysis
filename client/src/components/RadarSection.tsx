import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { radarData, COLORS, winRateData } from "@/lib/data";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function RadarSection() {
  const { ref, isVisible } = useScrollAnimation();

  const chartData = radarData.dimensions.map((dim, i) => ({
    dimension: dim,
    领动臻选版: radarData.leadong[i],
    全球搜SEOPlus: radarData.globalso[i],
  }));

  const leadongAvg = Math.round(radarData.leadong.reduce((a, b) => a + b, 0) / radarData.leadong.length);
  const globalsoAvg = Math.round(radarData.globalso.reduce((a, b) => a + b, 0) / radarData.globalso.length);

  return (
    <section className="py-24 bg-gradient-to-b from-[#F8F5F0] to-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-semibold">Chapter 02</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            综合能力雷达图
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9]" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-[#E8DFD0]/50"
          >
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#E8DFD0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "#4A4A4A", fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif" }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#999" }} />
                <Radar
                  name="领动臻选版"
                  dataKey="领动臻选版"
                  stroke={COLORS.leadong}
                  fill={COLORS.leadong}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="全球搜SEO Plus"
                  dataKey="全球搜SEOPlus"
                  stroke={COLORS.globalso}
                  fill={COLORS.globalso}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: 13 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFDF8",
                    border: "1px solid #E8DFD0",
                    borderRadius: 8,
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: 13,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Score summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Average scores */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-[#E8DFD0]/50">
              <h4 className="text-sm font-semibold text-[#8B7355] mb-4 tracking-wide">综合评分</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#4A4A4A]">领动臻选版</span>
                    <span className="font-bold" style={{ color: COLORS.leadong }}>{leadongAvg}/100</span>
                  </div>
                  <div className="h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isVisible ? { width: `${leadongAvg}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS.leadong }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#4A4A4A]">全球搜 SEO Plus</span>
                    <span className="font-bold" style={{ color: COLORS.globalso }}>{globalsoAvg}/100</span>
                  </div>
                  <div className="h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isVisible ? { width: `${globalsoAvg}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS.globalso }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Win rate */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-[#E8DFD0]/50">
              <h4 className="text-sm font-semibold text-[#8B7355] mb-4 tracking-wide">指标胜出统计</h4>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-[#1A1A2E]">{winRateData.total}</span>
                <span className="text-sm text-[#8B7355] ml-1">项对比指标</span>
              </div>
              <div className="flex gap-2 h-4 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: `${(winRateData.leadongWins / winRateData.total) * 100}%` } : { width: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  style={{ backgroundColor: COLORS.leadong }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: `${(winRateData.ties / winRateData.total) * 100}%` } : { width: 0 }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="bg-[#C4B89C]"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: `${(winRateData.globalsoWins / winRateData.total) * 100}%` } : { width: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                  style={{ backgroundColor: COLORS.globalso }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <p className="font-bold text-lg" style={{ color: COLORS.leadong }}>{winRateData.leadongWins}</p>
                  <p className="text-[#8B7355]">领动胜出</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-[#8B7355]">{winRateData.ties}</p>
                  <p className="text-[#8B7355]">持平</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg" style={{ color: COLORS.globalso }}>{winRateData.globalsoWins}</p>
                  <p className="text-[#8B7355]">全球搜胜出</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
