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
              <div className="text-[20px] font-bold tracking-tighter" style={{ color: settings.themeColor }}>
                H1<span className="text-[#3D3A33]">BRINDES</span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="md:hidden p-2 text-gray-400 transition-colors hover:opacity-80" 
            style={{ color: settings.themeColor }}
          >
            <LayoutGrid className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            
            // Determine which icon to use based on settings.menuIcon
            let IconComponent;
            if (settings.menuIcon === 'diamond') {
              IconComponent = () => <div className="w-2.5 h-2.5 rotate-45 border-2 shrink-0 border-current" />;
            } else if (settings.menuIcon === 'bag') {
               IconComponent = () => <Package className="w-4 h-4 shrink-0" />;
            } else if (settings.menuIcon === 'custom' && settings.customMenuIcon) {
              IconComponent = () => <img src={settings.customMenuIcon} className="w-4 h-4 shrink-0 object-contain" />;
            } else {
               const OriginalIcon = CATEGORY_ICONS[category] || Tag;
               IconComponent = () => <OriginalIcon className="w-4 h-4 shrink-0" />;
            }

            return (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group ${
                  isActive 
                    ? 'font-semibold border-r-4' 
                    : 'text-[#4B4840] hover:bg-[#F9F1DC]'
                }`}
                style={isActive ? { backgroundColor: `${settings.themeColor}15`, color: settings.themeColor, borderColor: settings.themeColor } : {}}
              >
                <div style={isActive ? { color: settings.themeColor } : {}} className={isActive ? '' : 'text-[#9C988F] group-hover:text-current'}>
                   <IconComponent />
                </div>
                <span className="text-[14px]">{category}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#F3F0E6]">
          <div className="rounded-2xl p-4 flex flex-col items-center text-center transition-colors" style={{ backgroundColor: `${settings.themeColor}15` }}>
            <p className="text-xs font-semibold" style={{ color: settings.themeColor }}>Precisa de ajuda?</p>
            <p className="text-[10px] mt-1" style={{ color: settings.themeColor, opacity: 0.8 }}>Fale com nosso consultor via WhatsApp</p>
          </div>
        </div>
      </aside>
    </>
  );
}
