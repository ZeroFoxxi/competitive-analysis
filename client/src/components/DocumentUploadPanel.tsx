import { useState, useRef, useCallback } from "react";
import { useAIConfig } from "../contexts/AIConfigContext";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Building2,
  Grid3X3,
} from "lucide-react";

interface ExtractedData {
  companyName?: string;
  productName?: string;
  price?: number;
  phone?: string;
  positioning?: string;
  features?: Record<string, string[]>;
  keyMetrics?: Record<string, { value: number; unit: string }>;
  strengths?: string[];
  weaknesses?: string[];
  summary?: string;
  // AI推导的矩阵维度评分
  dimensionScores?: Record<string, number>;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} className="text-red-500" />,
  docx: <FileText size={18} className="text-blue-500" />,
  doc: <FileText size={18} className="text-blue-500" />,
  xlsx: <FileSpreadsheet size={18} className="text-green-600" />,
  xls: <FileSpreadsheet size={18} className="text-green-600" />,
  txt: <FileText size={18} className="text-gray-400" />,
  csv: <FileSpreadsheet size={18} className="text-green-400" />,
};

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || <FileText size={18} className="text-gray-400" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 目标类型
type TargetType =
  | { kind: "main"; key: "leadong" | "globalso" }
  | { kind: "matrix"; id: string };

interface Props {
  onClose?: () => void;
}

export default function DocumentUploadPanel({ onClose }: Props) {
  const {
    updateCompany,
    updateKeyMetric,
    addSwotItem,
    keyMetrics,
    companies,
    competitorMatrix,
    updateMatrixCompetitor,
    updateMatrixScore,
    addMatrixCompetitor,
  } = useData();
  const { getRequestParams } = useAIConfig();

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [applied, setApplied] = useState(false);

  // 目标选择：默认选主报告-领动
  const [target, setTarget] = useState<TargetType>({ kind: "main", key: "leadong" });
  // 是否同时创建新矩阵竞品
  const [createNewMatrixEntry, setCreateNewMatrixEntry] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStatus("idle");
    setExtracted(null);
    setApplied(false);
    setErrorMsg("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    // 传递矩阵维度名称，让AI推导评分
    const dimNames = competitorMatrix.dimensions.map((d) => d.name);
    formData.append("dimensionNames", JSON.stringify(dimNames));
    // 传递AI配置
    formData.append("aiConfig", JSON.stringify(getRequestParams()));

    try {
      const res = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setStatus("error");
        setErrorMsg(json.error || "上传失败，请重试");
        return;
      }
      setExtracted(json.data);
      setPreview(json.preview || "");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "网络错误，请重试");
    }
  };

  const handleApply = () => {
    if (!extracted) return;

    if (target.kind === "main") {
      // 应用到主报告（领动/全球搜）
      const key = target.key;
      const updates: any = {};
      if (extracted.companyName) updates.name = extracted.companyName;
      if (extracted.productName) updates.product = extracted.productName;
      if (extracted.price && extracted.price > 0) updates.price = extracted.price;
      if (extracted.phone) updates.phone = extracted.phone;
      if (extracted.positioning) updates.positioning = extracted.positioning;
      if (Object.keys(updates).length > 0) updateCompany(key, updates);

      // 更新关键指标
      if (extracted.keyMetrics) {
        const metricMap: Record<string, number> = {
          "年度内容产出": 0, "内容产出量": 0,
          "外链建设": 1, "反向链接": 1,
          "关键词排名": 2,
          "服务响应时间": 3,
        };
        Object.entries(extracted.keyMetrics).forEach(([k, val]) => {
          const idx = metricMap[k];
          if (idx !== undefined && val?.value) updateKeyMetric(idx, key, val.value);
        });
      }

      // 更新SWOT
      if (extracted.strengths?.length) {
        extracted.strengths.slice(0, 3).forEach((s) => addSwotItem(key, "strengths", s));
      }
      if (extracted.weaknesses?.length) {
        extracted.weaknesses.slice(0, 2).forEach((w) => addSwotItem(key, "weaknesses", w));
      }
    } else {
      // 应用到矩阵竞品
      const matrixId = target.id;
      const updates: any = {};
      if (extracted.companyName || extracted.productName)
        updates.name = extracted.companyName || extracted.productName;
      if (extracted.price && extracted.price > 0) updates.price = extracted.price;
      if (extracted.positioning) updates.positioning = extracted.positioning;
      if (Object.keys(updates).length > 0) updateMatrixCompetitor(matrixId, updates);

      // 应用AI推导的维度评分
      if (extracted.dimensionScores) {
        competitorMatrix.dimensions.forEach((dim) => {
          const score = extracted.dimensionScores?.[dim.name];
          if (score !== undefined && score >= 0 && score <= 100) {
            updateMatrixScore(dim.id, matrixId, score);
          }
        });
      }
    }

    // 如果勾选了"同时创建新矩阵竞品"
    if (createNewMatrixEntry && target.kind === "main" && competitorMatrix.competitors.length < 5) {
      const newId = `comp-${Date.now()}`;
      const colors = ["#27AE60", "#8E44AD", "#E74C3C"];
      const usedColors = competitorMatrix.competitors.map((c) => c.color);
      const color = colors.find((c) => !usedColors.includes(c)) || "#27AE60";
      addMatrixCompetitor({
        id: newId,
        name: extracted.companyName || extracted.productName || "新竞品",
        color,
        price: extracted.price || 0,
        positioning: extracted.positioning || "",
      });
      // 同时应用AI推导的维度评分到新竞品
      if (extracted.dimensionScores) {
        competitorMatrix.dimensions.forEach((dim) => {
          const score = extracted.dimensionScores?.[dim.name];
          if (score !== undefined) updateMatrixScore(dim.id, newId, score);
        });
      }
    }

    setApplied(true);
  };

  // 获取当前目标的显示名称和颜色
  const getTargetLabel = (t: TargetType) => {
    if (t.kind === "main") {
      const c = companies[t.key];
      return { name: c?.name || t.key, color: c?.color || "#D4782A" };
    } else {
      const c = competitorMatrix.competitors.find((x) => x.id === t.id);
      return { name: c?.name || t.id, color: c?.color || "#27AE60" };
    }
  };

  const matrixCompetitors = competitorMatrix.competitors;

  return (
    <div className="space-y-5">
      {/* 目标选择器 */}
      <div>
        <p className="text-xs font-semibold text-[#8B7355] mb-2 flex items-center gap-1.5">
          <Building2 size={12} />
          选择要更新的竞品
        </p>

        {/* 主报告竞品 */}
        <div className="mb-2">
          <p className="text-[10px] text-[#BFAE96] mb-1.5 uppercase tracking-wider font-semibold">主报告竞品</p>
          <div className="flex gap-2">
            {(["leadong", "globalso"] as const).map((key) => {
              const isSelected = target.kind === "main" && target.key === key;
              const c = companies[key];
              return (
                <button
                  key={key}
                  onClick={() => setTarget({ kind: "main", key })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isSelected
                      ? "text-white border-transparent shadow-md"
                      : "bg-white text-[#6B6B6B] border-[#E8DFD0] hover:border-[#BFAE96]"
                  }`}
                  style={isSelected ? { backgroundColor: c?.color } : {}}
                >
                  <div className="truncate">{c?.name || key}</div>
                  {c?.price ? (
                    <div className={`text-[10px] mt-0.5 ${isSelected ? "text-white/80" : "text-[#BFAE96]"}`}>
                      ¥{(c.price / 10000).toFixed(0)}万/年
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* 矩阵竞品 */}
        <div>
          <p className="text-[10px] text-[#BFAE96] mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Grid3X3 size={10} />
            对比矩阵竞品
          </p>
          <div className="grid grid-cols-2 gap-2">
            {matrixCompetitors.map((comp) => {
              const isSelected = target.kind === "matrix" && target.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => setTarget({ kind: "matrix", id: comp.id })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isSelected
                      ? "text-white border-transparent shadow-md"
                      : "bg-white text-[#6B6B6B] border-[#E8DFD0] hover:border-[#BFAE96]"
                  }`}
                  style={isSelected ? { backgroundColor: comp.color } : {}}
                >
                  <div className="truncate">{comp.name}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? "text-white/80" : "text-[#BFAE96]"}`}>
                    {comp.price > 0 ? `¥${(comp.price / 10000).toFixed(0)}万/年` : "价格未填"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 同时创建矩阵竞品选项（仅主报告模式） */}
        {target.kind === "main" && matrixCompetitors.length < 5 && (
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={createNewMatrixEntry}
              onChange={(e) => setCreateNewMatrixEntry(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#D4782A]"
            />
            <span className="text-xs text-[#8B7355]">
              同时将此竞品添加到<strong>对比矩阵</strong>（AI自动评分）
            </span>
          </label>
        )}
      </div>

      {/* 当前选择提示 */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
        style={{ backgroundColor: getTargetLabel(target).color }}
      >
        <Check size={12} />
        将上传文档的数据应用到：{getTargetLabel(target).name}
      </div>

      {/* 拖拽上传区 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#D4782A] bg-[#FFF8F0]"
            : file
            ? "border-[#27AE60]/50 bg-[#F0FFF4]"
            : "border-[#E8DFD0] hover:border-[#D4782A]/50 hover:bg-[#FFFDF8]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            {getFileIcon(file.name)}
            <div className="text-left">
              <p className="text-sm font-semibold text-[#1A1A2E]">{file.name}</p>
              <p className="text-xs text-[#8B7355]">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setExtracted(null); setStatus("idle"); }}
              className="ml-auto p-1 rounded-full hover:bg-[#F0EDE8] text-[#8B7355]"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={28} className="text-[#BFAE96] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1A1A2E] mb-1">拖拽文件到此处，或点击选择</p>
            <p className="text-xs text-[#8B7355]">支持 PDF、Word (.docx)、Excel (.xlsx)、TXT、CSV</p>
            <p className="text-xs text-[#BFAE96] mt-1">最大 20MB</p>
          </>
        )}
      </div>

      {/* 上传按钮 */}
      {file && status !== "success" && (
        <button
          onClick={handleUpload}
          disabled={status === "uploading"}
          className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D4782A] to-[#E8962A] text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {status === "uploading" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              AI 正在解析文档…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              AI 解析并提取竞品数据
            </>
          )}
        </button>
      )}

      {/* 错误提示 */}
      {status === "error" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFEBEE] text-[#C62828]">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs">{errorMsg}</p>
        </div>
      )}

      {/* 解析结果预览 */}
      <AnimatePresence>
        {status === "success" && extracted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
              <Check size={14} />
              <p className="text-xs font-semibold">AI 解析完成！请确认以下提取结果</p>
            </div>

            {/* 提取信息预览 */}
            <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 space-y-3">
              {extracted.companyName && (
                <div className="flex gap-2">
                  <span className="text-xs text-[#8B7355] w-20 flex-shrink-0">公司名称</span>
                  <span className="text-xs font-semibold text-[#1A1A2E]">{extracted.companyName}</span>
                </div>
              )}
              {extracted.productName && (
                <div className="flex gap-2">
                  <span className="text-xs text-[#8B7355] w-20 flex-shrink-0">产品名称</span>
                  <span className="text-xs font-semibold text-[#1A1A2E]">{extracted.productName}</span>
                </div>
              )}
              {extracted.price && extracted.price > 0 && (
                <div className="flex gap-2">
                  <span className="text-xs text-[#8B7355] w-20 flex-shrink-0">年度价格</span>
                  <span className="text-xs font-bold text-[#D4782A]">¥{extracted.price.toLocaleString()}</span>
                </div>
              )}
              {extracted.positioning && (
                <div className="flex gap-2">
                  <span className="text-xs text-[#8B7355] w-20 flex-shrink-0">产品定位</span>
                  <span className="text-xs text-[#1A1A2E]">{extracted.positioning}</span>
                </div>
              )}
              {extracted.strengths && extracted.strengths.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-xs text-[#8B7355] w-20 flex-shrink-0">核心优势</span>
                  <div className="space-y-0.5">
                    {extracted.strengths.slice(0, 3).map((s, i) => (
                      <p key={i} className="text-xs text-[#2E7D32]">✓ {s}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* 矩阵维度评分预览 */}
              {extracted.dimensionScores && Object.keys(extracted.dimensionScores).length > 0 && (
                <div className="pt-2 border-t border-[#F0EDE8]">
                  <p className="text-xs font-semibold text-[#8B7355] mb-2 flex items-center gap-1">
                    <Grid3X3 size={11} />
                    AI 推导的矩阵维度评分
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(extracted.dimensionScores).map(([dim, score]) => (
                      <div key={dim} className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#FAF7F2]">
                        <span className="text-[10px] text-[#6B6B6B] truncate">{dim}</span>
                        <span className="text-[10px] font-bold text-[#D4782A] ml-1">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extracted.summary && (
                <div className="pt-2 border-t border-[#F0EDE8]">
                  <p className="text-xs text-[#6B6B6B] italic">{extracted.summary}</p>
                </div>
              )}
            </div>

            {/* 原文预览 */}
            {preview && (
              <div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-xs text-[#8B7355] hover:text-[#1A1A2E] transition-colors"
                >
                  <Info size={11} />
                  {showPreview ? "隐藏" : "查看"}文档原文预览
                  {showPreview ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                {showPreview && (
                  <div className="mt-2 p-3 rounded-xl bg-[#FAF7F2] text-xs text-[#6B6B6B] font-mono leading-relaxed max-h-32 overflow-y-auto">
                    {preview}
                  </div>
                )}
              </div>
            )}

            {/* 应用按钮 */}
            {!applied ? (
              <button
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[#1A1A2E] text-white hover:bg-[#2C3E50] transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                应用到「{getTargetLabel(target).name}」
                {createNewMatrixEntry && target.kind === "main" ? " + 添加到矩阵" : ""}
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
                <Check size={14} />
                <p className="text-xs font-semibold">已成功应用！数据已更新。</p>
                <button
                  onClick={() => { setFile(null); setExtracted(null); setStatus("idle"); setApplied(false); }}
                  className="ml-auto text-xs underline text-[#2E7D32] hover:text-[#1B5E20]"
                >
                  继续上传
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
