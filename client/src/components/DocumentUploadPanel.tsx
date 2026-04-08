import { useState, useRef, useCallback } from "react";
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
  RefreshCw,
  Info,
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

interface Props {
  targetCompany: "leadong" | "globalso" | "new";
  onClose: () => void;
}

export default function DocumentUploadPanel({ targetCompany, onClose }: Props) {
  const { updateCompany, updateKeyMetric, updateSwotItem, addSwotItem, keyMetrics, companies } = useData();

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [applyTarget, setApplyTarget] = useState<"leadong" | "globalso">(
    targetCompany === "new" ? "leadong" : targetCompany
  );
  const [applied, setApplied] = useState(false);
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
    const target = applyTarget;

    // 更新公司基本信息
    const updates: any = {};
    if (extracted.companyName) updates.name = extracted.companyName;
    if (extracted.productName) updates.product = extracted.productName;
    if (extracted.price && extracted.price > 0) updates.price = extracted.price;
    if (extracted.phone) updates.phone = extracted.phone;
    if (extracted.positioning) updates.positioning = extracted.positioning;
    if (Object.keys(updates).length > 0) {
      updateCompany(target, updates);
    }

    // 更新关键指标
    if (extracted.keyMetrics) {
      const metricMap: Record<string, number> = {
        "年度内容产出": 0,
        "外链建设": 1,
        "关键词排名": 2,
        "服务响应时间": 3,
      };
      Object.entries(extracted.keyMetrics).forEach(([key, val]) => {
        const idx = metricMap[key];
        if (idx !== undefined && val?.value) {
          updateKeyMetric(idx, target, val.value);
        }
      });
    }

    // 更新SWOT优势/劣势
    if (extracted.strengths?.length) {
      extracted.strengths.forEach((s, i) => {
        if (i < 3) addSwotItem(target, "strengths", s);
      });
    }
    if (extracted.weaknesses?.length) {
      extracted.weaknesses.forEach((w, i) => {
        if (i < 2) addSwotItem(target, "weaknesses", w);
      });
    }

    setApplied(true);
  };

  return (
    <div className="space-y-5">
      {/* Target selector */}
      <div>
        <p className="text-xs font-semibold text-[#8B7355] mb-2">将提取的数据应用到</p>
        <div className="flex gap-2">
          {(["leadong", "globalso"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setApplyTarget(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                applyTarget === key
                  ? key === "leadong"
                    ? "bg-[#D4782A] text-white border-[#D4782A]"
                    : "bg-[#2980B9] text-white border-[#2980B9]"
                  : "bg-white text-[#6B6B6B] border-[#E8DFD0] hover:border-[#BFAE96]"
              }`}
            >
              {companies[key]?.name || (key === "leadong" ? "领动" : "全球搜")}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
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
            <p className="text-xs text-[#8B7355]">支持 PDF、Word (.docx/.doc)、Excel (.xlsx/.xls)、TXT、CSV</p>
            <p className="text-xs text-[#BFAE96] mt-1">最大 20MB</p>
          </>
        )}
      </div>

      {/* Upload button */}
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

      {/* Error */}
      {status === "error" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFEBEE] text-[#C62828]">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs">{errorMsg}</p>
        </div>
      )}

      {/* Success: show extracted data */}
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

            {/* Extracted info preview */}
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
              {extracted.summary && (
                <div className="pt-2 border-t border-[#F0EDE8]">
                  <p className="text-xs text-[#6B6B6B] italic">{extracted.summary}</p>
                </div>
              )}
            </div>

            {/* Preview toggle */}
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

            {/* Apply button */}
            {!applied ? (
              <button
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[#1A1A2E] text-white hover:bg-[#2C3E50] transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                应用到「{companies[applyTarget]?.name || applyTarget}」数据
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
                <Check size={14} />
                <p className="text-xs font-semibold">已成功应用！页面数据已更新。</p>
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
