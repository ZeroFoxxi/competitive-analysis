import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Wrench, Plus, Trash2, Download, BarChart3, FileText, HelpCircle, ChevronDown, ChevronUp, Pencil, SlidersHorizontal, FileDown } from "lucide-react";

interface CustomItem {
  id: string;
  dimension: string;
  ourScore: number;
  competitorScore: number;
  notes: string;
}

export default function AnalysisToolSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [showGuide, setShowGuide] = useState(true);
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

  const guideSteps = [
    {
      icon: Pencil,
      title: "第一步：填写名称",
      desc: "在上方输入你的产品/服务名称和竞品名称，方便识别和导出",
      color: "#D4782A",
    },
    {
      icon: SlidersHorizontal,
      title: "第二步：设置维度和评分",
      desc: "为每个对比维度命名，拖动滑块设置双方评分（0-100分），系统自动计算差距",
      color: "#2980B9",
    },
    {
      icon: Plus,
      title: "第三步：添加更多维度",
      desc: "点击「添加维度」按钮增加新的对比项，可以添加任意数量的分析维度",
      color: "#2E7D32",
    },
    {
      icon: FileDown,
      title: "第四步：导出数据",
      desc: "点击「导出CSV」按钮，下载分析结果为Excel可打开的CSV文件，方便汇报和存档",
      color: "#1565C0",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#F8F5F0] to-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-8"
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
            这是一个可以直接在网页上使用的竞品分析小工具。你可以自定义对比维度、打分评估，最后导出CSV表格用于汇报。下面已预设了3个示例维度，你可以直接修改或添加新的。
          </p>
        </motion.div>

        {/* Usage guide - collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8F5E9] text-[#2E7D32] text-sm font-semibold hover:bg-[#C8E6C9] transition-colors mb-4"
          >
            <HelpCircle size={16} />
            使用指南 — 如何使用这个工具？
            {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2"
            >
              {guideSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-5 border border-[#E8DFD0]/60 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: step.color + "15" }}
                      >
                        <Icon size={18} style={{ color: step.color }} />
                      </div>
                      <span className="text-xs font-bold text-[#8B7355]">STEP {i + 1}</span>
                    </div>
                    <h4 className="font-bold text-[#1A1A2E] text-sm mb-2">{step.title}</h4>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          )}
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
              <label className="text-xs font-semibold text-[#8B7355] mb-1.5 block">
                我方产品/服务名称
                <span className="text-[#BFAE96] font-normal ml-2">（在这里输入你的产品名）</span>
              </label>
              <input
                type="text"
                value={ourName}
                onChange={(e) => setOurName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD0] bg-[#FFFDF8] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/30 focus:border-[#D4782A]"
                placeholder="例如：领动臻选版"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8B7355] mb-1.5 block">
                竞品名称
                <span className="text-[#BFAE96] font-normal ml-2">（在这里输入竞争对手名）</span>
              </label>
              <input
                type="text"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD0] bg-[#FFFDF8] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2980B9]/30 focus:border-[#2980B9]"
                placeholder="例如：全球搜 SEO Plus"
              />
            </div>
          </div>

          {/* Items header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold text-[#8B7355] px-1 mb-3">
            <div className="col-span-3">分析维度</div>
            <div className="col-span-2 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#D4782A]" />
              {ourName} 评分
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#2980B9]" />
              {competitorName} 评分
            </div>
            <div className="col-span-1">差距</div>
            <div className="col-span-3">备注</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const diff = item.ourScore - item.competitorScore;
              return (
                <div key={item.id} className="grid sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E8] transition-colors">
                  <input
                    type="text"
                    placeholder="输入维度名称，如：价格、功能、服务"
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
                    placeholder="添加备注说明"
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                    className="sm:col-span-3 px-3 py-2 rounded-lg border border-[#E8DFD0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8B7355]/30"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="sm:col-span-1 p-2 rounded-lg hover:bg-red-50 text-[#C62828]/50 hover:text-[#C62828] transition-colors justify-self-center"
                    title="删除此维度"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-[#D4C5A9] text-sm font-semibold text-[#8B7355] hover:bg-[#FAF7F2] hover:border-[#D4782A] hover:text-[#D4782A] transition-all"
            >
              <Plus size={16} /> 添加新维度
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm font-semibold hover:bg-[#2C3E50] transition-colors shadow-md hover:shadow-lg"
            >
              <Download size={16} /> 导出CSV表格
            </button>
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="pt-6 border-t border-[#E8DFD0]">
              <p className="text-xs font-semibold text-[#8B7355] mb-4 uppercase tracking-wider">实时统计结果</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-[#FFF8F0] border border-[#D4782A]/10">
                  <BarChart3 size={20} className="mx-auto mb-2 text-[#D4782A]" />
                  <p className="text-2xl font-bold text-[#D4782A]">{ourAvg}</p>
                  <p className="text-xs text-[#8B7355]">{ourName}均分</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#F0F7FC] border border-[#2980B9]/10">
                  <BarChart3 size={20} className="mx-auto mb-2 text-[#2980B9]" />
                  <p className="text-2xl font-bold text-[#2980B9]">{compAvg}</p>
                  <p className="text-xs text-[#8B7355]">{competitorName}均分</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/10">
                  <FileText size={20} className="mx-auto mb-2 text-[#2E7D32]" />
                  <p className="text-2xl font-bold text-[#2E7D32]">{ourWins}</p>
                  <p className="text-xs text-[#8B7355]">{ourName}胜出</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#FFEBEE] border border-[#C62828]/10">
                  <FileText size={20} className="mx-auto mb-2 text-[#C62828]" />
                  <p className="text-2xl font-bold text-[#C62828]">{compWins}</p>
                  <p className="text-xs text-[#8B7355]">{competitorName}胜出</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
