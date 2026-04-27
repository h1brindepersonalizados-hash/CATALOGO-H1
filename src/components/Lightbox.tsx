import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LightboxProps {
  image: string | null;
  onClose: () => void;
}

export default function Lightbox({ image, onClose }: LightboxProps) {
  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-[#3D3A33]/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        onClick={onClose}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>
        
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          src={image}
          className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
}
