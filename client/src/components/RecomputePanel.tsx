import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import {
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  FileText,
  Zap,
} from "lucide-react";

interface RecomputedCategory {
  category: string;
  icon: string;
  items: Array<{
    name: string;
    leadong: string;
    globalso: string;
    winner: "leadong" | "globalso" | "tie";
    note: string;
  }>;
}

interface MatrixScoreResult {
  competitorId: string;
  competitorName: string;
  scores: Record<string, number>; // dimId -> score
}

type PanelTab = "report" | "matrix";

export default function RecomputePanel() {
  const {
    companies,
    keyMetrics,
    comparisonData,
    competitorMatrix,
    updateComparisonItem,
    addComparisonItem,
    removeComparisonItem,
    updateMatrixScore,
    clearPendingRecompute,
    pendingRecompute,
  } = useData();

  const [activeTab, setActiveTab] = useState<PanelTab>("report");

  // ---- 主报告重算状态 ----
  const [reportStatus, setReportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reportError, setReportError] = useState("");
  const [reportPreview, setReportPreview] = useState<RecomputedCategory[] | null>(null);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [reportApplied, setReportApplied] = useState(false);

  // ---- 矩阵AI评分状态 ----
  const [matrixStatus, setMatrixStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [matrixError, setMatrixError] = useState("");
  const [matrixPreview, setMatrixPreview] = useState<MatrixScoreResult[] | null>(null);
  const [matrixApplied, setMatrixApplied] = useState(false);

  // ---- 主报告重算 ----
  const handleRecompute = async () => {
    setReportStatus("loading");
    setReportError("");
    setReportApplied(false);

    const metricsMap: Record<string, any> = {};
    keyMetrics.forEach((m) => {
      metricsMap[m.label] = { leadong: m.leadong, globalso: m.globalso, unit: m.unit };
    });

    try {
      const res = await fetch("/api/recompute-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadongData: {
            price: companies.leadong?.price,
            positioning: companies.leadong?.positioning,
            metrics: metricsMap,
          },
          globalsoData: {
            price: companies.globalso?.price,
            positioning: companies.globalso?.positioning,
            metrics: metricsMap,
          },
          currentComparison: comparisonData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setReportStatus("error");
        setReportError(json.error || "重算失败，请重试");
        return;
      }
      if (json.data?.categories?.length > 0) {
        setReportPreview(json.data.categories);
        setReportStatus("success");
        setExpandedCat(0);
      } else {
        setReportStatus("error");
        setReportError("AI返回数据格式异常，请重试");
      }
    } catch (err: any) {
      setReportStatus("error");
      setReportError(err.message || "网络错误，请重试");
    }
  };

  const handleApplyReport = () => {
    if (!reportPreview) return;
    reportPreview.forEach((newCat) => {
      const catIdx = comparisonData.findIndex(
        (c) => c.category === newCat.category || c.category.includes(newCat.category.slice(0, 4))
      );
      if (catIdx >= 0) {
        newCat.items.forEach((newItem, itemIdx) => {
          if (itemIdx < comparisonData[catIdx].items.length) {
            updateComparisonItem(catIdx, itemIdx, {
              name: newItem.name,
              leadong: newItem.leadong,
              globalso: newItem.globalso,
              winner: newItem.winner,
              note: newItem.note,
            });
          } else {
            addComparisonItem(catIdx, {
              name: newItem.name,
              leadong: newItem.leadong,
              globalso: newItem.globalso,
              winner: newItem.winner,
              note: newItem.note,
            });
          }
        });
        const oldLen = comparisonData[catIdx].items.length;
        const newLen = newCat.items.length;
        if (oldLen > newLen) {
          for (let i = oldLen - 1; i >= newLen; i--) {
            removeComparisonItem(catIdx, i);
          }
        }
      }
    });
    clearPendingRecompute();
    setReportApplied(true);
  };

  // ---- 矩阵AI评分 ----
  const handleMatrixScore = async () => {
    setMatrixStatus("loading");
    setMatrixError("");
    setMatrixApplied(false);

    const { competitors, dimensions } = competitorMatrix;
    const dimNames = dimensions.map((d) => d.name);

    // 构建每个竞品的描述信息
    const competitorDescriptions = competitors.map((c) => ({
      id: c.id,
      name: c.name,
      price: c.price,
      positioning: c.positioning,
      currentScores: dimensions.reduce((acc, dim) => {
        acc[dim.name] = dim.scores[c.id] ?? 50;
        return acc;
      }, {} as Record<string, number>),
    }));

    try {
      const res = await fetch("/api/matrix-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitors: competitorDescriptions,
          dimensions: dimNames,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMatrixStatus("error");
        setMatrixError(json.error || "评分失败，请重试");
        return;
      }
      if (json.data?.length > 0) {
        setMatrixPreview(json.data);
        setMatrixStatus("success");
      } else {
        setMatrixStatus("error");
        setMatrixError("AI返回数据格式异常，请重试");
      }
    } catch (err: any) {
      setMatrixStatus("error");
      setMatrixError(err.message || "网络错误，请重试");
    }
  };

  const handleApplyMatrix = () => {
    if (!matrixPreview) return;
    const { dimensions } = competitorMatrix;

    matrixPreview.forEach((result) => {
      dimensions.forEach((dim) => {
        const score = result.scores[dim.name];
        if (score !== undefined && score >= 0 && score <= 100) {
          updateMatrixScore(dim.id, result.competitorId, score);
        }
      });
    });
    setMatrixApplied(true);
  };

  const winnerLabel = (w: string) => {
    if (w === "leadong") return <span className="text-[#D4782A] font-semibold text-xs">领动胜</span>;
    if (w === "globalso") return <span className="text-[#2980B9] font-semibold text-xs">全球搜胜</span>;
    return <span className="text-[#8B7355] text-xs">持平</span>;
  };

  return (
    <div className="space-y-4">
      {/* Tab 切换 */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0EDE8] rounded-xl">
        <button
          onClick={() => setActiveTab("report")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "report"
              ? "bg-white text-[#D4782A] shadow-sm"
              : "text-[#8B7355] hover:text-[#1A1A2E]"
          }`}
        >
          <FileText size={12} />
          主报告重算
          {pendingRecompute && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "matrix"
              ? "bg-white text-[#8E44AD] shadow-sm"
              : "text-[#8B7355] hover:text-[#1A1A2E]"
          }`}
        >
          <Grid3X3 size={12} />
          矩阵AI评分
        </button>
      </div>

      {/* ===== 主报告重算 Tab ===== */}
      {activeTab === "report" && (
        <div className="space-y-4">
          {pendingRecompute && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-200">
              <Zap size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                <strong>检测到数据变更！</strong>价格或指标已修改，建议重算对比分析以保持数据一致性。
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFF8F0] border border-[#F5C88A]">
            <Sparkles size={14} className="text-[#D4782A] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#8B7355] leading-relaxed">
              修改价格或指标后，点击下方按钮让 AI 根据最新数据<strong>自动重新推导</strong>所有对比项的描述、胜出方和分析备注。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["leadong", "globalso"] as const).map((key) => (
              <div key={key} className="p-3 rounded-xl bg-white border border-[#E8DFD0]">
                <p className="text-xs text-[#8B7355]">{companies[key]?.name}</p>
                <p className="text-base font-bold" style={{ color: companies[key]?.color }}>
                  ¥{(companies[key]?.price || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[#BFAE96] truncate">{companies[key]?.positioning?.slice(0, 18)}…</p>
              </div>
            ))}
          </div>

          {!reportApplied && (
            <button
              onClick={handleRecompute}
              disabled={reportStatus === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D4782A] to-[#E8962A] text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {reportStatus === "loading" ? (
                <><Loader2 size={16} className="animate-spin" />AI 正在重新推导所有对比项…</>
              ) : (
                <><RefreshCw size={16} />AI 一键重算全部对比分析</>
              )}
            </button>
          )}

          {reportStatus === "error" && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFEBEE] text-[#C62828]">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs">{reportError}</p>
            </div>
          )}

          <AnimatePresence>
            {reportStatus === "success" && reportPreview && !reportApplied && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
                  <Check size={14} />
                  <p className="text-xs font-semibold">AI 重算完成！预览结果如下，确认后点击应用</p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {reportPreview.map((cat, ci) => (
                    <div key={ci} className="rounded-xl border border-[#E8DFD0] overflow-hidden">
                      <button
                        onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-[#FAF7F2] text-xs font-semibold text-[#1A1A2E]"
                      >
                        <span>{cat.icon} {cat.category} <span className="text-[#8B7355] font-normal">({cat.items.length}项)</span></span>
                        {expandedCat === ci ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      {expandedCat === ci && (
                        <div className="divide-y divide-[#F0EDE8]">
                          {cat.items.map((item, ii) => (
                            <div key={ii} className="px-3 py-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#1A1A2E]">{item.name}</span>
                                {winnerLabel(item.winner)}
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="p-1.5 rounded-lg bg-[#FFF8F0]">
                                  <p className="text-[10px] text-[#D4782A] font-semibold mb-0.5">领动</p>
                                  <p className="text-[10px] text-[#1A1A2E]">{item.leadong}</p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-[#F0F7FC]">
                                  <p className="text-[10px] text-[#2980B9] font-semibold mb-0.5">全球搜</p>
                                  <p className="text-[10px] text-[#1A1A2E]">{item.globalso}</p>
                                </div>
                              </div>
                              {item.note && <p className="text-[10px] text-[#8B7355] italic">💬 {item.note}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleApplyReport}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[#1A1A2E] text-white hover:bg-[#2C3E50] transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} />确认应用全部重算结果
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {reportApplied && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-[#E8F5E9] text-[#2E7D32]"
            >
              <Check size={16} />
              <div>
                <p className="text-sm font-semibold">全部对比数据已更新！</p>
                <p className="text-xs mt-0.5">所有对比项的描述、胜出方和分析备注已根据最新数据自动重算。</p>
              </div>
              <button
                onClick={() => { setReportApplied(false); setReportStatus("idle"); setReportPreview(null); }}
                className="ml-auto text-xs underline text-[#2E7D32]"
              >
                再次重算
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ===== 矩阵AI评分 Tab ===== */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F9F0FF] border border-[#D7BDE2]">
            <Grid3X3 size={14} className="text-[#8E44AD] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#6C3483] leading-relaxed">
              AI 将根据每个竞品的<strong>名称、价格和定位描述</strong>，自动推导其在各维度的能力评分（0-100），帮助您快速建立对比矩阵基线。
            </p>
          </div>

          {/* 当前矩阵竞品列表 */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#8B7355]">当前矩阵竞品（{competitorMatrix.competitors.length}个）</p>
            {competitorMatrix.competitors.map((comp) => (
              <div key={comp.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E8DFD0]">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1A1A2E] truncate">{comp.name}</p>
                  <p className="text-[10px] text-[#8B7355] truncate">
                    {comp.price > 0 ? `¥${(comp.price / 10000).toFixed(0)}万/年` : "价格未填"}
                    {comp.positioning ? ` · ${comp.positioning.slice(0, 20)}` : ""}
                  </p>
                </div>
                {/* 当前评分预览 */}
                <div className="text-right">
                  <p className="text-[10px] text-[#BFAE96]">均分</p>
                  <p className="text-xs font-bold" style={{ color: comp.color }}>
                    {competitorMatrix.dimensions.length > 0
                      ? Math.round(
                          competitorMatrix.dimensions.reduce((s, d) => s + (d.scores[comp.id] ?? 50), 0) /
                            competitorMatrix.dimensions.length
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 维度列表 */}
          <div>
            <p className="text-xs font-semibold text-[#8B7355] mb-1.5">评分维度（{competitorMatrix.dimensions.length}个）</p>
            <div className="flex flex-wrap gap-1.5">
              {competitorMatrix.dimensions.map((dim) => (
                <span key={dim.id} className="px-2 py-0.5 rounded-full bg-[#F0EDE8] text-xs text-[#6B6B6B]">
                  {dim.name}
                </span>
              ))}
            </div>
          </div>

          {!matrixApplied && (
            <button
              onClick={handleMatrixScore}
              disabled={matrixStatus === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8E44AD] to-[#A569BD] text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {matrixStatus === "loading" ? (
                <><Loader2 size={16} className="animate-spin" />AI 正在推导各竞品评分…</>
              ) : (
                <><Sparkles size={16} />AI 一键推导矩阵评分</>
              )}
            </button>
          )}

          {matrixStatus === "error" && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFEBEE] text-[#C62828]">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs">{matrixError}</p>
            </div>
          )}

          <AnimatePresence>
            {matrixStatus === "success" && matrixPreview && !matrixApplied && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F9F0FF] text-[#6C3483]">
                  <Check size={14} />
                  <p className="text-xs font-semibold">AI 评分完成！请确认后应用</p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {matrixPreview.map((result) => {
                    const comp = competitorMatrix.competitors.find((c) => c.id === result.competitorId);
                    return (
                      <div key={result.competitorId} className="rounded-xl border border-[#E8DFD0] overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F2]">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: comp?.color }} />
                          <span className="text-xs font-semibold text-[#1A1A2E]">{result.competitorName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {competitorMatrix.dimensions.map((dim) => {
                            const score = result.scores[dim.name] ?? 50;
                            const oldScore = dim.scores[result.competitorId] ?? 50;
                            const diff = score - oldScore;
                            return (
                              <div key={dim.id} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white border border-[#F0EDE8]">
                                <span className="text-[10px] text-[#6B6B6B] truncate">{dim.name}</span>
                                <div className="flex items-center gap-1 ml-1">
                                  <span className="text-[10px] font-bold text-[#8E44AD]">{score}</span>
                                  {diff !== 0 && (
                                    <span className={`text-[9px] font-semibold ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                                      {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleApplyMatrix}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[#8E44AD] text-white hover:bg-[#7D3C98] transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} />确认应用矩阵评分
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {matrixApplied && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-[#F9F0FF] text-[#6C3483]"
            >
              <Check size={16} />
              <div>
                <p className="text-sm font-semibold">矩阵评分已更新！</p>
                <p className="text-xs mt-0.5">所有竞品的维度评分已根据AI推导结果更新。</p>
              </div>
              <button
                onClick={() => { setMatrixApplied(false); setMatrixStatus("idle"); setMatrixPreview(null); }}
                className="ml-auto text-xs underline text-[#6C3483]"
              >
                重新评分
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
