import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
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

interface DataState {
  companies: Record<string, CompanyInfo>;
  comparisonData: ComparisonCategory[];
  radarData: { dimensions: string[]; leadong: number[]; globalso: number[] };
  keyMetrics: typeof defaultKeyMetrics;
  swotData: typeof defaultSwotData;
  recommendations: typeof defaultRecommendations;
  winRateData: typeof defaultWinRateData;
  userNotes: UserNote[];
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
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY = "ca-report-data-v1";

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
  };
}

function loadState(): DataState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle schema changes
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

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save data:", e);
    }
  }, [state]);

  const hasChanges = JSON.stringify(state) !== JSON.stringify(getDefaultState());

  const updateCompany = useCallback((key: string, updates: Partial<CompanyInfo>) => {
    setState((prev) => ({
      ...prev,
      companies: {
        ...prev.companies,
        [key]: { ...prev.companies[key], ...updates },
      },
    }));
  }, []);

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

  const updateRadarScore = useCallback((company: "leadong" | "globalso", dimIdx: number, score: number) => {
    setState((prev) => {
      const newRadar = deepClone(prev.radarData);
      newRadar[company][dimIdx] = score;
      return { ...prev, radarData: newRadar };
    });
  }, []);

  const updateKeyMetric = useCallback((idx: number, field: "leadong" | "globalso", value: number) => {
    setState((prev) => {
      const newMetrics = deepClone(prev.keyMetrics);
      newMetrics[idx][field] = value;
      return { ...prev, keyMetrics: newMetrics };
    });
  }, []);

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

  const resetAll = useCallback(() => {
    setState(getDefaultState());
    localStorage.removeItem(STORAGE_KEY);
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
