import React from 'react';
import { Product, AppSettings } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onImageClick: (image: string) => void;
  settings: AppSettings;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onImageClick, settings }) => {
  return (
    <motion.div 
      id={`product-${product.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[12px] p-3 border border-[#E5E1D1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col group h-full hover:border-[color:var(--hover-color)] transition-colors"
      style={{ '--hover-color': settings.themeColor } as any}
    >
      <div 
        className="relative h-[140px] bg-[#FDFBF7] rounded-[8px] overflow-hidden mb-3 group"
      >
        <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          <img 
            src={product.image} 
            alt={product.name} 
            onClick={() => onImageClick(product.image)}
            className="w-full h-full shrink-0 snap-center object-cover cursor-zoom-in"
            referrerPolicy="no-referrer"
          />
          {product.image2 && (
            <img 
              src={product.image2} 
              alt={`${product.name} 2`} 
              onClick={() => onImageClick(product.image2!)}
              className="w-full h-full shrink-0 snap-center object-cover cursor-zoom-in"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        
        {product.image2 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            <div className="w-4 h-1 rounded-full bg-white/80 shadow-sm" />
            <div className="w-4 h-1 rounded-full bg-white/40 shadow-sm" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      <div className="flex-1">
        <h3 className="text-[14px] font-bold text-[#3D3A33] leading-tight mb-0.5">{product.name}</h3>
        <p className="text-[10px] text-[#9C988F] mb-2.5">CÓD: {product.code}</p>

        <table className="w-full border-collapse font-sans text-[11px]">
          <thead>
            <tr>
              <th className="text-left text-[#9C988F] font-medium pb-1.5 uppercase tracking-wider">Qtd.</th>
              <th className="text-right text-[#9C988F] font-medium pb-1.5 uppercase tracking-wider">Unit.</th>
            </tr>
          </thead>
          <tbody>
            {product.tiers.map((tier, idx) => (
              <tr key={idx} className="border-t border-[#F3F0E6]">
                <td 
                  className={`py-1.5 ${idx === product.tiers.length - 1 ? 'font-semibold' : 'text-[#4B4840]'}`}
                  style={idx === product.tiers.length - 1 ? { color: settings.themeColor } : {}}
                >
                  {tier.range} un.
                </td>
                <td 
                  className={`py-1.5 text-right ${idx === product.tiers.length - 1 ? 'font-semibold' : 'text-[#4B4840]'}`}
                  style={idx === product.tiers.length - 1 ? { color: settings.themeColor } : {}}
                >
                  R$ {tier.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={() => onAddToCart(product)}
        className="w-full mt-4 rounded-lg py-2.5 text-[11px] font-bold transition-all relative overflow-hidden group/btn hover:text-white"
        style={{ color: settings.themeColor }}
      >
        <span className="relative z-10 transition-colors">Adicionar à Sacola</span>
         <div className="absolute inset-0 border border-current rounded-lg" style={{ borderColor: settings.themeColor }} />
        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity -z-0" style={{ backgroundColor: settings.themeColor }} />
      </button>
    </motion.div>
  );
};

export default ProductCard;
