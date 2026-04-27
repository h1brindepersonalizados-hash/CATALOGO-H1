import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AppSettings } from '../types';

interface WhatsAppButtonProps {
  phone: string;
  settings?: AppSettings;
}

export default function WhatsAppButton({ phone, settings }: WhatsAppButtonProps) {
  return (
    <motion.button
      id="whatsapp-button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-8 right-8 z-50 text-white p-4 rounded-full shadow-2xl hover:shadow-2xl flex items-center justify-center transition-shadow"
      style={{ 
        backgroundColor: settings?.themeColor || '#25D366',
        boxShadow: `0 10px 25px ${settings?.themeColor || '#25D366'}50`
      }}
      onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
    >
      <MessageCircle size={28} />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-white/20"></span>
      </span>
    </motion.button>
  );
}
