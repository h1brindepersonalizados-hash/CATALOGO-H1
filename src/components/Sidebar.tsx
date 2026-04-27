import { LayoutGrid, ShoppingBag, Gift, Briefcase, Package, ShoppingCart, Home, Tag, ShieldAlert, Settings } from 'lucide-react';
import { Category, AppSettings } from '../types';

interface SidebarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  isOpen?: boolean;
  onClose?: () => void;
  categories: Category[];
  logo?: string;
  settings: AppSettings;
  onAdminClick: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Tudo': Home,
  'Bolsas': ShoppingBag,
  'Brindes': Gift,
  'Frasqueiras': Briefcase,
  'Kits Corporativos': Package,
  'Mochilas': ShoppingCart,
  'Necessaires': LayoutGrid,
};

export default function Sidebar({ activeCategory, onCategoryChange, isOpen, onClose, categories, logo, settings, onAdminClick }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside 
        id="sidebar" 
        className={`fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-[#E5E7EB] flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="h-10">
            {logo ? (
              <img src={logo} alt="Logo" className="h-full object-contain" />
            ) : (
              <div className="text-[20px] font-bold text-[#C5A059] tracking-tighter">
                H1<span className="text-[#3D3A33]">BRINDES</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-[#C5A059]">
            <LayoutGrid className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] || Tag;
            const isActive = activeCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#F9F1DC] text-[#C5A059] font-semibold border-r-4 border-[#C5A059]' 
                    : 'text-[#4B4840] hover:bg-[#F9F1DC] hover:text-[#C5A059]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-[#9C988F] group-hover:text-[#C5A059]'}`} />
                <span className="text-[14px]">{category}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#F3F0E6]">
          <div className="bg-[#F9F1DC] rounded-2xl p-4 flex flex-col items-center text-center">
            <p className="text-xs font-semibold text-[#A6803F]">Precisa de ajuda?</p>
            <p className="text-[10px] text-[#C5A059] mt-1">Fale com nosso consultor via WhatsApp</p>
          </div>
        </div>
      </aside>
    </>
  );
}
