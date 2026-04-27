import { X, Minus, Plus, Send, Calendar, MessageSquare, ListTodo, ShoppingBag } from 'lucide-react';
import { CartItem, AppSettings } from '../types';
import { useState } from 'react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateTheme: (id: string, theme: string) => void;
  onRemove: (id: string) => void;
  phone: string;
  settings: AppSettings;
}

export default function CartModal({ isOpen, onClose, items, onUpdateQuantity, onUpdateTheme, onRemove, phone, settings }: CartModalProps) {
  const [eventDate, setEventDate] = useState('');
  const [clientName, setClientName] = useState('');

  const parsePrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(',', '.'));
  };

  const getUnitPrice = (item: CartItem) => {
    const { quantity, product } = item;
    let unitPrice = 0;

    // The logic: find the tier where the quantity fits
    // Examples ranges: "10-29", "50+", "10 a 29"
    for (const tier of product.tiers) {
      const range = tier.range.toLowerCase();
      
      if (range.includes('+')) {
        const min = parseInt(range.replace('+', ''));
        if (quantity >= min) unitPrice = parsePrice(tier.price);
      } else {
        // Matches "10-29" or "10 a 29"
        const parts = range.split(/[-a]/).map(p => parseInt(p.trim()));
        if (parts.length === 2) {
          if (quantity >= parts[0] && quantity <= parts[1]) {
            unitPrice = parsePrice(tier.price);
          }
        }
      }
    }

    // Default to the first tier if no match (e.g. quantity < 10)
    if (unitPrice === 0 && product.tiers.length > 0) {
      unitPrice = parsePrice(product.tiers[0].price);
    }

    return unitPrice;
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      return acc + (getUnitPrice(item) * item.quantity);
    }, 0);
  };

  if (!isOpen) return null;

  const handleWhatsApp = () => {
    if (!clientName.trim()) {
      alert('Por favor, informe seu nome antes de solicitar o orçamento.');
      const input = document.getElementById('client-name-input');
      input?.focus();
      return;
    }

    let message = `Olá! Gostaria de solicitar um orçamento:\n\n`;
    message += `*Cliente:* ${clientName}\n`;
    message += `*Data do Evento:* ${eventDate || 'Não informada'}\n\n`;
    message += `*Itens:*\n`;

    items.forEach(item => {
      const unit = getUnitPrice(item);
      const total = unit * item.quantity;
      message += `- ${item.product.name} (Qtd: ${item.quantity}) - Unit: R$ ${unit.toFixed(2).replace('.', ',')} - Total: R$ ${total.toFixed(2).replace('.', ',')} - Tema: ${item.theme || 'Não informado'}\n`;
    });

    message += `\n*TOTAL ESTIMADO: R$ ${calculateTotal().toFixed(2).replace('.', ',')}*\n`;
    message += `\n*Entendo que o prazo de confecção é de 15 dias úteis.*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#3D3A33]/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#F3F0E6] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: settings.themeColor }}>
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3D3A33]">Meu Carrinho</h2>
              <p className="text-xs text-[#9C988F] uppercase tracking-widest leading-none mt-1">Solicitação de Orçamento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F9F1DC] rounded-full transition-colors">
            <X className="w-6 h-6 text-[#9C988F]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-[#F9F1DC] rounded-full flex items-center justify-center mb-4">
                <Plus className="w-10 h-10 text-[gold-primary]" />
              </div>
              <p className="text-[#3D3A33] font-bold">Seu carrinho está vazio</p>
              <p className="text-[#9C988F] text-sm mt-1">Adicione produtos para solicitar um orçamento.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#FFF9EB] border border-[#F9F1DC] rounded-xl p-4 flex gap-3 items-start">
                <Calendar className="w-4 h-4 text-[gold-primary] mt-0.5" />
                <p className="text-[11px] text-[#A6803F] leading-relaxed">
                  <strong>Aviso Importante:</strong> O prazo médio de confecção é de <strong>15 dias úteis</strong> após a aprovação da arte. Para urgências, consulte disponibilidade.
                </p>
              </div>
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#F3F0E6] group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-[#F3F0E6] shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#3D3A33] leading-tight truncate">{item.product.name}</h4>
                      <button onClick={() => onRemove(item.product.id)} className="text-[#9C988F] hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Quantity and Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#9C988F] tracking-widest flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Qtd & Preço
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 bg-white border border-[#F3F0E6] rounded-lg p-1 w-fit">
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-[#F9F1DC] rounded transition-colors text-[gold-primary]"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-[#3D3A33] w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#F9F1DC] rounded transition-colors text-[gold-primary]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#9C988F] leading-none">Unid: R$ {getUnitPrice(item).toFixed(2).replace('.', ',')}</span>
                            <span className="text-xs font-bold" style={{ color: settings.themeColor }}>R$ {(getUnitPrice(item) * item.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Theme Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#9C988F] tracking-widest flex items-center gap-1">
                          <ListTodo className="w-3 h-3" /> Tema do Evento
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ex: Mickey, Batizado, 15 Anos..." 
                          className="w-full bg-white border border-[#F3F0E6] rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none"
                          style={{ '--tw-ring-color': settings.themeColor } as any}
                          value={item.theme}
                          onChange={(e) => onUpdateTheme(item.product.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget Header Info */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F9F1DC]/30 p-6 rounded-3xl border border-[#F3F0E6]">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[#9C988F] tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Data Estimada do Evento
                </label>
                <input 
                  type="date" 
                  className="w-full p-2.5 rounded-xl border border-[#F3F0E6] text-sm outline-none focus:ring-1"
                  style={{ '--tw-ring-color': settings.themeColor } as any}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[#9C988F] tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Seu Nome / Empresa <span className="text-red-500">*</span>
                </label>
                <input 
                  id="client-name-input"
                  type="text" 
                  placeholder="Como devemos lhe chamar?"
                  className="w-full p-2.5 rounded-xl border border-[#F3F0E6] text-sm outline-none focus:ring-1"
                  style={{ '--tw-ring-color': settings.themeColor } as any}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[#F3F0E6] bg-[#FDFBF7]">
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Total Estimado</span>
              <span className="text-2xl font-black text-[#3D3A33]">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
            </div>
            <button 
              onClick={handleWhatsApp}
              className="w-full text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 transition-opacity opacity-100 group-hover/btn:opacity-0 bg-[#3D3A33]" />
              <div className="absolute inset-0 transition-opacity opacity-0 group-hover/btn:opacity-100" style={{ backgroundColor: settings.themeColor }} />
              <div className="relative flex items-center gap-3">
                <Send className="w-5 h-5" />
                SOLICITAR ORÇAMENTO VIA WHATSAPP
              </div>
            </button>
            <p className="text-center text-[10px] text-[#9C988F] mt-4 uppercase tracking-[0.2em]">H1 Brindes • Excelência em Personalizados</p>
          </div>
        )}
      </div>
    </div>
  );
}
