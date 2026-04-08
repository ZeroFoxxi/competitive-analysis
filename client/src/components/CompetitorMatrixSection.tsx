import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useData, type CompetitorProduct, type MatrixDimension } from "@/contexts/DataContext";
import {
  Grid3X3,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Trophy,
  BarChart2,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const MATRIX_COLORS = ["#D4782A", "#2980B9", "#27AE60", "#8E44AD", "#E74C3C"];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-7 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function EditableCell({
  value,
  onSave,
  type = "text",
  placeholder = "",
}: {
  value: string | number;
  onSave: (v: string | number) => void;
  type?: "text" | "number";
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const handleSave = () => {
    onSave(type === "number" ? Number(draft) || 0 : draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 px-2 py-1 text-xs rounded border border-[#D4782A]/50 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4782A]/40 min-w-0"
          placeholder={placeholder}
        />
        <button onClick={handleSave} className="p-1 rounded hover:bg-green-50 text-green-600">
          <Check size={12} />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-red-50 text-red-400">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="group flex items-center gap-1 text-left hover:text-[#D4782A] transition-colors w-full"
    >
      <span className="text-xs truncate">{value || <span className="text-[#BFAE96] italic">{placeholder}</span>}</span>
      <Pencil size={10} className="opacity-0 group-hover:opacity-60 flex-shrink-0" />
    </button>
  );
}

export default function CompetitorMatrixSection() {
  const { ref, isVisible } = useScrollAnimation();
  const {
    competitorMatrix,
    updateMatrixCompetitor,
    addMatrixCompetitor,
    removeMatrixCompetitor,
    updateMatrixScore,
    updateMatrixNote,
    addMatrixDimension,
    removeMatrixDimension,
    updateMatrixDimensionName,
  } = useData();

  const [showRadar, setShowRadar] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<"matrix" | "radar" | "ranking">("matrix");

  const { competitors, dimensions } = competitorMatrix;

  // 计算每个竞品的平均分
  const competitorStats = useMemo(() => {
    return competitors.map((comp) => {
      const scores = dimensions.map((d) => d.scores[comp.id] ?? 50);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const wins = dimensions.filter((d) => {
        const myScore = d.scores[comp.id] ?? 50;
        return competitors.every((c) => c.id === comp.id || (d.scores[c.id] ?? 50) <= myScore);
      }).length;
      return { ...comp, avg, wins };
    }).sort((a, b) => b.avg - a.avg);
  }, [competitors, dimensions]);

  // 雷达图数据
  const radarChartData = useMemo(() => {
    return dimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim.name };
      competitors.forEach((comp) => {
        entry[comp.name] = dim.scores[comp.id] ?? 50;
      });
      return entry;
    });
  }, [dimensions, competitors]);

  // 找出每个维度的最高分竞品
  const getDimWinner = (dim: MatrixDimension) => {
    let maxScore = -1;
    let winnerId = "";
    competitors.forEach((comp) => {
      const score = dim.scores[comp.id] ?? 50;
      if (score > maxScore) {
        maxScore = score;
        winnerId = comp.id;
      }
    });
    return winnerId;
  };

  const handleAddCompetitor = () => {
    const idx = competitors.length;
    const newComp: CompetitorProduct = {
      id: `comp-${Date.now()}`,
      name: `竞品${String.fromCharCode(65 + idx)}`,
      color: MATRIX_COLORS[idx % MATRIX_COLORS.length],
      price: 0,
      positioning: "点击编辑填写",
    };
    addMatrixCompetitor(newComp);
  };

  const handleAddDimension = () => {
    const scores: Record<string, number> = {};
    const notes: Record<string, string> = {};
    competitors.forEach((c) => { scores[c.id] = 50; notes[c.id] = ""; });
    addMatrixDimension({
      id: `dim-${Date.now()}`,
      name: "新维度",
      scores,
      notes,
    });
  };

  const exportCSV = () => {
    const header = ["维度", ...competitors.map((c) => c.name)];
    const rows = dimensions.map((dim) => [
      dim.name,
      ...competitors.map((c) => dim.scores[c.id] ?? 50),
    ]);
    const summary = ["平均分", ...competitorStats.map((c) => c.avg)];
    const csv = [header, ...rows, [], summary]
      .map((row) => row.join(","))
      .join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `竞品对比矩阵_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="matrix" className="py-24 bg-gradient-to-b from-white to-[#F8F5F0] relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27AE60] to-[#2980B9] flex items-center justify-center">
              <Grid3X3 size={20} className="text-white" />
            </div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] font-semibold">Chapter 06</p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            多竞品对比矩阵
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#27AE60] to-[#2980B9] mb-4" />
          <p className="text-[#6B6B6B] max-w-2xl leading-relaxed">
            同时对比 {competitors.length} 个竞品，形成完整的竞品生态图。点击任意数字或名称可直接编辑，支持最多5个竞品同时对比。
          </p>
        </motion.div>

        {/* Competitor cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
        >
          {competitors.map((comp, idx) => (
            <div
              key={comp.id}
              className="relative bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all"
              style={{ borderColor: comp.color + "40" }}
            >
              {/* Rank badge */}
              {competitorStats.findIndex((s) => s.id === comp.id) === 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F5C842] flex items-center justify-center shadow-sm">
                  <Trophy size={12} className="text-white" />
                </div>
              )}
              <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: comp.color }}>
                {idx + 1}
              </div>
              <EditableCell
                value={comp.name}
                onSave={(v) => updateMatrixCompetitor(comp.id, { name: String(v) })}
                placeholder="竞品名称"
              />
              <div className="mt-1">
                <EditableCell
                  value={comp.price > 0 ? `¥${(comp.price / 10000).toFixed(0)}万` : "价格未填"}
                  onSave={(v) => {
                    const num = parseFloat(String(v).replace(/[¥万,]/g, "")) * 10000;
                    if (!isNaN(num)) updateMatrixCompetitor(comp.id, { price: num });
                  }}
                  placeholder="年度价格"
                />
              </div>
              <p className="text-[10px] text-[#BFAE96] mt-1 truncate">{comp.positioning}</p>
              {/* Average score */}
              <div className="mt-3 pt-3 border-t border-[#F0EDE8]">
                <p className="text-[10px] text-[#8B7355] mb-1">综合均分</p>
                <p className="text-lg font-bold" style={{ color: comp.color }}>
                  {competitorStats.find((s) => s.id === comp.id)?.avg ?? 0}
                </p>
              </div>
              {competitors.length > 2 && (
                <button
                  onClick={() => removeMatrixCompetitor(comp.id)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-[#BFAE96] hover:text-[#C62828] transition-colors opacity-0 group-hover:opacity-100"
                  title="删除此竞品"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          ))}
          {competitors.length < 5 && (
            <button
              onClick={handleAddCompetitor}
              className="bg-white/60 rounded-2xl p-4 border border-dashed border-[#E8DFD0] hover:border-[#27AE60] hover:bg-[#F0FFF4] transition-all flex flex-col items-center justify-center gap-2 text-[#8B7355] hover:text-[#27AE60] min-h-[140px]"
            >
              <Plus size={20} />
              <span className="text-xs font-medium">添加竞品</span>
              <span className="text-[10px] text-[#BFAE96]">{5 - competitors.length} 个名额</span>
            </button>
          )}
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-2 mb-6"
        >
          {[
            { id: "matrix" as const, label: "对比矩阵", icon: Grid3X3 },
            { id: "radar" as const, label: "雷达图", icon: BarChart2 },
            { id: "ranking" as const, label: "排名榜", icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-[#1A1A2E] text-white shadow-sm"
                  : "bg-white text-[#6B6B6B] hover:bg-[#F8F5F0] border border-[#E8DFD0]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                showNotes ? "bg-[#FFF8F0] text-[#D4782A] border-[#D4782A]/30" : "bg-white text-[#6B6B6B] border-[#E8DFD0]"
              }`}
            >
              <Info size={12} />
              {showNotes ? "隐藏备注" : "显示备注"}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white text-[#6B6B6B] hover:bg-[#F8F5F0] border border-[#E8DFD0] transition-all"
            >
              <Download size={12} />
              导出CSV
            </button>
          </div>
        </motion.div>

        {/* Matrix view */}
        {activeTab === "matrix" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8DFD0]/50 shadow-sm overflow-hidden"
          >
            {/* Table header */}
            <div
              className="grid gap-0 border-b border-[#E8DFD0]"
              style={{ gridTemplateColumns: `180px repeat(${competitors.length}, 1fr)` }}
            >
              <div className="p-4 bg-[#FAF7F2]">
                <span className="text-xs font-semibold text-[#8B7355]">评估维度</span>
              </div>
              {competitors.map((comp) => (
                <div key={comp.id} className="p-4 bg-[#FAF7F2] border-l border-[#E8DFD0]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                    <span className="text-xs font-semibold text-[#1A1A2E] truncate">{comp.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dimension rows */}
            {dimensions.map((dim, dimIdx) => {
              const winnerId = getDimWinner(dim);
              return (
                <div key={dim.id}>
                  <div
                    className="grid gap-0 hover:bg-[#FFFDF8] transition-colors"
                    style={{ gridTemplateColumns: `180px repeat(${competitors.length}, 1fr)` }}
                  >
                    {/* Dimension name */}
                    <div className="p-4 flex items-center justify-between gap-2 border-b border-[#F0EDE8]">
                      <EditableCell
                        value={dim.name}
                        onSave={(v) => updateMatrixDimensionName(dim.id, String(v))}
                        placeholder="维度名称"
                      />
                      <button
                        onClick={() => removeMatrixDimension(dim.id)}
                        className="p-1 rounded hover:bg-red-50 text-[#BFAE96] hover:text-[#C62828] transition-colors flex-shrink-0"
                        title="删除此维度"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                    {/* Score cells */}
                    {competitors.map((comp) => {
                      const score = dim.scores[comp.id] ?? 50;
                      const isWinner = comp.id === winnerId;
                      return (
                        <div
                          key={comp.id}
                          className={`p-4 border-l border-b border-[#F0EDE8] ${isWinner ? "bg-[#F0FFF4]/50" : ""}`}
                        >
                          <div className="flex items-center gap-1 mb-1.5">
                            {isWinner && (
                              <Trophy size={10} className="text-[#F5C842] flex-shrink-0" />
                            )}
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={score}
                              onChange={(e) => updateMatrixScore(dim.id, comp.id, parseInt(e.target.value))}
                              className="flex-1 h-1.5"
                              style={{ accentColor: comp.color }}
                            />
                            <span
                              className="text-xs font-bold w-6 text-right flex-shrink-0"
                              style={{ color: comp.color }}
                            >
                              {score}
                            </span>
                          </div>
                          {showNotes && (
                            <input
                              type="text"
                              value={dim.notes[comp.id] ?? ""}
                              onChange={(e) => updateMatrixNote(dim.id, comp.id, e.target.value)}
                              placeholder="备注..."
                              className="w-full text-[10px] px-2 py-1 rounded border border-[#E8DFD0] bg-[#FFFDF8] focus:outline-none focus:ring-1 focus:ring-[#D4782A]/20 mt-1"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Average row */}
            <div
              className="grid gap-0 bg-[#FAF7F2] border-t-2 border-[#E8DFD0]"
              style={{ gridTemplateColumns: `180px repeat(${competitors.length}, 1fr)` }}
            >
              <div className="p-4">
                <span className="text-xs font-bold text-[#1A1A2E]">综合均分</span>
              </div>
              {competitors.map((comp) => {
                const stat = competitorStats.find((s) => s.id === comp.id);
                const rank = competitorStats.findIndex((s) => s.id === comp.id) + 1;
                return (
                  <div key={comp.id} className="p-4 border-l border-[#E8DFD0]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" style={{ color: comp.color }}>
                        {stat?.avg ?? 0}
                      </span>
                      <span className="text-xs text-[#8B7355]">#{rank}</span>
                    </div>
                    <ScoreBar score={stat?.avg ?? 0} color={comp.color} />
                  </div>
                );
              })}
            </div>

            {/* Add dimension button */}
            <div className="p-4 border-t border-[#E8DFD0]">
              <button
                onClick={handleAddDimension}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#27AE60] hover:bg-[#F0FFF4] border border-dashed border-[#27AE60]/40 hover:border-[#27AE60] transition-all"
              >
                <Plus size={14} />
                添加评估维度
              </button>
            </div>
          </motion.div>
        )}

        {/* Radar view */}
        {activeTab === "radar" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8DFD0]/50 shadow-sm p-6"
          >
            <h3 className="text-base font-bold text-[#1A1A2E] mb-6">多竞品雷达图对比</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#E8DFD0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fill: "#6B6B6B" }}
                />
                {competitors.map((comp) => (
                  <Radar
                    key={comp.id}
                    name={comp.name}
                    dataKey={comp.name}
                    stroke={comp.color}
                    fill={comp.color}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => <span style={{ color: "#1A1A2E" }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E8DFD0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Ranking view */}
        {activeTab === "ranking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8DFD0]/50 shadow-sm p-6"
          >
            <h3 className="text-base font-bold text-[#1A1A2E] mb-6">综合排名榜</h3>
            <div className="space-y-4">
              {competitorStats.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[#E8DFD0]/60 hover:bg-[#FAF7F2] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: idx === 0 ? "#F5C842" : idx === 1 ? "#B0B0B0" : idx === 2 ? "#CD7F32" : comp.color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#1A1A2E] text-sm">{comp.name}</span>
                      {comp.price > 0 && (
                        <span className="text-xs text-[#8B7355]">¥{(comp.price / 10000).toFixed(0)}万/年</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${comp.avg}%`, backgroundColor: comp.color }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right" style={{ color: comp.color }}>
                        {comp.avg}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#8B7355]">维度领先</p>
                    <p className="text-sm font-bold text-[#1A1A2E]">{comp.wins} 项</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dimension winners */}
            <div className="mt-8">
              <h4 className="text-sm font-bold text-[#1A1A2E] mb-4">各维度领先竞品</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {dimensions.map((dim) => {
                  const winnerId = getDimWinner(dim);
                  const winner = competitors.find((c) => c.id === winnerId);
                  if (!winner) return null;
                  return (
                    <div key={dim.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2]">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: winner.color }} />
                      <span className="text-xs text-[#6B6B6B] flex-1">{dim.name}</span>
                      <span className="text-xs font-semibold" style={{ color: winner.color }}>
                        {winner.name}
                      </span>
                      <span className="text-xs text-[#8B7355]">({dim.scores[winnerId] ?? 50}分)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
