import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useData, type HistorySnapshot } from "@/contexts/DataContext";
import {
  History,
  Save,
  Trash2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ChevronDown,
  ChevronUp,
  GitBranch,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatPrice(price: number) {
  return price >= 10000 ? `¥${(price / 10000).toFixed(1)}万` : `¥${price.toLocaleString()}`;
}

function TrendIcon({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  if (diff > 0) return <TrendingUp size={12} className="text-[#2E7D32]" />;
  if (diff < 0) return <TrendingDown size={12} className="text-[#C62828]" />;
  return <Minus size={12} className="text-[#8B7355]" />;
}

interface SnapshotCardProps {
  snapshot: HistorySnapshot;
  index: number;
  isLatest: boolean;
  prevSnapshot?: HistorySnapshot;
  onDelete: () => void;
  onRestore: () => void;
}

function SnapshotCard({ snapshot, index, isLatest, prevSnapshot, onDelete, onRestore }: SnapshotCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const leadongPrice = snapshot.data.companies.leadong?.price ?? 0;
  const globalsoPrice = snapshot.data.companies.globalso?.price ?? 0;
  const prevLeadongPrice = prevSnapshot?.data.companies.leadong?.price;
  const prevGlobalsoPrice = prevSnapshot?.data.companies.globalso?.price;

  const winRate = snapshot.data.comparisonSummary.total > 0
    ? Math.round((snapshot.data.comparisonSummary.leadongWins / snapshot.data.comparisonSummary.total) * 100)
    : 0;
  const prevWinRate = prevSnapshot && prevSnapshot.data.comparisonSummary.total > 0
    ? Math.round((prevSnapshot.data.comparisonSummary.leadongWins / prevSnapshot.data.comparisonSummary.total) * 100)
    : undefined;

  const radarAvg = snapshot.data.radarData.leadong.length > 0
    ? Math.round(snapshot.data.radarData.leadong.reduce((a, b) => a + b, 0) / snapshot.data.radarData.leadong.length)
    : 0;
  const prevRadarAvg = prevSnapshot && prevSnapshot.data.radarData.leadong.length > 0
    ? Math.round(prevSnapshot.data.radarData.leadong.reduce((a, b) => a + b, 0) / prevSnapshot.data.radarData.leadong.length)
    : undefined;

  return (
    <div className={`rounded-2xl border transition-all ${isLatest ? "border-[#D4782A]/40 bg-[#FFF8F0]" : "border-[#E8DFD0]/60 bg-white"}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isLatest ? "bg-[#D4782A]" : "bg-[#8B7355]"}`}>
              {isLatest ? "NEW" : `v${index}`}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#1A1A2E]">{snapshot.label}</h4>
                {isLatest && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D4782A]/10 text-[#D4782A]">最新</span>
                )}
              </div>
              <p className="text-xs text-[#8B7355] flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                {formatDate(snapshot.timestamp)}
              </p>
              {snapshot.description && (
                <p className="text-xs text-[#6B6B6B] mt-1">{snapshot.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-[#F0EDE8] text-[#8B7355] transition-colors"
              title="展开详情"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {confirmRestore ? (
              <>
                <button
                  onClick={() => { onRestore(); setConfirmRestore(false); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] transition-colors"
                >
                  <Check size={11} /> 确认
                </button>
                <button
                  onClick={() => setConfirmRestore(false)}
                  className="p-1.5 rounded-lg hover:bg-[#F0EDE8] text-[#8B7355] transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmRestore(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[#8B7355] hover:bg-[#F0EDE8] transition-colors"
                title="恢复此版本"
              >
                <RotateCcw size={11} /> 恢复
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-[#BFAE96] hover:text-[#C62828] transition-colors"
              title="删除此版本"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-[10px] text-[#8B7355] mb-1">领动价格</p>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[#D4782A]">{formatPrice(leadongPrice)}</span>
              {prevLeadongPrice !== undefined && (
                <TrendIcon current={leadongPrice} prev={prevLeadongPrice} />
              )}
            </div>
            {prevLeadongPrice !== undefined && prevLeadongPrice !== leadongPrice && (
              <p className="text-[10px] text-[#8B7355] mt-0.5">
                {leadongPrice > prevLeadongPrice ? "+" : ""}{formatPrice(leadongPrice - prevLeadongPrice)}
              </p>
            )}
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-[10px] text-[#8B7355] mb-1">胜率</p>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[#1A1A2E]">{winRate}%</span>
              {prevWinRate !== undefined && (
                <TrendIcon current={winRate} prev={prevWinRate} />
              )}
            </div>
            {prevWinRate !== undefined && prevWinRate !== winRate && (
              <p className="text-[10px] text-[#8B7355] mt-0.5">
                {winRate > prevWinRate ? "+" : ""}{winRate - prevWinRate}%
              </p>
            )}
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-[10px] text-[#8B7355] mb-1">雷达均分</p>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[#1A1A2E]">{radarAvg}</span>
              {prevRadarAvg !== undefined && (
                <TrendIcon current={radarAvg} prev={prevRadarAvg} />
              )}
            </div>
            {prevRadarAvg !== undefined && prevRadarAvg !== radarAvg && (
              <p className="text-[10px] text-[#8B7355] mt-0.5">
                {radarAvg > prevRadarAvg ? "+" : ""}{radarAvg - prevRadarAvg}分
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#F0EDE8] pt-4">
          <h5 className="text-xs font-semibold text-[#8B7355] mb-3">雷达图各维度评分</h5>
          <div className="grid grid-cols-2 gap-2">
            {snapshot.data.radarData.dimensions.map((dim, i) => {
              const score = snapshot.data.radarData.leadong[i];
              const prevScore = prevSnapshot?.data.radarData.leadong[i];
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#6B6B6B] w-20 truncate">{dim}</span>
                  <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D4782A]"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#D4782A] w-6 text-right">{score}</span>
                  {prevScore !== undefined && prevScore !== score && (
                    <span className={`text-[10px] w-8 ${score > prevScore ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                      {score > prevScore ? "+" : ""}{score - prevScore}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key metrics comparison */}
          <h5 className="text-xs font-semibold text-[#8B7355] mb-3 mt-4">关键指标</h5>
          <div className="space-y-2">
            {snapshot.data.keyMetrics.slice(0, 4).map((metric, i) => {
              const prevMetric = prevSnapshot?.data.keyMetrics[i];
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#6B6B6B] w-24 truncate">{metric.label}</span>
                  <span className="text-[10px] font-semibold text-[#D4782A]">
                    {metric.leadong.toLocaleString()}{metric.unit}
                  </span>
                  {prevMetric && prevMetric.leadong !== metric.leadong && (
                    <span className={`text-[10px] ${metric.leadong > prevMetric.leadong ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                      {metric.leadong > prevMetric.leadong ? "↑" : "↓"}
                      {Math.abs(metric.leadong - prevMetric.leadong).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistorySection() {
  const { ref, isVisible } = useScrollAnimation();
  const { historySnapshots, saveSnapshot, deleteSnapshot, restoreSnapshot, companies, winRateData } = useData();

  const [saveLabel, setSaveLabel] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [activeView, setActiveView] = useState<"timeline" | "chart">("timeline");

  const handleSave = () => {
    if (!saveLabel.trim()) return;
    saveSnapshot(saveLabel.trim(), saveDesc.trim());
    setSaveLabel("");
    setSaveDesc("");
    setShowSaveForm(false);
  };

  // Build chart data for price trend
  const priceChartData = [...historySnapshots].reverse().map((snap, i) => ({
    name: snap.label.length > 8 ? snap.label.slice(0, 8) + "…" : snap.label,
    date: formatDate(snap.timestamp),
    领动价格: Math.round((snap.data.companies.leadong?.price ?? 0) / 10000),
    竞品价格: Math.round((snap.data.companies.globalso?.price ?? 0) / 10000),
    胜率: snap.data.comparisonSummary.total > 0
      ? Math.round((snap.data.comparisonSummary.leadongWins / snap.data.comparisonSummary.total) * 100)
      : 0,
    雷达均分: snap.data.radarData.leadong.length > 0
      ? Math.round(snap.data.radarData.leadong.reduce((a, b) => a + b, 0) / snap.data.radarData.leadong.length)
      : 0,
  }));

  return (
    <section id="history" className="py-24 bg-gradient-to-b from-[#F8F5F0] to-white relative">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8E44AD] to-[#2980B9] flex items-center justify-center">
              <History size={20} className="text-white" />
            </div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#8B7355] font-semibold">Chapter 07</p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            历史版本追踪
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#8E44AD] to-[#2980B9] mb-4" />
          <p className="text-[#6B6B6B] max-w-2xl leading-relaxed">
            记录竞品方案的迭代历史，追踪价格和功能变化趋势。每次保存快照时，系统会记录当前所有关键数据，支持随时回溯和对比。
          </p>
        </motion.div>

        {/* Save snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8E44AD] to-[#2980B9] text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              <Save size={16} />
              保存当前版本快照
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8DFD0] p-5 max-w-lg">
              <h4 className="font-bold text-sm text-[#1A1A2E] mb-4 flex items-center gap-2">
                <GitBranch size={14} className="text-[#8E44AD]" />
                保存版本快照
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#8B7355] block mb-1">版本名称 *</label>
                  <input
                    autoFocus
                    type="text"
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    placeholder="例如：Q1初稿、价格调整后、方案V2"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#8E44AD]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8B7355] block mb-1">备注说明（可选）</label>
                  <input
                    type="text"
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    placeholder="例如：调整了价格策略，增加了AI维度评分"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#8E44AD]/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!saveLabel.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#8E44AD] text-white hover:bg-[#7D3C98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={13} /> 保存快照
                  </button>
                  <button
                    onClick={() => { setShowSaveForm(false); setSaveLabel(""); setSaveDesc(""); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B6B6B] hover:bg-[#F0EDE8] transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {historySnapshots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-[#E8DFD0]"
          >
            <History size={40} className="text-[#BFAE96] mx-auto mb-4" />
            <p className="text-[#8B7355] font-semibold mb-2">暂无历史版本</p>
            <p className="text-sm text-[#BFAE96]">点击上方「保存当前版本快照」开始记录迭代历史</p>
          </motion.div>
        ) : (
          <>
            {/* View switcher */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex items-center gap-2 mb-6"
            >
              {[
                { id: "timeline" as const, label: "时间线", icon: GitBranch },
                { id: "chart" as const, label: "趋势图", icon: TrendingUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeView === id
                      ? "bg-[#1A1A2E] text-white shadow-sm"
                      : "bg-white text-[#6B6B6B] hover:bg-[#F8F5F0] border border-[#E8DFD0]"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <span className="ml-auto text-xs text-[#8B7355]">
                共 {historySnapshots.length} 个版本
              </span>
            </motion.div>

            {/* Timeline view */}
            {activeView === "timeline" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {historySnapshots.map((snap, idx) => (
                  <motion.div
                    key={snap.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <SnapshotCard
                      snapshot={snap}
                      index={historySnapshots.length - idx}
                      isLatest={idx === 0}
                      prevSnapshot={historySnapshots[idx + 1]}
                      onDelete={() => deleteSnapshot(snap.id)}
                      onRestore={() => restoreSnapshot(snap.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Chart view */}
            {activeView === "chart" && priceChartData.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Price trend */}
                <div className="bg-white/90 rounded-2xl border border-[#E8DFD0]/50 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">价格变化趋势（万元）</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={priceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8B7355" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} unit="万" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #E8DFD0", borderRadius: "12px", fontSize: "12px" }}
                        formatter={(v: number) => [`¥${v}万`, ""]}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line type="monotone" dataKey="领动价格" stroke="#D4782A" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="竞品价格" stroke="#2980B9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Win rate & radar trend */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white/90 rounded-2xl border border-[#E8DFD0]/50 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">胜率变化趋势（%）</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={priceChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8B7355" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8B7355" }} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "white", border: "1px solid #E8DFD0", borderRadius: "12px", fontSize: "12px" }}
                          formatter={(v: number) => [`${v}%`, "胜率"]}
                        />
                        <ReferenceLine y={50} stroke="#E8DFD0" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="胜率" stroke="#27AE60" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white/90 rounded-2xl border border-[#E8DFD0]/50 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">雷达均分变化趋势</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={priceChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8B7355" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8B7355" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "white", border: "1px solid #E8DFD0", borderRadius: "12px", fontSize: "12px" }}
                          formatter={(v: number) => [`${v}分`, "雷达均分"]}
                        />
                        <Line type="monotone" dataKey="雷达均分" stroke="#8E44AD" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "chart" && priceChartData.length < 2 && (
              <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-[#E8DFD0]">
                <AlertCircle size={32} className="text-[#BFAE96] mx-auto mb-3" />
                <p className="text-sm text-[#8B7355]">至少需要 2 个版本快照才能显示趋势图</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
