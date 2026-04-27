import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askGemini } from '../services/aiService';
import { Product } from '../types';

interface AIChatProps {
  products: Product[];
}

export default function AIChat({ products }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Sou seu assistente H1. Como posso te ajudar com nossos brindes personalizados hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const productContext = products.map(p => `- ${p.name} (Ref: ${p.code}) - Categoria: ${p.category}`).join('\n');
    
    const botResponse = await askGemini(userMessage, productContext);
    
    setMessages(prev => [...prev, { role: 'bot', text: botResponse || 'Não consegui processar sua dúvida agora. Tente falar com um consultor.' }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-8 z-50 bg-[#3D3A33] text-white p-4 rounded-full shadow-2xl hover:bg-[#C5A059] transition-all flex items-center justify-center group"
        title="Dúvidas AI"
      >
        <Bot size={28} className="group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 md:right-28 z-[60] w-[calc(100vw-32px)] md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-[#F3F0E6] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-[#3D3A33] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Assistente H1</h3>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Responde na hora</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFBF7]"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#3D3A33] text-white rounded-tr-none' 
                      : 'bg-white border border-[#F3F0E6] text-[#3D3A33] rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#F3F0E6] p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#C5A059]" />
                    <span className="text-xs text-[#9C988F]">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#F3F0E6] flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tire sua dúvida..."
                className="flex-1 bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-[#C5A059] text-white p-2 rounded-xl hover:bg-[#A6803F] transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
