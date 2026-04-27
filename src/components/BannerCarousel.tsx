import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Banner } from '../types';

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div id="highlights-carousel" className="relative h-[250px] md:h-[350px] w-full overflow-hidden rounded-3xl mb-12 group transition-all">
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D3A33]/90 via-[#3D3A33]/40 to-transparent z-10" />
          <img 
            src={banners[current].image} 
            alt={banners[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-12">
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[#C5A059] font-bold text-[10px] uppercase tracking-[0.4em] mb-2"
            >
              Destaques H1 Brindes
            </motion.span>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white text-2xl md:text-3xl font-black mb-2 max-w-xl leading-tight"
            >
              {banners[current].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-xs md:text-sm max-w-md"
            >
              {banners[current].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-6 right-8 z-30 flex gap-2">
          {banners.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${current === idx ? 'w-6 bg-[#C5A059]' : 'w-2 bg-white/30 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
