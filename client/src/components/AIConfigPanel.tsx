import React, { useState } from "react";
import { Settings, Eye, EyeOff, CheckCircle, XCircle, Loader2, ExternalLink, ChevronDown } from "lucide-react";
import { useAIConfig, AI_PROVIDERS } from "../contexts/AIConfigContext";

export default function AIConfigPanel() {
  const { config, updateConfig, resetConfig, isConfigured } = useAIConfig();
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const currentProvider = AI_PROVIDERS.find((p) => p.id === config.providerId) || AI_PROVIDERS[0];
  const currentModel =
    config.providerId === "custom"
      ? { id: "custom", name: config.customModel || "自定义模型", description: "自定义" }
      : currentProvider.models.find((m) => m.id === config.model) || currentProvider.models[0];

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;
    updateConfig({
      providerId,
      model: provider.models[0]?.id || "",
      customBaseURL: "",
      customModel: "",
    });
    setTestResult(null);
  };

  const handleModelChange = (modelId: string) => {
    updateConfig({ model: modelId });
    setShowModelDropdown(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({ ok: false, msg: "请先输入 API Key" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const provider = AI_PROVIDERS.find((p) => p.id === config.providerId);
      const baseURL =
        config.providerId === "custom" ? config.customBaseURL : provider?.baseURL || "";
      const model =
        config.providerId === "custom" ? config.customModel : config.model;

      const res = await fetch("/api/test-ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: config.apiKey.trim(),
          baseURL,
          model: model || "qwen3-max",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({ ok: true, msg: `连接成功！模型回复：${data.reply}` });
      } else {
        setTestResult({ ok: false, msg: data.error || "连接失败，请检查 API Key 和模型名称" });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: "网络错误，请稍后重试" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 标题说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">关于 AI 配置</p>
            <p className="text-xs text-blue-600 mt-1">
              配置您自己的 API Key 后，所有 AI 功能（SWOT生成、战略建议、AI重算、文档解析）将使用您指定的服务商和模型。
              配置仅保存在本地浏览器，不会上传到服务器。
            </p>
          </div>
        </div>
      </div>

      {/* 启用开关 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-gray-800">使用自定义 AI 配置</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {config.enabled ? "已启用，将使用下方配置" : "未启用，使用系统默认配置（qwen3-max）"}
          </p>
        </div>
        <button
          onClick={() => updateConfig({ enabled: !config.enabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.enabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
              config.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* 配置区域 */}
      <div className={`space-y-4 ${!config.enabled ? "opacity-50 pointer-events-none" : ""}`}>
        {/* 服务商选择 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            AI 服务商
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AI_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                  config.providerId === provider.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
          {currentProvider.docsUrl && (
            <a
              href={currentProvider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              获取 {currentProvider.name} API Key
            </a>
          )}
        </div>

        {/* 自定义 Base URL（仅自定义服务商显示） */}
        {config.providerId === "custom" && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Base URL
            </label>
            <input
              type="text"
              value={config.customBaseURL}
              onChange={(e) => updateConfig({ customBaseURL: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* 模型选择 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            模型
          </label>
          {config.providerId === "custom" ? (
            <input
              type="text"
              value={config.customModel}
              onChange={(e) => updateConfig({ customModel: e.target.value })}
              placeholder="输入模型名称，如 gpt-4o"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div>
                  <span className="font-medium text-gray-800">{currentModel?.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">{currentModel?.description}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
              </button>
              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {currentProvider.models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                        config.model === model.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{model.name}</span>
                        {config.model === model.id && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Key 输入 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={config.apiKey}
              onChange={(e) => {
                updateConfig({ apiKey: e.target.value });
                setTestResult(null);
              }}
              placeholder={currentProvider.placeholder}
              className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">API Key 仅保存在您的浏览器本地，不会发送到我们的服务器存储</p>
        </div>

        {/* 测试连接 */}
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={testing || !config.apiKey.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                测试中...
              </>
            ) : (
              "测试连接"
            )}
          </button>
          <button
            onClick={() => {
              resetConfig();
              setTestResult(null);
            }}
            className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              testResult.ok
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {testResult.ok ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{testResult.msg}</span>
          </div>
        )}
      </div>

      {/* 当前状态 */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          当前 AI：
          {isConfigured ? (
            <span className="text-green-600 font-medium">
              {" "}{currentProvider.name} / {currentModel?.name}
            </span>
          ) : (
            <span className="text-gray-600 font-medium"> 系统默认（qwen3-max）</span>
          )}
        </p>
      </div>
    </div>
  );
}
