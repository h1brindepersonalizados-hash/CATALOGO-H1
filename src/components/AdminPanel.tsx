import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Settings as SettingsIcon, Package, Hash, LogIn, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Product, Category, AppSettings } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const [localThemeColor, setLocalThemeColor] = useState(settings.themeColor);

  useEffect(() => {
    setLocalThemeColor(settings.themeColor);
  }, [settings.themeColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalThemeColor(e.target.value);
  };

  const handleColorSave = () => {
    if (localThemeColor !== settings.themeColor) {
      onUpdateSettings({ themeColor: localThemeColor });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminRef);
        
        if (adminSnap.exists()) {
          setIsAdmin(true);
        } else {
          try {
            const configSnap = await getDoc(doc(db, 'settings', 'config'));
            if (!configSnap.exists() || user.email === 'h1brindepersonalizados@gmail.com') {
               await setDoc(adminRef, { email: user.email, role: 'admin' });
               setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (e) {
            console.error("Admin check error:", e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Product state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [productCategory, setProductCategory] = useState<Category>(settings.categories[1] || 'Necessaires');
  const [image, setImage] = useState('');
  const [image2, setImage2] = useState('');
  const [tiers, setTiers] = useState([{ range: '10-29', price: '' }, { range: '30-49', price: '' }, { range: '50+', price: '' }]);

  // Settings state
  const [phone, setPhone] = useState(settings.phone);
  const [password, setPassword] = useState(settings.adminPassword);
  const [newCat, setNewCat] = useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setIsPasswordVerified(false);
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
      setIsPasswordVerified(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Falha na autenticação via Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsPasswordVerified(false);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean = false, isImage2: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Increased quality from 0.7 to 0.85
          
          if (isLogo) {
            onUpdateSettings({ logo: dataUrl });
          } else if (isImage2) {
            setImage2(dataUrl);
          } else {
            setImage(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingId || Date.now().toString(),
      name,
      code,
      category: productCategory,
      image: image || 'https://via.placeholder.com/800x600?text=Produto+Sem+Foto',
      ...(image2 ? { image2 } : {}),
      tiers: tiers.map(t => ({ ...t }))
    };

    try {
      if (editingId) {
        await onUpdateProduct(productData);
        alert('Produto atualizado com sucesso!');
        setEditingId(null);
        setActiveTab('manage');
      } else {
        await onAddProduct(productData);
        alert('Produto cadastrado com sucesso!');
      }

      // Reset
      setName('');
      setCode('');
      setImage('');
      setImage2('');
      setTiers([{ range: '10-29', price: '' }, { range: '30-49', price: '' }, { range: '50+', price: '' }]);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar produto. Verifique suas permissões ou contate o suporte.');
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCode(p.code);
    setProductCategory(p.category);
    setImage(p.image);
    setImage2(p.image2 || '');
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
            <SettingsIcon className="w-5 h-5" style={{ color: settings.themeColor }} />
            <h2 className="text-xl font-bold text-[#3D3A33]">Administração do Painel</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F9F1DC] rounded-full transition-colors">
            <X className="w-6 h-6 text-[#9C988F]" />
          </button>
        </div>

        {!isPasswordVerified ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${settings.themeColor}15` }}>
              <SettingsIcon className="w-8 h-8" style={{ color: settings.themeColor }} />
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
                className={`w-full bg-[#FDFBF7] border ${loginError ? 'border-red-500' : 'border-[#F3F0E6]'} rounded-2xl px-6 py-4 text-center text-sm outline-none focus:ring-1 transition-all`}
                style={{ '--tw-ring-color': settings.themeColor } as any}
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
                className="w-full text-white rounded-2xl py-4 font-bold tracking-widest transition-all shadow-lg hover:opacity-90"
                style={{ backgroundColor: settings.themeColor }}
              >
                VERIFICAR SENHA
              </button>
            </form>
          </div>
        ) : !currentUser ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${settings.themeColor}15` }}>
              <LogIn className="w-8 h-8" style={{ color: settings.themeColor }} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#3D3A33]">Sincronização em Nuvem</h3>
              <p className="text-xs text-[#9C988F] mt-1">Faça login para salvar as alterações em todos os dispositivos</p>
            </div>
            <button 
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="w-full max-w-xs flex items-center justify-center gap-3 bg-white border border-[#F3F0E6] rounded-2xl py-4 font-bold tracking-widest transition-all shadow-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              {isAuthenticating ? 'CONECTANDO...' : 'ENTRAR COM GOOGLE'}
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#3D3A33]">Acesso não Autorizado</h3>
              <p className="text-xs text-[#9C988F] mt-1">Você está logado como <strong>{currentUser.email}</strong>, mas não tem permissão de administrador.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full max-w-xs text-white bg-red-500 rounded-2xl py-4 font-bold tracking-widest transition-all shadow-lg hover:bg-red-600"
            >
              SAIR DA CONTA
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-2 bg-[#FDFBF7] border-b border-[#F3F0E6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-[#3D3A33]">LOGADO COMO ADM: {currentUser.email}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] font-bold text-[#9C988F] hover:text-red-500 transition-colors">
                <LogOut size={12} /> SAIR
              </button>
            </div>
            <div className="flex border-b border-[#F3F0E6] bg-white overflow-x-auto">
          <button 
            onClick={() => {
              setActiveTab('products');
              setEditingId(null);
            }}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'products' && !editingId ? 'border-b-2' : 'text-[#9C988F]'}`}
            style={activeTab === 'products' && !editingId ? { color: settings.themeColor, borderColor: settings.themeColor } : {}}
          >
            {editingId ? 'Editando' : 'Novo Produto'}
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'manage' ? 'border-b-2' : 'text-[#9C988F]'}`}
            style={activeTab === 'manage' ? { color: settings.themeColor, borderColor: settings.themeColor } : {}}
          >
            Gerenciar
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'banners' ? 'border-b-2' : 'text-[#9C988F]'}`}
            style={activeTab === 'banners' ? { color: settings.themeColor, borderColor: settings.themeColor } : {}}
          >
            Carrossel
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'categories' ? 'border-b-2' : 'text-[#9C988F]'}`}
            style={activeTab === 'categories' ? { color: settings.themeColor, borderColor: settings.themeColor } : {}}
          >
            Categorias
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'border-b-2' : 'text-[#9C988F]'}`}
             style={activeTab === 'settings' ? { color: settings.themeColor, borderColor: settings.themeColor } : {}}
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
                      setImage2('');
                    }}
                    className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Foto 1 (Principal)</span>
                    <div className="mt-2 flex items-center justify-center border-2 border-dashed border-[#E5E1D1] rounded-2xl h-40 overflow-hidden relative group cursor-pointer transition-colors"
                         style={{ '--tw-border-opacity': '1', borderColor: 'var(--hover-border)' } as any}
                         onMouseEnter={e => (e.currentTarget.style.borderColor = settings.themeColor)}
                         onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E1D1')}
                    >
                      {image ? (
                        <img src={image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-[#9C988F]">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-xs">Subir foto</span>
                        </div>
                      )}
                      <input type="file" onChange={(e) => handleImageUpload(e, false, false)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </label>
                  
                  <label className="block">
                    <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Foto 2 (Opcional)</span>
                    <div className="mt-2 flex items-center justify-center border-2 border-dashed border-[#E5E1D1] rounded-2xl h-40 overflow-hidden relative group cursor-pointer transition-colors"
                         style={{ '--tw-border-opacity': '1', borderColor: 'var(--hover-border)' } as any}
                         onMouseEnter={e => (e.currentTarget.style.borderColor = settings.themeColor)}
                         onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E1D1')}
                    >
                      {image2 ? (
                        <img src={image2} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-[#9C988F]">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-xs">Subir foto 2</span>
                        </div>
                      )}
                      <input type="file" onChange={(e) => handleImageUpload(e, false, true)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Nome</span>
                    <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': settings.themeColor } as any} placeholder="Ex: Nécessaire Box Luxo" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Código</span>
                    <input required value={code} onChange={e => setCode(e.target.value)} type="text" className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': settings.themeColor } as any} placeholder="Ex: NB-001" />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-[10px] font-bold text-[#9C988F] uppercase tracking-widest">Categoria</span>
                  <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': settings.themeColor } as any}>
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
                        }} className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': settings.themeColor } as any} />
                      </div>
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C988F]" />
                        <input placeholder="Ex: 29,90" value={tier.price} onChange={e => {
                          const newTiers = [...tiers];
                          newTiers[idx].price = e.target.value;
                          setTiers(newTiers);
                        }} className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': settings.themeColor } as any} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full text-white rounded-2xl py-4 font-bold transition-all shadow-lg active:scale-95 hover:opacity-90 mt-6" style={{ backgroundColor: settings.themeColor }}>
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
                        className="p-2 bg-white border border-[#E5E1D1] rounded-lg transition-colors hover:opacity-80"
                        style={{ color: settings.themeColor }}
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
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-90"
                  style={{ backgroundColor: settings.themeColor }}
                >
                  <Plus size={14} /> Novo Banner
                </button>
              </div>

              <div className="space-y-4">
                {settings.banners.map((banner, index) => (
                  <div key={banner.id} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#F3F0E6] space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: settings.themeColor }}>Banner #{index + 1}</span>
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
                            className="w-full bg-white border border-[#E5E1D1] rounded-xl px-4 py-2 text-sm outline-none focus:ring-1"
                            style={{ '--tw-ring-color': settings.themeColor } as any}
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
                            className="w-full bg-white border border-[#E5E1D1] rounded-xl px-4 py-2 text-sm outline-none focus:ring-1"
                            style={{ '--tw-ring-color': settings.themeColor } as any}
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
                            className="flex-1 bg-white border border-[#E5E1D1] rounded-xl px-4 py-2 text-[11px] outline-none focus:ring-1"
                            style={{ '--tw-ring-color': settings.themeColor } as any}
                          />
                          <label className="p-2 rounded-xl cursor-pointer transition-opacity hover:opacity-90" style={{ backgroundColor: `${settings.themeColor}15`, color: settings.themeColor }}>
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
                  className="flex-1 bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1"
                  style={{ '--tw-ring-color': settings.themeColor } as any}
                />
                <button 
                  onClick={handleAddCategory}
                  className="text-white px-6 rounded-xl font-bold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: settings.themeColor }}
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
                    <label className="inline-block px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:opacity-90" style={{ backgroundColor: `${settings.themeColor}15`, color: settings.themeColor }}>
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
                    className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1"
                    style={{ '--tw-ring-color': settings.themeColor } as any}
                  />
                  <button 
                    onClick={() => onUpdateSettings({ phone })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: settings.themeColor }}
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
                    className="w-full bg-[#FDFBF7] border border-[#F3F0E6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1"
                    style={{ '--tw-ring-color': settings.themeColor } as any}
                  />
                  <button 
                    onClick={() => onUpdateSettings({ adminPassword: password })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: settings.themeColor }}
                  >
                    ATUALIZAR
                  </button>
                </div>
              </div>

               <div className="space-y-4">
                <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Cor Principal</span>
                <div className="flex gap-4">
                  <div className="flex-1 max-w-[120px]">
                    <div className="relative flex items-center h-[42px]">
                       <input 
                        type="color"
                        value={localThemeColor} 
                        onChange={handleColorChange}
                        onBlur={handleColorSave}
                        className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                      />
                      <div 
                        className="w-full h-full rounded-xl border-2 border-[#E5E1D1]" 
                        style={{ backgroundColor: localThemeColor }}
                      />
                    </div>
                  </div>
                  <input 
                    type="text"
                    value={localThemeColor} 
                    onChange={handleColorChange}
                    onBlur={handleColorSave}
                    className="flex-1 bg-[#FDFBF7] border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1"
                    style={{ borderColor: localThemeColor, '--tw-ring-color': localThemeColor } as any}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-[#9C988F] uppercase tracking-widest">Ícone do Menu</span>
                <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => onUpdateSettings({ menuIcon: 'diamond' })}
                      className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.menuIcon === 'diamond' ? '' : 'border-[#F3F0E6] bg-white'}`}
                      style={settings.menuIcon === 'diamond' ? { borderColor: settings.themeColor, color: settings.themeColor, backgroundColor: `${settings.themeColor}15` } : {}}
                    >
                      <div className="w-4 h-4 rotate-45 border-2 border-current" />
                      <span className="text-[10px] font-bold text-center">Losango</span>
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ menuIcon: 'bag' })}
                      className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.menuIcon === 'bag' ? '' : 'border-[#F3F0E6] bg-white'}`}
                      style={settings.menuIcon === 'bag' ? { borderColor: settings.themeColor, color: settings.themeColor, backgroundColor: `${settings.themeColor}15` } : {}}
                    >
                      <Package size={18} />
                      <span className="text-[10px] font-bold text-center">Sacola</span>
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ menuIcon: 'custom' })}
                      className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.menuIcon === 'custom' ? '' : 'border-[#F3F0E6] bg-white'}`}
                      style={settings.menuIcon === 'custom' ? { borderColor: settings.themeColor, color: settings.themeColor, backgroundColor: `${settings.themeColor}15` } : {}}
                    >
                      {settings.customMenuIcon ? (
                        <img src={settings.customMenuIcon} className="w-5 h-5 object-contain" />
                      ) : (
                        <Upload size={18} />
                      )}
                      <span className="text-[10px] font-bold text-center">Personalizado</span>
                    </button>
                </div>
                {settings.menuIcon === 'custom' && (
                  <div className="flex items-center gap-4 p-4 bg-[#FDFBF7] rounded-xl border border-[#F3F0E6]">
                    <div className="w-12 h-12 border-2 border-dashed border-[#E5E1D1] rounded-lg flex items-center justify-center overflow-hidden">
                      {settings.customMenuIcon ? (
                        <img src={settings.customMenuIcon} className="w-8 h-8 object-contain" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#9C988F]" />
                      )}
                    </div>
                    <label className="flex-1 px-4 py-2 text-center rounded-lg text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer text-white" style={{ backgroundColor: settings.themeColor }}>
                      FAZER UPLOAD DO ÍCONE
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    onUpdateSettings({ customMenuIcon: event.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                    </label>
                  </div>
                )}
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
