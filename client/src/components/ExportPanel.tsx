import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function ExportPanel() {
  const {
    companies,
    comparisonData,
    keyMetrics,
    radarData,
    swotData,
    competitorMatrix,
    winRateData,
  } = useData();

  const [mdStatus, setMdStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mdError, setMdError] = useState("");
  const [mdContent, setMdContent] = useState("");
  const [copied, setCopied] = useState(false);

  // 生成 Markdown 报告（通过API）
  const handleExportMd = async () => {
    setMdStatus("loading");
    setMdError("");
    try {
      const res = await fetch("/api/export-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companies,
          comparisonData,
          keyMetrics,
          radarData,
          swotData,
          competitorMatrix,
          winRateData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMdStatus("error");
        setMdError(json.error || "导出失败");
        return;
      }
      setMdContent(json.markdown);
      setMdStatus("success");

      // 自动下载
      downloadText(json.markdown, json.filename || "竞品分析报告.md");
    } catch (err: any) {
      setMdStatus("error");
      setMdError(err.message || "网络错误");
    }
  };

  // 本地生成 CSV（无需API）
  const handleExportCsv = () => {
    const rows: string[][] = [];

    // 标题行
    const leadongName = companies.leadong?.name || "领动";
    const globalsoName = companies.globalso?.name || "全球搜";

    rows.push(["竞品分析报告", `生成时间: ${new Date().toLocaleString("zh-CN")}`, "", "", ""]);
    rows.push([]);
    rows.push(["=== 基本信息 ===", "", "", "", ""]);
    rows.push(["项目", leadongName, globalsoName, "", ""]);
    rows.push(["年度价格", `¥${(companies.leadong?.price || 0).toLocaleString()}`, `¥${(companies.globalso?.price || 0).toLocaleString()}`, "", ""]);
    rows.push(["产品定位", companies.leadong?.positioning || "", companies.globalso?.positioning || "", "", ""]);
    rows.push([]);

    // 关键指标
    rows.push(["=== 关键指标 ===", "", "", "", ""]);
    rows.push(["指标", leadongName, globalsoName, "单位", ""]);
    keyMetrics.forEach((m) => {
      rows.push([m.label, String(m.leadong), String(m.globalso), m.unit, ""]);
    });
    rows.push([]);

    // 对比数据
    rows.push(["=== 详细对比 ===", "", "", "", ""]);
    rows.push(["类别", "对比项", leadongName, globalsoName, "胜出方", "备注"]);
    comparisonData.forEach((cat) => {
      cat.items.forEach((item) => {
        const winner =
          item.winner === "leadong" ? leadongName : item.winner === "globalso" ? globalsoName : "持平";
        rows.push([cat.category, item.name, item.leadong, item.globalso, winner, item.note || ""]);
      });
    });
    rows.push([]);

    // 矩阵数据
    if (competitorMatrix.competitors.length > 0) {
      rows.push(["=== 多竞品对比矩阵 ===", "", "", "", ""]);
      const compNames = competitorMatrix.competitors.map((c) => c.name);
      rows.push(["维度", ...compNames]);
      competitorMatrix.dimensions.forEach((dim) => {
        const scores = competitorMatrix.competitors.map((c) => String(dim.scores[c.id] ?? "-"));
        rows.push([dim.name, ...scores]);
      });
      // 均分行
      const avgScores = competitorMatrix.competitors.map((c) => {
        const total = competitorMatrix.dimensions.reduce((s, d) => s + (d.scores[c.id] ?? 50), 0);
        return String(Math.round(total / competitorMatrix.dimensions.length));
      });
      rows.push(["综合均分", ...avgScores]);
    }

    // 转为CSV
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const bom = "\uFEFF"; // UTF-8 BOM for Excel
    downloadText(bom + csv, `竞品分析报告_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.csv`);
  };

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!mdContent) return;
    await navigator.clipboard.writeText(mdContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = comparisonData.reduce((s, c) => s + c.items.length, 0);
  const matrixComps = competitorMatrix.competitors.length;

  return (
    <div className="space-y-5">
      {/* 报告概览 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "对比项", value: totalItems, color: "#D4782A" },
          { label: "矩阵竞品", value: matrixComps, color: "#8E44AD" },
          { label: "历史快照", value: 0, color: "#27AE60" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-xl bg-white border border-[#E8DFD0] text-center">
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] text-[#8B7355] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 导出选项 */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#8B7355]">选择导出格式</p>

        {/* Markdown 导出 */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD0] space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-[#D4782A]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A2E]">Markdown 报告</p>
              <p className="text-xs text-[#8B7355] mt-0.5">
                包含完整对比表格、SWOT分析、矩阵数据，可直接粘贴到 Notion、飞书文档等平台
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportMd}
              disabled={mdStatus === "loading"}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D4782A] to-[#E8962A] text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {mdStatus === "loading" ? (
                <><Loader2 size={12} className="animate-spin" />生成中…</>
              ) : (
                <><Download size={12} />下载 .md 文件</>
              )}
            </button>
            {mdContent && (
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#E8DFD0] text-[#6B6B6B] hover:bg-[#FAF7F2] flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                {copied ? "已复制" : "复制"}
              </button>
            )}
          </div>

          {mdStatus === "error" && (
            <div className="flex items-center gap-2 text-xs text-[#C62828]">
              <AlertCircle size={12} />
              {mdError}
            </div>
          )}
          {mdStatus === "success" && (
            <div className="flex items-center gap-2 text-xs text-[#2E7D32]">
              <Check size={12} />
              Markdown 报告已下载！
            </div>
          )}
        </div>

        {/* CSV 导出 */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD0] space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F0FFF4] flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet size={16} className="text-[#27AE60]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A2E]">Excel/CSV 数据表</p>
              <p className="text-xs text-[#8B7355] mt-0.5">
                包含所有对比数据和矩阵评分，可直接用 Excel 打开进行二次分析
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCsv}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-[#27AE60] text-white hover:bg-[#229954] flex items-center justify-center gap-1.5"
          >
            <Download size={12} />
            下载 .csv 文件（可用 Excel 打开）
          </button>
        </div>

        {/* 分享提示 */}
        <div className="p-3 rounded-xl bg-[#F0F7FC] border border-[#85C1E9]/50">
          <div className="flex items-start gap-2">
            <ExternalLink size={12} className="text-[#2980B9] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1A4E79]">分享在线报告</p>
              <p className="text-xs text-[#2980B9] mt-0.5 break-all">
                https://competitive-analysis-six.vercel.app
              </p>
              <p className="text-[10px] text-[#5DADE2] mt-1">
                直接分享此链接，对方可查看完整的交互式分析报告
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
