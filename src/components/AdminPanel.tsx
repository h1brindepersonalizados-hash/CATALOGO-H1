import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Settings as SettingsIcon, Package, Hash } from 'lucide-react';
import { Product, Category, AppSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  products: Product[];
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  products, 
  settings, 
  onUpdateSettings 
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'manage' | 'banners' | 'settings' | 'categories'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Product state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [productCategory, setProductCategory] = useState<Category>(settings.categories[1] || 'Necessaires');
  const [image, setImage] = useState('');
  const [tiers, setTiers] = useState([{ range: '10-29', price: '' }, { range: '30-49', price: '' }, { range: '50+', price: '' }]);

  // Settings state
  const [phone, setPhone] = useState(settings.phone);
  const [password, setPassword] = useState(settings.adminPassword);
  const [newCat, setNewCat] = useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setLoginPassword('');
      setLoginError(false);
    }
    setPhone(settings.phone);
    setPassword(settings.adminPassword);
  }, [isOpen, settings.phone, settings.adminPassword]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === settings.adminPassword) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          if (isLogo) {
            onUpdateSettings({ logo: dataUrl });
          } else {
            setImage(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingId || Date.now().toString(),
      name,
      code,
      category: productCategory,
      image: image || 'https://via.placeholder.com/800x600?text=Produto+Sem+Foto',
      tiers: tiers.map(t => ({ ...t }))
    };

    if (editingId) {
      onUpdateProduct(productData);
      alert('Produto atualizado com sucesso!');
      setEditingId(null);
      setActiveTab('manage');
    } else {
      onAddProduct(productData);
      alert('Produto cadastrado com sucesso!');
    }

    // Reset
    setName('');
    setCode('');
    setImage('');
    setTiers([{ range: '10-29', price: '' }, { range: '30-49', price: '' }, { range: '50+', price: '' }]);
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCode(p.code);
    setProductCategory(p.category);
    setImage(p.image);
    setTiers(p.tiers);
    setActiveTab('products');
  };

  const handleAddCategory = () => {
    if (newCat && !settings.categories.includes(newCat)) {
      onUpdateSettings({ categories: [...settings.categories, newCat] });
      setNewCat('');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#3D3A33]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#F3F0E6] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#C5A059]" />
            <h2 className="text-xl font-bold text-[#3D3A33]">Administração do Painel</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F9F1DC] rounded-full transition-colors">
            <X className="w-6 h-6 text-[#9C988F]" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 bg-[#F9F1DC] rounded-full flex items-center justify-center">
              <SettingsIcon className="w-8 h-8 text-[#C5A059]" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#3D3A33]">Acesso Restrito</h3>
              <p className="text-xs text-[#9C988F] mt-1">Digite a senha para gerenciar o catálogo</p>
            </div>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <input 
                type="password"
                autoFocus
                value={loginPassword}
                onChange={e => {
                  setLoginPassword(e.target.value);
                  setLoginError(false);
                }}
                placeholder="Digite sua senha..."
                className={`w-full bg-[#FDFBF7] border ${loginError ? 'border-red-500' : 'border-[#F3F0E6]'} rounded-2xl px-6 py-4 text-center text-sm outline-none focus:ring-2 focus:ring-[#C5A059] transition-all`}
              />
              {loginError && (
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-red-500 uppercase">Senha Incorreta</p>
                  {settings.adminPassword === 'admin' && (
                    <p className="text-[9px] text-[#9C988F]">Tente a senha padrão: <strong>admin</strong></p>
                  )}
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-[#3D3A33] hover:bg-[#C5A059] text-white rounded-2xl py-4 font-bold tracking-widest transition-all shadow-lg"
              >
                ENTRAR NO PAINEL
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex border-b border-[#F3F0E6] bg-white overflow-x-auto">
          <button 
            onClick={() => {
              setActiveTab('products');
              setEditingId(null);
            }}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'products' && !editingId ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#9C988F]'}`}
          >
            {editingId ? 'Editando' : 'Novo Produto'}
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'manage' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#9C988F]'}`}
          >
            Gerenciar
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'banners' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#9C988F]'}`}
          >
            Carrossel
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'categories' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#9C988F]'}`}
          >
            Categorias
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#9C988F]'}`}
          >
            Configurações
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' && (
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#3D3A33]">
                  {editingId ? 'Editando Produto' : 'Informações do Produto'}
                </h3>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setCode('');
                      setImage('');
                    }}
                    className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Foto do Produto</span>
                  <div className="mt-2 flex items-center justify-center border-2 border-dashed border-[#E5E1D1] rounded-2xl h-40 overflow-hidden relative group cursor-pointer hover:border-[#C5A059] transition-colors">
                    {image ? (
                      <img src={image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-[#9C988F]">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs">Clique para subir ou arraste</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Nome</span>
                    <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]" placeholder="Ex: Nécessaire Box Luxo" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Código</span>
                    <input required value={code} onChange={e => setCode(e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]" placeholder="Ex: NB-001" />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Categoria</span>
                  <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]">
                    {settings.categories.filter(c => c !== 'Tudo').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Tabela de Preços (Atacado)</span>
                  {tiers.map((tier, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="relative flex-1">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C988F]" />
                        <input placeholder="Ex: 10-29" value={tier.range} onChange={e => {
                          const newTiers = [...tiers];
                          newTiers[idx].range = e.target.value;
                          setTiers(newTiers);
                        }} className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]" />
                      </div>
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C988F]" />
                        <input placeholder="Ex: 29,90" value={tier.price} onChange={e => {
                          const newTiers = [...tiers];
                          newTiers[idx].price = e.target.value;
                          setTiers(newTiers);
                        }} className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-[#3D3A33] hover:bg-[#C5A059] text-white rounded-2xl py-4 font-bold transition-all shadow-lg active:scale-95">
                {editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PRODUTO'}
              </button>
            </form>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#3D3A33]">Produtos Cadastrados ({products.length})</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-[#FDFBF7] rounded-xl border border-[#F3F0E6]">
                    <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#3D3A33] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#9C988F] font-mono uppercase">{p.code} • {p.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="p-2 bg-white border border-[#E5E1D1] rounded-lg text-[#C5A059] hover:bg-[#F9F1DC] transition-colors"
                      >
                        <SettingsIcon size={14} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 bg-white border border-[#E5E1D1] rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#3D3A33]">Banners do Destaque ({settings.banners.length})</h3>
                <button 
                  onClick={() => {
                    const newBanner = {
                      id: Date.now().toString(),
                      title: 'Novo Título',
                      subtitle: 'Subtítulo do banner',
                      image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1200'
                    };
                    onUpdateSettings({ banners: [...settings.banners, newBanner] });
                  }}
                  className="flex items-center gap-2 bg-[#C5A059] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#A6803F] transition-colors"
                >
                  <Plus size={14} /> Novo Banner
                </button>
              </div>

              <div className="space-y-4">
                {settings.banners.map((banner, index) => (
                  <div key={banner.id} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#F3F0E6] space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">Banner #{index + 1}</span>
                      <button 
                        onClick={() => {
                          const updated = settings.banners.filter(b => b.id !== banner.id);
                          onUpdateSettings({ banners: updated });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="block space-y-1">
                          <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Título</span>
                          <input 
                            value={banner.title} 
                            onChange={e => {
                              const updated = settings.banners.map(b => b.id === banner.id ? { ...b, title: e.target.value } : b);
                              onUpdateSettings({ banners: updated });
                            }}
                            className="w-full bg-white border border-[#E5E1D1] rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Subtítulo</span>
                          <input 
                            value={banner.subtitle} 
                            onChange={e => {
                              const updated = settings.banners.map(b => b.id === banner.id ? { ...b, subtitle: e.target.value } : b);
                              onUpdateSettings({ banners: updated });
                            }}
                            className="w-full bg-white border border-[#E5E1D1] rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]"
                          />
                        </label>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Imagem (URL ou Upload)</span>
                        <div className="flex gap-2">
                           <input 
                            value={banner.image} 
                            onChange={e => {
                              const updated = settings.banners.map(b => b.id === banner.id ? { ...b, image: e.target.value } : b);
                              onUpdateSettings({ banners: updated });
                            }}
                            placeholder="URL da imagem..."
                            className="flex-1 bg-white border border-[#E5E1D1] rounded-xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#C5A059]"
                          />
                          <label className="bg-[#F9F1DC] text-[#A6803F] p-2 rounded-xl cursor-pointer hover:bg-[#F3E6C5]">
                            <Upload size={16} />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const updated = settings.banners.map(b => b.id === banner.id ? { ...b, image: event.target?.result as string } : b);
                                    onUpdateSettings({ banners: updated });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <img src={banner.image} className="mt-2 w-full h-24 object-cover rounded-xl border border-[#E5E1D1]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  value={newCat} 
                  onChange={e => setNewCat(e.target.value)}
                  placeholder="Nova categoria..." 
                  className="flex-1 bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
                <button 
                  onClick={handleAddCategory}
                  className="bg-[#C5A059] text-white px-6 rounded-xl font-bold hover:bg-[#A6803F] transition-colors"
                >
                  ADICIONAR
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {settings.categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 bg-[#FDFBF7] rounded-xl border border-[#F3F0E6]">
                    <span className="text-sm font-medium text-[#3D3A33]">{cat}</span>
                    {cat !== 'Tudo' && (
                      <button 
                        onClick={() => {
                          onUpdateSettings({ categories: settings.categories.filter(c => c !== cat) });
                        }}
                        className="text-[#9C988F] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Identidade Visual (Logo)</span>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-[#FDFBF7] border-2 border-dashed border-[#E5E1D1] rounded-2xl flex items-center justify-center overflow-hidden">
                    {settings.logo ? (
                      <img src={settings.logo} className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#9C988F]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-[#9C988F]">Suba sua logomarca para personalizar o catálogo e o menu lateral.</p>
                    <label className="inline-block bg-[#F9F1DC] text-[#A6803F] px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#F3E6C5] transition-colors">
                      TROCAR LOGO
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">WhatsApp da Empresa</span>
                <div className="relative">
                  <input 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ex: 5592984180184" 
                    className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]"
                  />
                  <button 
                    onClick={() => onUpdateSettings({ phone })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C5A059] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                  >
                    SALVAR
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Senha de Acesso ADM</span>
                <div className="relative">
                  <input 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nova senha..." 
                    className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#C5A059]"
                  />
                  <button 
                    onClick={() => onUpdateSettings({ adminPassword: password })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C5A059] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                  >
                    ATUALIZAR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
