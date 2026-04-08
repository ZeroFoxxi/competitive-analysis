import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { Sparkles, Loader2, Check, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

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

export default function RecomputePanel() {
  const {
    companies,
    keyMetrics,
    comparisonData,
    updateComparisonItem,
    addComparisonItem,
    removeComparisonItem,
  } = useData();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<RecomputedCategory[] | null>(null);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);

  const handleRecompute = async () => {
    setStatus("loading");
    setErrorMsg("");
    setApplied(false);

    // Build metrics map
    const metricsMap: Record<string, any> = {};
    keyMetrics.forEach((m) => {
      metricsMap[m.label] = { leadong: m.leadong, globalso: m.globalso, unit: m.unit };
    });

    const leadongData = {
      price: companies.leadong?.price,
      positioning: companies.leadong?.positioning,
      metrics: metricsMap,
      features: {},
    };
    const globalsoData = {
      price: companies.globalso?.price,
      positioning: companies.globalso?.positioning,
      metrics: metricsMap,
      features: {},
    };

    try {
      const res = await fetch("/api/recompute-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadongData,
          globalsoData,
          currentComparison: comparisonData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setStatus("error");
        setErrorMsg(json.error || "重算失败，请重试");
        return;
      }
      if (json.data?.categories?.length > 0) {
        setPreview(json.data.categories);
        setStatus("success");
        setExpandedCat(0);
      } else {
        setStatus("error");
        setErrorMsg("AI返回数据格式异常，请重试");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "网络错误，请重试");
    }
  };

  const handleApply = () => {
    if (!preview) return;

    preview.forEach((newCat) => {
      // Find matching category in current data
      const catIdx = comparisonData.findIndex(
        (c) => c.category === newCat.category || c.category.includes(newCat.category.slice(0, 4))
      );

      if (catIdx >= 0) {
        // Update existing items
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
        // Remove extra old items
        const oldLen = comparisonData[catIdx].items.length;
        const newLen = newCat.items.length;
        if (oldLen > newLen) {
          for (let i = oldLen - 1; i >= newLen; i--) {
            removeComparisonItem(catIdx, i);
          }
        }
      }
    });

    setApplied(true);
  };

  const winnerLabel = (w: string) => {
    if (w === "leadong") return <span className="text-[#D4782A] font-semibold text-xs">领动胜</span>;
    if (w === "globalso") return <span className="text-[#2980B9] font-semibold text-xs">全球搜胜</span>;
    return <span className="text-[#8B7355] text-xs">持平</span>;
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFF8F0] border border-[#F5C88A]">
        <Sparkles size={14} className="text-[#D4782A] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#8B7355] leading-relaxed">
          修改价格或指标后，点击下方按钮让 AI 根据最新数据<strong>自动重新推导</strong>所有对比项的描述、胜出方和分析备注，无需手动逐行修改。
        </p>
      </div>

      {/* Current prices summary */}
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

      {/* Recompute button */}
      {!applied && (
        <button
          onClick={handleRecompute}
          disabled={status === "loading"}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D4782A] to-[#E8962A] text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              AI 正在重新推导所有对比项…
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              AI 一键重算全部对比分析
            </>
          )}
        </button>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFEBEE] text-[#C62828]">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold">重算失败</p>
            <p className="text-xs mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Preview results */}
      <AnimatePresence>
        {status === "success" && preview && !applied && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
              <Check size={14} />
              <p className="text-xs font-semibold">AI 重算完成！预览结果如下，确认后点击应用</p>
            </div>

            {/* Category accordion */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {preview.map((cat, ci) => (
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
                          {item.note && (
                            <p className="text-[10px] text-[#8B7355] italic">💬 {item.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleApply}
              className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[#1A1A2E] text-white hover:bg-[#2C3E50] transition-colors flex items-center justify-center gap-2"
            >
              <Check size={16} />
              确认应用全部重算结果
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applied success */}
      {applied && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-[#E8F5E9] text-[#2E7D32]"
        >
          <Check size={16} />
          <div>
            <p className="text-sm font-semibold">全部对比数据已更新！</p>
            <p className="text-xs mt-0.5">所有对比项的描述、胜出方和分析备注已根据最新数据自动重算。</p>
          </div>
          <button
            onClick={() => { setApplied(false); setStatus("idle"); setPreview(null); }}
            className="ml-auto text-xs underline text-[#2E7D32]"
          >
            再次重算
          </button>
        </motion.div>
      )}
    </div>
  );
}
