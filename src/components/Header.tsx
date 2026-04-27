import { Search, ShoppingCart, User, Bell, Menu } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  onMenuClick?: () => void;
  onCartClick?: () => void;
  cartCount: number;
  onAdminClick?: () => void;
  settings: AppSettings;
}

export default function Header({ onMenuClick, onCartClick, cartCount, onAdminClick, settings }: HeaderProps) {
  return (
    <header id="header" className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-[#E5E1D1] px-4 md:px-8 h-[70px] flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#4B4840] transition-colors md:hidden hover:text-[color:var(--theme-color)]"
          style={{ '--theme-color': settings.themeColor } as any}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: settings.themeColor }} />
          <input 
            type="text" 
            placeholder="O que você está procurando?" 
            className="w-full max-w-[400px] border-none rounded-full py-2 pl-12 pr-6 text-sm outline-none focus:ring-1"
            style={{ 
              backgroundColor: `${settings.themeColor}15`, 
              color: settings.themeColor,
              '--tw-ring-color': settings.themeColor
            } as any}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onCartClick}
          className="relative text-[#4B4840] transition-colors p-2 hover:text-[color:var(--theme-color)]"
          style={{ '--theme-color': settings.themeColor } as any}
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white" style={{ backgroundColor: settings.themeColor }}>
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={onAdminClick}
          className="text-[#4B4840] transition-colors p-2 hover:text-[color:var(--theme-color)]"
          style={{ '--theme-color': settings.themeColor } as any}
          title="Administração"
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
