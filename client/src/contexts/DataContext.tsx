import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import {
  companies as defaultCompanies,
  comparisonData as defaultComparisonData,
  radarData as defaultRadarData,
  keyMetrics as defaultKeyMetrics,
  swotData as defaultSwotData,
  recommendations as defaultRecommendations,
  winRateData as defaultWinRateData,
  type CompanyInfo,
  type ComparisonCategory,
  type ComparisonItem,
} from "@/lib/data";
import { deriveRecommendations, deriveCompetitiveInsight, deriveStrategyCopy } from "@/lib/deriveAnalysis";

// Deep clone helper
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Derive winRateData from comparisonData
function deriveWinRate(data: ComparisonCategory[]) {
  let leadongWins = 0;
  let globalsoWins = 0;
  let ties = 0;
  data.forEach((cat) => {
    cat.items.forEach((item) => {
      if (item.winner === "leadong") leadongWins++;
      else if (item.winner === "globalso") globalsoWins++;
      else ties++;
    });
  });
  return { leadongWins, globalsoWins, ties, total: leadongWins + globalsoWins + ties };
}

export interface UserNote {
  sectionId: string;
  itemId: string;
  text: string;
  timestamp: number;
}

// ---- 多竞品对比矩阵数据结构 ----
export interface CompetitorProduct {
  id: string;
  name: string;
  color: string;
  price: number;
  positioning: string;
}

export interface MatrixDimension {
  id: string;
  name: string;
  scores: Record<string, number>; // competitorId -> score
  notes: Record<string, string>;  // competitorId -> note
}

export interface CompetitorMatrix {
  competitors: CompetitorProduct[];
  dimensions: MatrixDimension[];
}

const defaultMatrixColors = ["#D4782A", "#2980B9", "#27AE60", "#8E44AD", "#E74C3C"];

const defaultMatrix: CompetitorMatrix = {
  competitors: [
    { id: "leadong", name: "领动臻选版", color: "#D4782A", price: 228000, positioning: "专案赋能·快速突围" },
    { id: "globalso", name: "全球搜SEO Plus", color: "#2980B9", price: 198000, positioning: "定制营销型网站+SEO" },
    { id: "comp3", name: "竞品C（待填写）", color: "#27AE60", price: 0, positioning: "点击编辑填写信息" },
  ],
  dimensions: [
    { id: "d1", name: "价格性价比", scores: { leadong: 65, globalso: 80, comp3: 70 }, notes: { leadong: "", globalso: "", comp3: "" } },
    { id: "d2", name: "SEO能力", scores: { leadong: 70, globalso: 90, comp3: 75 }, notes: { leadong: "", globalso: "", comp3: "" } },
    { id: "d3", name: "内容营销", scores: { leadong: 60, globalso: 90, comp3: 65 }, notes: { leadong: "", globalso: "", comp3: "" } },
    { id: "d4", name: "AI数智化", scores: { leadong: 45, globalso: 95, comp3: 60 }, notes: { leadong: "", globalso: "", comp3: "" } },
    { id: "d5", name: "服务质量", scores: { leadong: 90, globalso: 60, comp3: 70 }, notes: { leadong: "", globalso: "", comp3: "" } },
    { id: "d6", name: "客户管理", scores: { leadong: 30, globalso: 90, comp3: 55 }, notes: { leadong: "", globalso: "", comp3: "" } },
  ],
};

// ---- 历史版本追踪数据结构 ----
export interface HistorySnapshot {
  id: string;
  timestamp: number;
  label: string;
  description: string;
  data: {
    companies: Record<string, CompanyInfo>;
    keyMetrics: typeof defaultKeyMetrics;
    radarData: typeof defaultRadarData;
    winRateData: typeof defaultWinRateData;
    comparisonSummary: {
      leadongWins: number;
      globalsoWins: number;
      total: number;
    };
  };
}

interface DataState {
  companies: Record<string, CompanyInfo>;
  comparisonData: ComparisonCategory[];
  radarData: { dimensions: string[]; leadong: number[]; globalso: number[] };
  keyMetrics: typeof defaultKeyMetrics;
  swotData: typeof defaultSwotData;
  recommendations: typeof defaultRecommendations;
  winRateData: typeof defaultWinRateData;
  userNotes: UserNote[];
  // 多竞品对比矩阵
  competitorMatrix: CompetitorMatrix;
  // 历史版本
  historySnapshots: HistorySnapshot[];
}

interface DataContextType extends DataState {
  // Company edits
  updateCompany: (key: string, updates: Partial<CompanyInfo>) => void;
  // Comparison edits
  updateComparisonItem: (catIdx: number, itemIdx: number, updates: Partial<ComparisonItem>) => void;
  addComparisonItem: (catIdx: number, item: ComparisonItem) => void;
  removeComparisonItem: (catIdx: number, itemIdx: number) => void;
  // Radar edits
  updateRadarScore: (company: "leadong" | "globalso", dimIdx: number, score: number) => void;
  // Key metrics edits
  updateKeyMetric: (idx: number, field: "leadong" | "globalso", value: number) => void;
  // SWOT edits
  updateSwotItem: (company: "leadong" | "globalso", quadrant: string, idx: number, text: string) => void;
  addSwotItem: (company: "leadong" | "globalso", quadrant: string, text: string) => void;
  removeSwotItem: (company: "leadong" | "globalso", quadrant: string, idx: number) => void;
  // User notes
  addNote: (sectionId: string, itemId: string, text: string) => void;
  removeNote: (idx: number) => void;
  // Reset
  resetAll: () => void;
  hasChanges: boolean;
  // Edit panel
  isEditPanelOpen: boolean;
  setEditPanelOpen: (open: boolean) => void;
  editSection: string;
  setEditSection: (section: string) => void;

  // ---- 多竞品对比矩阵 ----
  updateMatrixCompetitor: (id: string, updates: Partial<CompetitorProduct>) => void;
  addMatrixCompetitor: (competitor: CompetitorProduct) => void;
  removeMatrixCompetitor: (id: string) => void;
  updateMatrixScore: (dimId: string, competitorId: string, score: number) => void;
  updateMatrixNote: (dimId: string, competitorId: string, note: string) => void;
  addMatrixDimension: (dimension: MatrixDimension) => void;
  removeMatrixDimension: (dimId: string) => void;
  updateMatrixDimensionName: (dimId: string, name: string) => void;

  // ---- 历史版本追踪 ----
  saveSnapshot: (label: string, description?: string) => void;
  deleteSnapshot: (id: string) => void;
  restoreSnapshot: (id: string) => void;

  // ---- 动态智能分析 ----
  derivedRecommendations: ReturnType<typeof deriveRecommendations>;
  derivedInsight: ReturnType<typeof deriveCompetitiveInsight>;
  derivedStrategyCopy: ReturnType<typeof deriveStrategyCopy>;

  // ---- 数据变更提示 ----
  pendingRecompute: boolean;  // 价格/指标变更后提示用户重算
  clearPendingRecompute: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY = "ca-report-data-v2";

function getDefaultState(): DataState {
  return {
    companies: deepClone(defaultCompanies),
    comparisonData: deepClone(defaultComparisonData),
    radarData: deepClone(defaultRadarData),
    keyMetrics: deepClone(defaultKeyMetrics),
    swotData: deepClone(defaultSwotData),
    recommendations: deepClone(defaultRecommendations),
    winRateData: deepClone(defaultWinRateData),
    userNotes: [],
    competitorMatrix: deepClone(defaultMatrix),
    historySnapshots: [],
  };
}

function loadState(): DataState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const defaults = getDefaultState();
      return {
        ...defaults,
        ...parsed,
        competitorMatrix: parsed.competitorMatrix ?? deepClone(defaultMatrix),
        historySnapshots: parsed.historySnapshots ?? [],
      };
    }
    // Try migrating from old key
    const oldSaved = localStorage.getItem("ca-report-data-v1");
    if (oldSaved) {
      const parsed = JSON.parse(oldSaved);
      const defaults = getDefaultState();
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load saved data:", e);
  }
  return getDefaultState();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(loadState);
  const [isEditPanelOpen, setEditPanelOpen] = useState(false);
  const [editSection, setEditSection] = useState("overview");
  const [pendingRecompute, setPendingRecompute] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save data:", e);
    }
  }, [state]);

  const hasChanges = JSON.stringify(state) !== JSON.stringify(getDefaultState());

  // ---- 动态智能分析（useMemo，随数据变化自动重算）----
  const derivedRecommendations = useMemo(() => {
    return deriveRecommendations({
      companies: state.companies,
      comparisonData: state.comparisonData,
      radarData: state.radarData,
      keyMetrics: state.keyMetrics,
      winRateData: state.winRateData,
    });
  }, [state.companies, state.comparisonData, state.radarData, state.keyMetrics, state.winRateData]);

  const derivedInsight = useMemo(() => {
    return deriveCompetitiveInsight({
      companies: state.companies,
      comparisonData: state.comparisonData,
      radarData: state.radarData,
      keyMetrics: state.keyMetrics,
      winRateData: state.winRateData,
    });
  }, [state.companies, state.comparisonData, state.radarData, state.keyMetrics, state.winRateData]);

  const derivedStrategyCopy = useMemo(() => {
    return deriveStrategyCopy({
      companies: state.companies,
      comparisonData: state.comparisonData,
      radarData: state.radarData,
      keyMetrics: state.keyMetrics,
      winRateData: state.winRateData,
    });
  }, [state.companies, state.comparisonData, state.radarData, state.keyMetrics, state.winRateData]);

  // ---- Company ----
  const updateCompany = useCallback((key: string, updates: Partial<CompanyInfo>) => {
    setState((prev) => ({
      ...prev,
      companies: {
        ...prev.companies,
        [key]: { ...prev.companies[key], ...updates },
      },
    }));
  }, []);

  // ---- Comparison ----
  const updateComparisonItem = useCallback((catIdx: number, itemIdx: number, updates: Partial<ComparisonItem>) => {
    setState((prev) => {
      const newData = deepClone(prev.comparisonData);
      newData[catIdx].items[itemIdx] = { ...newData[catIdx].items[itemIdx], ...updates };
      return { ...prev, comparisonData: newData, winRateData: deriveWinRate(newData) };
    });
  }, []);

  const addComparisonItem = useCallback((catIdx: number, item: ComparisonItem) => {
    setState((prev) => {
      const newData = deepClone(prev.comparisonData);
      newData[catIdx].items.push(item);
      return { ...prev, comparisonData: newData, winRateData: deriveWinRate(newData) };
    });
  }, []);

  const removeComparisonItem = useCallback((catIdx: number, itemIdx: number) => {
    setState((prev) => {
      const newData = deepClone(prev.comparisonData);
      newData[catIdx].items.splice(itemIdx, 1);
      return { ...prev, comparisonData: newData, winRateData: deriveWinRate(newData) };
    });
  }, []);

  // ---- Radar ----
  const updateRadarScore = useCallback((company: "leadong" | "globalso", dimIdx: number, score: number) => {
    setState((prev) => {
      const newRadar = deepClone(prev.radarData);
      newRadar[company][dimIdx] = score;
      return { ...prev, radarData: newRadar };
    });
  }, []);

  // ---- Key Metrics ----
  const updateKeyMetric = useCallback((idx: number, field: "leadong" | "globalso", value: number) => {
    setState((prev) => {
      const newMetrics = deepClone(prev.keyMetrics);
      newMetrics[idx][field] = value;
      return { ...prev, keyMetrics: newMetrics };
    });
  }, []);

  // ---- SWOT ----
  const updateSwotItem = useCallback((company: "leadong" | "globalso", quadrant: string, idx: number, text: string) => {
    setState((prev) => {
      const newSwot = deepClone(prev.swotData);
      (newSwot[company] as any)[quadrant][idx] = text;
      return { ...prev, swotData: newSwot };
    });
  }, []);

  const addSwotItem = useCallback((company: "leadong" | "globalso", quadrant: string, text: string) => {
    setState((prev) => {
      const newSwot = deepClone(prev.swotData);
      (newSwot[company] as any)[quadrant].push(text);
      return { ...prev, swotData: newSwot };
    });
  }, []);

  const removeSwotItem = useCallback((company: "leadong" | "globalso", quadrant: string, idx: number) => {
    setState((prev) => {
      const newSwot = deepClone(prev.swotData);
      (newSwot[company] as any)[quadrant].splice(idx, 1);
      return { ...prev, swotData: newSwot };
    });
  }, []);

  // ---- Notes ----
  const addNote = useCallback((sectionId: string, itemId: string, text: string) => {
    setState((prev) => ({
      ...prev,
      userNotes: [...prev.userNotes, { sectionId, itemId, text, timestamp: Date.now() }],
    }));
  }, []);

  const removeNote = useCallback((idx: number) => {
    setState((prev) => ({
      ...prev,
      userNotes: prev.userNotes.filter((_, i) => i !== idx),
    }));
  }, []);

  // ---- Reset ----
  const resetAll = useCallback(() => {
    setState(getDefaultState());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("ca-report-data-v1");
  }, []);

  // ---- 多竞品对比矩阵 ----
  const updateMatrixCompetitor = useCallback((id: string, updates: Partial<CompetitorProduct>) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      const idx = newMatrix.competitors.findIndex((c) => c.id === id);
      if (idx >= 0) {
        newMatrix.competitors[idx] = { ...newMatrix.competitors[idx], ...updates };
      }
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const addMatrixCompetitor = useCallback((competitor: CompetitorProduct) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      if (newMatrix.competitors.length >= 5) return prev; // 最多5个
      newMatrix.competitors.push(competitor);
      // 为所有维度添加新竞品的默认分数
      newMatrix.dimensions.forEach((dim) => {
        dim.scores[competitor.id] = 50;
        dim.notes[competitor.id] = "";
      });
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const removeMatrixCompetitor = useCallback((id: string) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      if (newMatrix.competitors.length <= 2) return prev; // 至少保留2个
      newMatrix.competitors = newMatrix.competitors.filter((c) => c.id !== id);
      newMatrix.dimensions.forEach((dim) => {
        delete dim.scores[id];
        delete dim.notes[id];
      });
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const updateMatrixScore = useCallback((dimId: string, competitorId: string, score: number) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      const dim = newMatrix.dimensions.find((d) => d.id === dimId);
      if (dim) dim.scores[competitorId] = score;
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const updateMatrixNote = useCallback((dimId: string, competitorId: string, note: string) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      const dim = newMatrix.dimensions.find((d) => d.id === dimId);
      if (dim) dim.notes[competitorId] = note;
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const addMatrixDimension = useCallback((dimension: MatrixDimension) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      newMatrix.dimensions.push(dimension);
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const removeMatrixDimension = useCallback((dimId: string) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      newMatrix.dimensions = newMatrix.dimensions.filter((d) => d.id !== dimId);
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  const updateMatrixDimensionName = useCallback((dimId: string, name: string) => {
    setState((prev) => {
      const newMatrix = deepClone(prev.competitorMatrix);
      const dim = newMatrix.dimensions.find((d) => d.id === dimId);
      if (dim) dim.name = name;
      return { ...prev, competitorMatrix: newMatrix };
    });
  }, []);

  // ---- 历史版本追踪 ----
  const saveSnapshot = useCallback((label: string, description = "") => {
    setState((prev) => {
      const snapshot: HistorySnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: Date.now(),
        label,
        description,
        data: {
          companies: deepClone(prev.companies),
          keyMetrics: deepClone(prev.keyMetrics),
          radarData: deepClone(prev.radarData),
          winRateData: deepClone(prev.winRateData),
          comparisonSummary: {
            leadongWins: prev.winRateData.leadongWins,
            globalsoWins: prev.winRateData.globalsoWins,
            total: prev.winRateData.total,
          },
        },
      };
      // 最多保留20个快照
      const newSnapshots = [snapshot, ...prev.historySnapshots].slice(0, 20);
      return { ...prev, historySnapshots: newSnapshots };
    });
  }, []);

  const deleteSnapshot = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      historySnapshots: prev.historySnapshots.filter((s) => s.id !== id),
    }));
  }, []);

  const restoreSnapshot = useCallback((id: string) => {
    setState((prev) => {
      const snapshot = prev.historySnapshots.find((s) => s.id === id);
      if (!snapshot) return prev;
      return {
        ...prev,
        companies: deepClone(snapshot.data.companies),
        keyMetrics: deepClone(snapshot.data.keyMetrics),
        radarData: deepClone(snapshot.data.radarData),
        winRateData: deepClone(snapshot.data.winRateData),
      };
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...state,
        updateCompany,
        updateComparisonItem,
        addComparisonItem,
        removeComparisonItem,
        updateRadarScore,
        updateKeyMetric,
        updateSwotItem,
        addSwotItem,
        removeSwotItem,
        addNote,
        removeNote,
        resetAll,
        hasChanges,
        isEditPanelOpen,
        setEditPanelOpen,
        editSection,
        setEditSection,
        // 多竞品对比矩阵
        updateMatrixCompetitor,
        addMatrixCompetitor,
        removeMatrixCompetitor,
        updateMatrixScore,
        updateMatrixNote,
        addMatrixDimension,
        removeMatrixDimension,
        updateMatrixDimensionName,
        // 历史版本追踪
        saveSnapshot,
        deleteSnapshot,
        restoreSnapshot,
        // 动态智能分析
        derivedRecommendations,
        derivedInsight,
        derivedStrategyCopy,
        // 数据变更提示
        pendingRecompute,
        clearPendingRecompute: () => setPendingRecompute(false),
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
