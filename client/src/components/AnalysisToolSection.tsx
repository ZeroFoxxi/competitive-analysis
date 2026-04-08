import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Wrench, Plus, Trash2, Download, BarChart3, FileText } from "lucide-react";

interface CustomItem {
  id: string;
  dimension: string;
  ourScore: number;
  competitorScore: number;
  notes: string;
}

export default function AnalysisToolSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [items, setItems] = useState<CustomItem[]>([
    { id: "1", dimension: "价格竞争力", ourScore: 65, competitorScore: 80, notes: "" },
    { id: "2", dimension: "产品功能", ourScore: 75, competitorScore: 70, notes: "" },
    { id: "3", dimension: "服务质量", ourScore: 90, competitorScore: 60, notes: "" },
  ]);
  const [ourName, setOurName] = useState("我方产品");
  const [competitorName, setCompetitorName] = useState("竞品");

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), dimension: "", ourScore: 50, competitorScore: 50, notes: "" },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof CustomItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const ourAvg = items.length > 0 ? Math.round(items.reduce((a, b) => a + b.ourScore, 0) / items.length) : 0;
  const compAvg = items.length > 0 ? Math.round(items.reduce((a, b) => a + b.competitorScore, 0) / items.length) : 0;
  const ourWins = items.filter((i) => i.ourScore > i.competitorScore).length;
  const compWins = items.filter((i) => i.competitorScore > i.ourScore).length;

  const exportData = () => {
    const csv = [
      ["维度", ourName, competitorName, "差距", "备注"],
      ...items.map((i) => [i.dimension, i.ourScore, i.competitorScore, i.ourScore - i.competitorScore, i.notes]),
      [],
      ["汇总"],
      ["平均分", ourAvg, compAvg, ourAvg - compAvg, ""],
      ["胜出项数", ourWins, compWins, "", ""],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `竞品分析_${ourName}_vs_${competitorName}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#F8F5F0] to-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4782A] to-[#2980B9] flex items-center justify-center">
              <Wrench size={20} className="text-white" />
            </div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] font-semibold">Bonus Tool</p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            可复用竞品分析工具
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4782A] to-[#2980B9] mb-4" />
          <p className="text-[#6B6B6B] max-w-2xl leading-relaxed">
            自定义维度和评分，快速生成竞品对比分析。支持导出CSV数据，帮助您高效完成日常竞品分析工作。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#E8DFD0]/50 shadow-sm"
        >
          {/* Company names */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="text-xs font-semibold text-[#8B7355] mb-1.5 block">我方产品/服务名称</label>
              <input
                type="text"
                value={ourName}
                onChange={(e) => setOurName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD0] bg-[#FFFDF8] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/30 focus:border-[#D4782A]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8B7355] mb-1.5 block">竞品名称</label>
              <input
                type="text"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD0] bg-[#FFFDF8] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2980B9]/30 focus:border-[#2980B9]"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold text-[#8B7355] px-1">
              <div className="col-span-3">分析维度</div>
              <div className="col-span-2">{ourName} 评分</div>
              <div className="col-span-2">{competitorName} 评分</div>
              <div className="col-span-1">差距</div>
              <div className="col-span-3">备注</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item) => {
              const diff = item.ourScore - item.competitorScore;
              return (
                <div key={item.id} className="grid sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E8] transition-colors">
                  <input
                    type="text"
                    placeholder="维度名称"
                    value={item.dimension}
                    onChange={(e) => updateItem(item.id, "dimension", e.target.value)}
                    className="sm:col-span-3 px-3 py-2 rounded-lg border border-[#E8DFD0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#D4782A]/30"
                  />
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.ourScore}
                      onChange={(e) => updateItem(item.id, "ourScore", parseInt(e.target.value))}
                      className="flex-1 accent-[#D4782A]"
                    />
                    <span className="text-sm font-bold w-8 text-right" style={{ color: "#D4782A" }}>{item.ourScore}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.competitorScore}
                      onChange={(e) => updateItem(item.id, "competitorScore", parseInt(e.target.value))}
                      className="flex-1 accent-[#2980B9]"
                    />
                    <span className="text-sm font-bold w-8 text-right" style={{ color: "#2980B9" }}>{item.competitorScore}</span>
                  </div>
                  <div className="sm:col-span-1 text-center">
                    <span
                      className="text-sm font-bold"
                      style={{ color: diff > 0 ? "#2E7D32" : diff < 0 ? "#C62828" : "#8B7355" }}
                    >
                      {diff > 0 ? "+" : ""}{diff}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="备注"
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                    className="sm:col-span-3 px-3 py-2 rounded-lg border border-[#E8DFD0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8B7355]/30"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="sm:col-span-1 p-2 rounded-lg hover:bg-red-50 text-[#C62828]/50 hover:text-[#C62828] transition-colors justify-self-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={addItem}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#D4C5A9] text-sm text-[#8B7355] hover:bg-[#FAF7F2] hover:border-[#D4782A] transition-all"
            >
              <Plus size={16} /> 添加维度
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm hover:bg-[#2C3E50] transition-colors"
            >
              <Download size={16} /> 导出CSV
            </button>
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E8DFD0]">
              <div className="text-center p-4 rounded-xl bg-[#FFF8F0]">
                <BarChart3 size={20} className="mx-auto mb-2 text-[#D4782A]" />
                <p className="text-2xl font-bold text-[#D4782A]">{ourAvg}</p>
                <p className="text-xs text-[#8B7355]">{ourName}均分</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#F0F7FC]">
                <BarChart3 size={20} className="mx-auto mb-2 text-[#2980B9]" />
                <p className="text-2xl font-bold text-[#2980B9]">{compAvg}</p>
                <p className="text-xs text-[#8B7355]">{competitorName}均分</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#E8F5E9]">
                <FileText size={20} className="mx-auto mb-2 text-[#2E7D32]" />
                <p className="text-2xl font-bold text-[#2E7D32]">{ourWins}</p>
                <p className="text-xs text-[#8B7355]">{ourName}胜出</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#FFEBEE]">
                <FileText size={20} className="mx-auto mb-2 text-[#C62828]" />
                <p className="text-2xl font-bold text-[#C62828]">{compWins}</p>
                <p className="text-xs text-[#8B7355]">{competitorName}胜出</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
