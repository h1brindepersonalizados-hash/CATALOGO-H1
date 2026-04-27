import React from 'react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onImageClick: (image: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onImageClick }) => {
  return (
    <motion.div 
      id={`product-${product.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[12px] p-3 border border-[#E5E1D1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col group h-full"
    >
      <div 
        className="relative h-[140px] bg-[#FDFBF7] rounded-[8px] overflow-hidden mb-3 cursor-zoom-in"
        onClick={() => onImageClick(product.image)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <td className={`py-1.5 ${idx === product.tiers.length - 1 ? 'text-[#C5A059] font-semibold' : 'text-[#4B4840]'}`}>
                  {tier.range} un.
                </td>
                <td className={`py-1.5 text-right ${idx === product.tiers.length - 1 ? 'text-[#C5A059] font-semibold' : 'text-[#4B4840]'}`}>
                  R$ {tier.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={() => onAddToCart(product)}
        className="w-full mt-4 bg-[#3D3A33] text-white rounded-lg py-2.5 text-[11px] font-bold hover:bg-[#C5A059] transition-colors"
      >
        ADICIONAR AO CARRINHO
      </button>
    </motion.div>
  );
};

export default ProductCard;
