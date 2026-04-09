import React, { createContext, useContext, useState, useEffect } from "react";

export interface AIProvider {
  id: string;
  name: string;
  baseURL: string;
  models: { id: string; name: string; description: string }[];
  placeholder: string;
  docsUrl: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "aliyun",
    name: "阿里云百炼",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: [
      { id: "qwen3-max", name: "Qwen3-Max", description: "旗舰版，能力最强，适合复杂分析" },
      { id: "qwen-plus", name: "Qwen3.6-Plus", description: "均衡版，速度快、成本低" },
      { id: "qwen3-max-2026-01-23", name: "Qwen3-Max（快照版）", description: "固定版本，稳定可预期" },
      { id: "qwen-turbo", name: "Qwen-Turbo", description: "轻量快速，适合简单任务" },
    ],
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://bailian.console.aliyun.com/",
  },
  {
    id: "openai",
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "旗舰多模态模型，能力最强" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "轻量版，速度快、成本低" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "高性能，支持长上下文" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "经济实惠，适合简单任务" },
    ],
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com/v1",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", description: "旗舰对话模型，性价比极高" },
      { id: "deepseek-reasoner", name: "DeepSeek R1", description: "深度推理模型，适合复杂分析" },
    ],
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "custom",
    name: "自定义",
    baseURL: "",
    models: [
      { id: "custom", name: "自定义模型", description: "填写任意兼容 OpenAI 接口的模型名称" },
    ],
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "",
  },
];

export interface AIConfig {
  providerId: string;
  apiKey: string;
  model: string;
  customBaseURL: string;
  customModel: string;
  enabled: boolean; // 是否使用自定义配置（false则使用服务端默认）
}

const DEFAULT_CONFIG: AIConfig = {
  providerId: "aliyun",
  apiKey: "",
  model: "qwen3-max",
  customBaseURL: "",
  customModel: "",
  enabled: false,
};

interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
  resetConfig: () => void;
  getRequestParams: () => { apiKey?: string; model?: string; baseURL?: string } | null;
  isConfigured: boolean;
}

const AIConfigContext = createContext<AIConfigContextType | null>(null);

const STORAGE_KEY = "competitive_analysis_ai_config";

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // 返回请求时需要附带的参数，如果未启用自定义配置则返回null（使用服务端默认）
  const getRequestParams = () => {
    if (!config.enabled || !config.apiKey.trim()) return null;

    const provider = AI_PROVIDERS.find((p) => p.id === config.providerId);
    const baseURL =
      config.providerId === "custom"
        ? config.customBaseURL
        : provider?.baseURL || "";
    const model =
      config.providerId === "custom"
        ? config.customModel
        : config.model;

    return {
      apiKey: config.apiKey.trim(),
      model: model || "qwen3-max",
      baseURL: baseURL || undefined,
    };
  };

  const isConfigured = config.enabled && !!config.apiKey.trim();

  return (
    <AIConfigContext.Provider
      value={{ config, updateConfig, resetConfig, getRequestParams, isConfigured }}
    >
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig() {
  const ctx = useContext(AIConfigContext);
  if (!ctx) throw new Error("useAIConfig must be used within AIConfigProvider");
  return ctx;
}
