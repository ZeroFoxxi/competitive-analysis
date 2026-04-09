import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import DocumentUploadPanel from "@/components/DocumentUploadPanel";
import RecomputePanel from "@/components/RecomputePanel";
import ExportPanel from "@/components/ExportPanel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, RotateCcw, Plus, Trash2, Save, MessageSquarePlus, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { COLORS } from "@/lib/data";

const sectionTabs = [
  { id: "overview", label: "基本信息 & 价格", type: "data" },
  { id: "metrics", label: "核心指标", type: "data" },
  { id: "radar", label: "雷达图评分", type: "data" },
  { id: "comparison", label: "对比详情", type: "data" },
  { id: "swot", label: "SWOT分析", type: "data" },
  { id: "notes", label: "补充备注", type: "data" },
  { id: "upload", label: "📄 上传文档", type: "ai" },
  { id: "recompute", label: "✨ AI重算", type: "ai" },
  { id: "export", label: "📥 导出报告", type: "ai" },
];

export default function EditPanel() {
  const data = useData();
  const { isEditPanelOpen, setEditPanelOpen, editSection, setEditSection } = data;

  return (
    <Sheet open={isEditPanelOpen} onOpenChange={setEditPanelOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-[#FFFDF8] border-l border-[#E8DFD0]">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#E8DFD0] bg-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4782A] to-[#2980B9] flex items-center justify-center">
                <Pencil size={16} className="text-white" />
              </div>
              <div>
                <SheetTitle className="text-[#1A1A2E] text-lg" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  数据编辑面板
                </SheetTitle>
                <SheetDescription className="text-xs text-[#8B7355]">
                  修改数据后图表自动更新，刷新页面不丢失
                </SheetDescription>
              </div>
            </div>
          </div>
          {data.hasChanges && (
            <button
              onClick={() => {
                if (window.confirm("确定要重置所有修改吗？这将恢复为原始报告数据。")) {
                  data.resetAll();
                }
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] transition-colors"
            >
              <RotateCcw size={12} /> 重置为原始数据
            </button>
          )}
        </SheetHeader>

        {/* Section tabs - 两行布局 */}
        <div className="px-3 py-2 border-b border-[#E8DFD0] bg-[#FAF7F2] space-y-1.5">
          {/* 数据编辑 Tab 行 */}
          <div className="flex flex-wrap gap-1">
            {sectionTabs.filter(t => t.type === "data").map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditSection(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  editSection === tab.id
                    ? "bg-[#1A1A2E] text-white shadow-sm"
                    : "text-[#6B6B6B] hover:bg-white hover:text-[#1A1A2E]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* AI 功能 Tab 行 */}
          <div className="flex gap-1 pt-0.5 border-t border-[#E8DFD0]">
            <span className="text-[10px] text-[#BFAE96] self-center mr-1">AI功能</span>
            {sectionTabs.filter(t => t.type === "ai").map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditSection(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  editSection === tab.id
                    ? "bg-gradient-to-r from-[#D4782A] to-[#E8A050] text-white shadow-sm"
                    : "text-[#D4782A] bg-[#FFF3E8] hover:bg-[#FFE0C0] hover:text-[#B05A10]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-5">
            {editSection === "overview" && <OverviewEditor />}
            {editSection === "metrics" && <MetricsEditor />}
            {editSection === "radar" && <RadarEditor />}
            {editSection === "comparison" && <ComparisonEditor />}
            {editSection === "swot" && <SwotEditor />}
            {editSection === "notes" && <NotesEditor />}
            {editSection === "upload" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-[#D4782A]" />
                  <p className="text-xs text-[#8B7355]">上传竞品方案文档，AI自动提取数据并填充到对应竞品</p>
                </div>
                <DocumentUploadPanel />
              </div>
            )}
            {editSection === "recompute" && (
              <div className="space-y-4">
                {data.pendingRecompute && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF3E0] border border-[#FFB74D] animate-pulse">
                    <AlertCircle size={14} className="text-[#E65100] flex-shrink-0" />
                    <p className="text-xs text-[#E65100] font-semibold">检测到价格或指标已修改，建议重算对比分析</p>
                    <button onClick={data.clearPendingRecompute} className="ml-auto text-[10px] text-[#8B7355] underline">忽略</button>
                  </div>
                )}
                <RecomputePanel />
              </div>
            )}
            {editSection === "export" && <ExportPanel />}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ---- Overview / Company Info Editor ----
function OverviewEditor() {
  const { companies, updateCompany } = useData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-[#D4782A]" />
        <p className="text-xs text-[#8B7355]">修改价格和基本信息后，概览区域的数据会实时更新</p>
      </div>
      {Object.entries(companies).map(([key, company]) => (
        <div key={key} className="p-4 rounded-xl border border-[#E8DFD0] bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: company.color }} />
            <h4 className="font-bold text-sm text-[#1A1A2E]">{company.name}</h4>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#8B7355] font-medium block mb-1">产品名称</label>
              <input
                type="text"
                value={company.product}
                onChange={(e) => updateCompany(key, { product: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
              />
            </div>
            <div>
              <label className="text-xs text-[#8B7355] font-medium block mb-1">
                年度服务费（元）
                <span className="text-[#BFAE96] font-normal ml-1">例如：销售底价可便宜3万</span>
              </label>
              <input
                type="number"
                value={company.price}
                onChange={(e) => updateCompany(key, { price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
              />
            </div>
            <div>
              <label className="text-xs text-[#8B7355] font-medium block mb-1">定位描述</label>
              <input
                type="text"
                value={company.positioning}
                onChange={(e) => updateCompany(key, { positioning: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Key Metrics Editor ----
function MetricsEditor() {
  const { keyMetrics, updateKeyMetric } = useData();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-[#D4782A]" />
        <p className="text-xs text-[#8B7355]">修改数值后，概览区域的条形图会实时更新</p>
      </div>
      {keyMetrics.map((metric, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-[#E8DFD0] bg-white">
          <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">{metric.label}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: COLORS.leadong }}>领动</label>
              <input
                type="number"
                value={metric.leadong}
                onChange={(e) => updateKeyMetric(idx, "leadong", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: COLORS.globalso }}>全球搜</label>
              <input
                type="number"
                value={metric.globalso}
                onChange={(e) => updateKeyMetric(idx, "globalso", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Radar Score Editor ----
function RadarEditor() {
  const { radarData, updateRadarScore } = useData();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-[#D4782A]" />
        <p className="text-xs text-[#8B7355]">拖动滑块调整各维度评分（0-100），雷达图实时更新</p>
      </div>
      {radarData.dimensions.map((dim, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-[#E8DFD0] bg-white">
          <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">{dim}</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium w-12" style={{ color: COLORS.leadong }}>领动</span>
              <input
                type="range"
                min="0"
                max="100"
                value={radarData.leadong[idx]}
                onChange={(e) => updateRadarScore("leadong", idx, parseInt(e.target.value))}
                className="flex-1 accent-[#D4782A]"
              />
              <span className="text-sm font-bold w-8 text-right" style={{ color: COLORS.leadong }}>
                {radarData.leadong[idx]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium w-12" style={{ color: COLORS.globalso }}>全球搜</span>
              <input
                type="range"
                min="0"
                max="100"
                value={radarData.globalso[idx]}
                onChange={(e) => updateRadarScore("globalso", idx, parseInt(e.target.value))}
                className="flex-1 accent-[#2980B9]"
              />
              <span className="text-sm font-bold w-8 text-right" style={{ color: COLORS.globalso }}>
                {radarData.globalso[idx]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Comparison Detail Editor ----
function ComparisonEditor() {
  const { comparisonData, updateComparisonItem, addComparisonItem, removeComparisonItem } = useData();
  const [expandedCat, setExpandedCat] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-[#D4782A]" />
        <p className="text-xs text-[#8B7355]">修改对比项的内容、胜出方判定，或添加/删除对比项</p>
      </div>
      {comparisonData.map((cat, catIdx) => (
        <div key={catIdx} className="rounded-xl border border-[#E8DFD0] bg-white overflow-hidden">
          <button
            onClick={() => setExpandedCat(expandedCat === catIdx ? null : catIdx)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#FAF7F2] transition-colors"
          >
            <span className="font-semibold text-sm text-[#1A1A2E]">
              {cat.icon} {cat.category}
              <span className="text-xs text-[#8B7355] font-normal ml-2">({cat.items.length}项)</span>
            </span>
            {expandedCat === catIdx ? <ChevronUp size={16} className="text-[#8B7355]" /> : <ChevronDown size={16} className="text-[#8B7355]" />}
          </button>

          {expandedCat === catIdx && (
            <div className="px-4 pb-4 space-y-3">
              {cat.items.map((item, itemIdx) => (
                <div key={itemIdx} className="p-3 rounded-lg bg-[#FAF7F2] space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateComparisonItem(catIdx, itemIdx, { name: e.target.value })}
                      className="font-medium text-sm text-[#1A1A2E] bg-transparent border-b border-transparent hover:border-[#E8DFD0] focus:border-[#D4782A] focus:outline-none px-1 py-0.5 flex-1"
                      placeholder="对比项名称"
                    />
                    <button
                      onClick={() => {
                        if (window.confirm(`确定删除"${item.name}"吗？`)) {
                          removeComparisonItem(catIdx, itemIdx);
                        }
                      }}
                      className="p-1 rounded hover:bg-red-50 text-[#C62828]/40 hover:text-[#C62828] transition-colors ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium" style={{ color: COLORS.leadong }}>领动</label>
                      <input
                        type="text"
                        value={item.leadong}
                        onChange={(e) => updateComparisonItem(catIdx, itemIdx, { leadong: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-[#E8DFD0] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#D4782A]/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium" style={{ color: COLORS.globalso }}>全球搜</label>
                      <input
                        type="text"
                        value={item.globalso}
                        onChange={(e) => updateComparisonItem(catIdx, itemIdx, { globalso: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-[#E8DFD0] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2980B9]/30"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#8B7355] font-medium">胜出方:</label>
                    {(["leadong", "globalso", "tie"] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => updateComparisonItem(catIdx, itemIdx, { winner: w })}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          item.winner === w
                            ? w === "leadong"
                              ? "bg-[#FFF8F0] text-[#D4782A] ring-1 ring-[#D4782A]/30"
                              : w === "globalso"
                              ? "bg-[#F0F7FC] text-[#2980B9] ring-1 ring-[#2980B9]/30"
                              : "bg-[#F0EBE3] text-[#8B7355] ring-1 ring-[#8B7355]/30"
                            : "bg-white text-[#BFAE96] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        {w === "leadong" ? "领动" : w === "globalso" ? "全球搜" : "持平"}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8B7355] font-medium">分析备注:</label>
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => updateComparisonItem(catIdx, itemIdx, { note: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-[#E8DFD0] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#8B7355]/30 mt-1"
                      placeholder="添加分析说明..."
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  addComparisonItem(catIdx, {
                    name: "新对比项",
                    leadong: "",
                    globalso: "",
                    winner: "tie",
                    note: "",
                  })
                }
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#D4C5A9] text-xs font-medium text-[#8B7355] hover:bg-[#FAF7F2] hover:border-[#D4782A] hover:text-[#D4782A] transition-all"
              >
                <Plus size={14} /> 添加新对比项
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---- SWOT Editor ----
function SwotEditor() {
  const { swotData, updateSwotItem, addSwotItem, removeSwotItem } = useData();
  const [activeCompany, setActiveCompany] = useState<"leadong" | "globalso">("leadong");
  const quadrants = [
    { key: "strengths", label: "优势", color: "#2E7D32" },
    { key: "weaknesses", label: "劣势", color: "#C62828" },
    { key: "opportunities", label: "机会", color: "#1565C0" },
    { key: "threats", label: "威胁", color: "#E65100" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setActiveCompany("leadong")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeCompany === "leadong" ? "text-white" : "text-[#6B6B6B] bg-white border border-[#E8DFD0]"
          }`}
          style={activeCompany === "leadong" ? { backgroundColor: COLORS.leadong } : {}}
        >
          领动
        </button>
        <button
          onClick={() => setActiveCompany("globalso")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeCompany === "globalso" ? "text-white" : "text-[#6B6B6B] bg-white border border-[#E8DFD0]"
          }`}
          style={activeCompany === "globalso" ? { backgroundColor: COLORS.globalso } : {}}
        >
          全球搜
        </button>
      </div>

      {quadrants.map((q) => {
        const items = (swotData[activeCompany] as any)[q.key] as string[];
        return (
          <div key={q.key} className="p-4 rounded-xl border border-[#E8DFD0] bg-white">
            <h4 className="font-semibold text-sm mb-3" style={{ color: q.color }}>
              {q.label}
            </h4>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateSwotItem(activeCompany, q.key, idx, e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded border border-[#E8DFD0] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-[#D4782A]/30"
                  />
                  <button
                    onClick={() => removeSwotItem(activeCompany, q.key, idx)}
                    className="p-1 rounded hover:bg-red-50 text-[#C62828]/40 hover:text-[#C62828] transition-colors mt-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSwotItem(activeCompany, q.key, "")}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded border border-dashed border-[#D4C5A9] text-[10px] font-medium text-[#8B7355] hover:bg-[#FAF7F2] transition-all"
              >
                <Plus size={12} /> 添加
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- User Notes Editor ----
function NotesEditor() {
  const { userNotes, addNote, removeNote } = useData();
  const [newNote, setNewNote] = useState({ section: "general", item: "", text: "" });

  const sectionOptions = [
    { value: "general", label: "通用备注" },
    { value: "price", label: "价格相关" },
    { value: "service", label: "服务相关" },
    { value: "seo", label: "SEO相关" },
    { value: "ai", label: "AI能力相关" },
    { value: "other", label: "其他" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquarePlus size={14} className="text-[#D4782A]" />
        <p className="text-xs text-[#8B7355]">
          记录方案文档中没有体现的内部信息，如销售底价、赠送服务、谈判空间等
        </p>
      </div>

      {/* Add new note */}
      <div className="p-4 rounded-xl border-2 border-dashed border-[#D4C5A9] bg-white">
        <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">添加新备注</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#8B7355] font-medium block mb-1">分类</label>
            <select
              value={newNote.section}
              onChange={(e) => setNewNote({ ...newNote, section: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
            >
              {sectionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8B7355] font-medium block mb-1">
              具体项目
              <span className="text-[#BFAE96] font-normal ml-1">（选填，如"领动价格"）</span>
            </label>
            <input
              type="text"
              value={newNote.item}
              onChange={(e) => setNewNote({ ...newNote, item: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20"
              placeholder="例如：领动价格、赠送服务"
            />
          </div>
          <div>
            <label className="text-xs text-[#8B7355] font-medium block mb-1">备注内容</label>
            <textarea
              value={newNote.text}
              onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#E8DFD0] bg-[#FFFDF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4782A]/20 min-h-[80px] resize-y"
              placeholder="例如：领动销售底价可便宜3万，实际成交价约198,000元；另外可能赠送额外3个月运营服务"
            />
          </div>
          <button
            onClick={() => {
              if (newNote.text.trim()) {
                addNote(newNote.section, newNote.item, newNote.text);
                setNewNote({ section: "general", item: "", text: "" });
              }
            }}
            disabled={!newNote.text.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A1A2E] text-white text-xs font-semibold hover:bg-[#2C3E50] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={14} /> 保存备注
          </button>
        </div>
      </div>

      {/* Existing notes */}
      {userNotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">已添加的备注 ({userNotes.length})</h4>
          <div className="space-y-2">
            {userNotes.map((note, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-[#E8DFD0] group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#8B7355] font-medium">
                        {sectionOptions.find((o) => o.value === note.sectionId)?.label || note.sectionId}
                      </span>
                      {note.itemId && (
                        <span className="text-[10px] text-[#BFAE96]">{note.itemId}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#4A4A4A] leading-relaxed">{note.text}</p>
                    <p className="text-[10px] text-[#BFAE96] mt-1">
                      {new Date(note.timestamp).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeNote(idx)}
                    className="p-1 rounded hover:bg-red-50 text-[#C62828]/30 hover:text-[#C62828] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
