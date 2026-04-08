import { useData } from "@/contexts/DataContext";
import { Pencil } from "lucide-react";

interface EditButtonProps {
  section: string;
  label?: string;
  className?: string;
}

export default function EditButton({ section, label = "编辑", className = "" }: EditButtonProps) {
  const { setEditPanelOpen, setEditSection } = useData();

  return (
    <button
      onClick={() => {
        setEditSection(section);
        setEditPanelOpen(true);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 backdrop-blur-sm border border-[#E8DFD0] text-[#8B7355] hover:bg-[#FAF7F2] hover:text-[#D4782A] hover:border-[#D4782A]/30 transition-all shadow-sm ${className}`}
    >
      <Pencil size={12} /> {label}
    </button>
  );
}
