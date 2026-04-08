export default function Footer() {
  return (
    <footer className="py-12 bg-[#1A1A2E] text-white/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4782A] to-[#2980B9] flex items-center justify-center">
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span className="text-sm">外贸营销服务竞品分析报告</span>
          </div>
          <p className="text-xs text-white/40">
            2026年4月 · 基于公开方案文档分析 · 仅供内部决策参考
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/30">
            本报告数据来源于领动臻选版和全球搜SEO Plus公开方案文档，分析结论仅代表基于现有信息的客观对比
          </p>
        </div>
      </div>
    </footer>
  );
}
