import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { COLORS } from "@/lib/data";
import { useData } from "@/contexts/DataContext";
import EditButton from "@/components/EditButton";
import { ChevronDown, Trophy, Minus } from "lucide-react";

function WinnerBadge({ winner }: { winner: "leadong" | "globalso" | "tie" }) {
  if (winner === "tie") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F0EBE3] text-[#8B7355]">
        <Minus size={10} /> 持平
      </span>
    );
  }
  const color = winner === "leadong" ? COLORS.leadong : COLORS.globalso;
  const name = winner === "leadong" ? "领动" : "全球搜";
  const bg = winner === "leadong" ? COLORS.leadongBg : COLORS.globalsoBg;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      <Trophy size={10} /> {name}
    </span>
  );
}

function CategoryCard({ category, icon, items, index }: {
  category: string; icon: string; items: { name: string; leadong: string; globalso: string; winner: "leadong" | "globalso" | "tie"; note: string }[]; index: number;
}) {
  const [isOpen, setIsOpen] = useState(index < 3);
  const { ref, isVisible } = useScrollAnimation(0.1);

  const leadongWins = items.filter(i => i.winner === "leadong").length;
  const globalsoWins = items.filter(i => i.winner === "globalso").length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E8DFD0]/50 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#FAF7F2] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h3 className="font-bold text-[#1A1A2E] text-lg">{category}</h3>
            <div className="flex gap-3 mt-1">
              <span className="text-xs" style={{ color: COLORS.leadong }}>领动 {leadongWins}项</span>
              <span className="text-xs" style={{ color: COLORS.globalso }}>全球搜 {globalsoWins}项</span>
              <span className="text-xs text-[#8B7355]">持平 {items.length - leadongWins - globalsoWins}项</span>
            </div>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={20} className="text-[#8B7355]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DFD0]">
                      <th className="text-left py-3 pr-4 text-[#8B7355] font-semibold w-[20%]">对比项</th>
                      <th className="text-left py-3 px-3 font-semibold w-[25%]" style={{ color: COLORS.leadong }}>领动臻选版</th>
                      <th className="text-left py-3 px-3 font-semibold w-[25%]" style={{ color: COLORS.globalso }}>全球搜 SEO Plus</th>
                      <th className="text-left py-3 px-3 text-[#8B7355] font-semibold w-[15%]">胜出方</th>
                      <th className="text-left py-3 pl-3 text-[#8B7355] font-semibold w-[15%]">分析</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-[#4A4A4A]">{item.name}</td>
                        <td
                          className="py-3 px-3"
                          style={{
                            color: item.winner === "leadong" ? COLORS.leadong : "#6B6B6B",
                            fontWeight: item.winner === "leadong" ? 600 : 400,
                          }}
                        >
                          {item.leadong}
                        </td>
                        <td
                          className="py-3 px-3"
                          style={{
                            color: item.winner === "globalso" ? COLORS.globalso : "#6B6B6B",
                            fontWeight: item.winner === "globalso" ? 600 : 400,
                          }}
                        >
                          {item.globalso}
                        </td>
                        <td className="py-3 px-3"><WinnerBadge winner={item.winner} /></td>
                        <td className="py-3 pl-3 text-xs text-[#8B7355]">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ComparisonSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { comparisonData } = useData();

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-semibold">Chapter 03</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                八大维度逐项对比
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9] mb-4" />
              <p className="text-[#6B6B6B] max-w-2xl">
                点击各维度卡片展开查看详细对比数据，胜出方以品牌色高亮显示
              </p>
            </div>
            <EditButton section="comparison" label="编辑对比" />
          </div>
        </motion.div>

        <div className="space-y-4">
          {comparisonData.map((cat, i) => (
            <CategoryCard key={cat.category} {...cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
