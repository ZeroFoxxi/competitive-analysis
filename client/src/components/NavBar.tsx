import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Pencil } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const navItems = [
  { label: "概览", href: "#overview" },
  { label: "雷达图", href: "#radar" },
  { label: "详细对比", href: "#comparison" },
  { label: "SWOT", href: "#swot" },
  { label: "策略建议", href: "#recommendations" },
  { label: "对比矩阵", href: "#matrix" },
  { label: "历史追踪", href: "#history" },
  { label: "分析工具", href: "#tool" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setEditPanelOpen, setEditSection, hasChanges } = useData();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#FFFDF8]/90 backdrop-blur-md shadow-sm border-b border-[#E8DFD0]/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("#hero")} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4782A] to-[#2980B9] flex items-center justify-center">
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span className={`text-sm font-semibold transition-colors ${scrolled ? "text-[#1A1A2E]" : "text-[#4A4A4A]"}`}>
              竞品分析
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  scrolled
                    ? "text-[#6B6B6B] hover:text-[#1A1A2E] hover:bg-[#F0EBE3]"
                    : "text-[#6B6B6B] hover:text-[#1A1A2E] hover:bg-white/50"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { setEditSection("overview"); setEditPanelOpen(true); }}
              className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                hasChanges
                  ? "bg-[#D4782A] text-white hover:bg-[#B8621F]"
                  : scrolled
                  ? "text-[#D4782A] hover:bg-[#FFF8F0] border border-[#D4782A]/30"
                  : "text-[#D4782A] hover:bg-[#FFF8F0]/50 border border-[#D4782A]/20"
              }`}
            >
              <Pencil size={14} /> 编辑数据
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F0EBE3] text-[#4A4A4A]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#E8DFD0] shadow-lg lg:hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-[#4A4A4A] hover:bg-[#F0EBE3] hover:text-[#1A1A2E] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileOpen(false); setEditSection("overview"); setEditPanelOpen(true); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-[#D4782A] hover:bg-[#FFF8F0] transition-colors flex items-center gap-2"
              >
                <Pencil size={14} /> 编辑数据
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
