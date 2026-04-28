import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import WhatsAppButton from './components/WhatsAppButton';
import CartModal from './components/CartModal';
import Lightbox from './components/Lightbox';
import BannerCarousel from './components/BannerCarousel';
import AdminPanel from './components/AdminPanel';
import { Product, Category, CartItem, AppSettings, DEFAULT_CATEGORIES, Banner } from './types';
import { Filter, ShoppingBag, Settings, CheckCircle2, X, User, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  getSettings, 
  saveSettings, 
  getProducts, 
  saveProduct, 
  deleteProductFromStore,
  testFirestoreConnection
} from './lib/firestoreService';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { db } from './lib/firebase';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nécessaire Classic Feminina',
    code: 'NEC-001',
    category: 'Necessaires',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '10 a 29', price: '22,90' },
      { range: '30 a 49', price: '19,50' },
      { range: '50+', price: '16,90' },
    ]
  },
  {
    id: '2',
    name: 'Mochila Executive Premium',
    code: 'MOC-552',
    category: 'Mochilas',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '10 a 29', price: '145,00' },
      { range: '30 a 49', price: '129,00' },
      { range: '50+', price: '115,00' },
    ]
  },
  {
    id: '3',
    name: 'Kit Brindes Office Eco',
    code: 'KIT-982',
    category: 'Kits Corporativos',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '10 a 29', price: '89,90' },
      { range: '30 a 49', price: '75,00' },
      { range: '50+', price: '68,00' },
    ]
  },
  {
    id: '4',
    name: 'Ecobag Algodão Orgânico',
    code: 'BAS-120',
    category: 'Bolsas',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '20 a 49', price: '15,90' },
      { range: '50 a 99', price: '12,50' },
      { range: '100+', price: '9,90' },
    ]
  },
  {
    id: '5',
    name: 'Frasqueira Maternidade Luxo',
    code: 'FRA-441',
    category: 'Frasqueiras',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '05 a 14', price: '185,00' },
      { range: '15 a 29', price: '169,00' },
      { range: '30+', price: '149,00' },
    ]
  },
  {
    id: '6',
    name: 'Nécessaire Travel Man',
    code: 'NEC-015',
    category: 'Necessaires',
    image: 'https://images.unsplash.com/photo-1491238473395-d7a81ccaec7d?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '10 a 29', price: '28,90' },
      { range: '30 a 49', price: '24,50' },
      { range: '50+', price: '21,90' },
    ]
  },
  {
    id: '7',
    name: 'Bolsa Térmica Work Healthy',
    code: 'BAS-005',
    category: 'Bolsas',
    image: 'https://images.unsplash.com/photo-1583944659285-05891d407166?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '10 a 29', price: '55,00' },
      { range: '30 a 49', price: '48,00' },
      { range: '50+', price: '42,00' },
    ]
  },
  {
    id: '8',
    name: 'Caderno Custom Soft Touch',
    code: 'BRI-771',
    category: 'Brindes',
    image: 'https://images.unsplash.com/photo-1531346878377-a5ec20356bb4?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '20 a 49', price: '32,00' },
      { range: '50 a 99', price: '28,00' },
      { range: '100+', price: '24,00' },
    ]
  },
  {
    id: '9',
    name: 'Nécessaire Box Elegance',
    code: 'NEC-088',
    category: 'Necessaires',
    image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=800&auto=format&fit=crop',
    tiers: [
      { range: '10 a 29', price: '35,90' },
      { range: '30 a 49', price: '31,50' },
      { range: '50+', price: '27,90' },
    ]
  },
];

const DEFAULT_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Mais Pedidos: Nécessaire Box Luxo',
    subtitle: 'O item favorito dos nossos clientes para brindes sofisticados.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Best Seller: Kit Maternidade Personalizado',
    subtitle: 'Frasqueiras e bolsas térmicas que acompanham os melhores momentos.',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Top Escolha: Mochila Executiva',
    subtitle: 'Durabilidade e elegância para o dia a dia corporativo.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('Tudo');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // Initialize empty
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    logo: '',
    phone: '5592984180184',
    adminPassword: 'admin',
    categories: DEFAULT_CATEGORIES,
    banners: DEFAULT_BANNERS,
    themeColor: '#C5A059',
    menuIcon: 'diamond'
  });

  // Initial load and real-time listeners
  useEffect(() => {
    testFirestoreConnection();

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [cloudSettings, cloudProducts] = await Promise.all([
          getSettings(),
          getProducts()
        ]);

        if (cloudSettings) {
          setSettings(cloudSettings);
        } else {
          // First time setup: save defaults to cloud
          await saveSettings(settings);
        }

        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        } else {
          // First time setup: save mock products to cloud
          await Promise.all(MOCK_PRODUCTS.map(p => saveProduct(p)));
          setProducts(MOCK_PRODUCTS);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Listen for real-time updates for settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
    });

    // Listen for real-time updates for products
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const updatedProducts = snapshot.docs.map(doc => doc.data() as Product);
      setProducts(updatedProducts);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeProducts();
    };
  }, []);

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleAddProduct = async (newProduct: Product) => {
    // Note: State will be updated by onSnapshot listener
    await saveProduct(newProduct);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    // Note: State will be updated by onSnapshot listener
    await saveProduct(updatedProduct);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProductFromStore(id);
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Tudo') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 10 }
            : item
        );
      }
      return [...prev, { product, quantity: 10, theme: '' }];
    });
    
    // Toast instead of opening modal
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(prev => prev.map(item => item.product.id === id ? { ...item, quantity } : item));
  };

  const updateTheme = (id: string, theme: string) => {
    setCartItems(prev => prev.map(item => item.product.id === id ? { ...item, theme } : item));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5A059]" />
          <p className="text-[#9C988F] font-bold animate-pulse">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeCategory={activeCategory}
        categories={settings.categories}
        onCategoryChange={(c) => {
          setActiveCategory(c);
          setIsSidebarOpen(false);
        }}
        onClose={() => setIsSidebarOpen(false)}
        logo={settings.logo}
        settings={settings}
        onAdminClick={() => setIsAdminOpen(true)}
      />
      
      <main className="flex-1 md:ml-[240px] flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onCartClick={() => setIsCartOpen(true)}
          cartCount={cartItems.length}
          onAdminClick={() => setIsAdminOpen(true)}
          settings={settings}
        />
        
        <div className="p-8 pb-32">
          {/* Banner Carousel */}
          {activeCategory === 'Tudo' && <BannerCarousel banners={settings.banners} settings={settings} />}

          {/* Hero Section */}
          <section className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-[#3D3A33] tracking-tight mb-2">
                Olá, <span style={{ color: settings.themeColor }}>que bom ter você aqui!</span>
              </h2>
              <p className="text-[#9C988F] max-w-2xl leading-relaxed text-sm">
                Explore nosso catálogo de brindes de luxo. 
                Personalize seus itens favoritos para eventos corporativos e celebrações inesquecíveis.
              </p>
            </div>
          </section>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-2 bg-white rounded-lg border shadow-sm transition-colors" style={{ borderColor: `${settings.themeColor}30` }}>
                <Filter className="w-4 h-4" style={{ color: settings.themeColor }} />
              </div>
              <h3 className="font-bold text-[#3D3A33] text-sm md:text-base">
                {activeCategory === 'Tudo' ? 'Todos os Itens' : activeCategory}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${settings.themeColor}15`, color: settings.themeColor }}>
                {filteredProducts.length} itens
              </span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onImageClick={(img: string) => setSelectedImage(img)}
                settings={settings}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${settings.themeColor}15` }}>
                 <ShoppingBag className="w-10 h-10 opacity-50" style={{ color: settings.themeColor }} />
              </div>
              <h3 className="text-xl font-bold text-[#3D3A33]">Nenhum produto encontrado</h3>
              <p className="text-[#9C988F] mt-2">Tente mudar a categoria selecionada.</p>
            </div>
          )}
        </div>

        <WhatsAppButton phone={settings.phone} settings={settings} />
        
        <CartModal 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onUpdateTheme={updateTheme}
          onRemove={removeFromCart}
          phone={settings.phone}
          settings={settings}
        />

        <Lightbox 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />

        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          products={products}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-[#3D3A33] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: settings.themeColor }}>
                <CheckCircle2 className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Item adicionado!</p>
                <div className="flex items-center gap-1 text-[10px] text-white/60 mb-1">
                  <Clock size={10} /> Prazo: 15 dias úteis
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(true);
                    setShowToast(false);
                  }}
                  className="text-xs font-bold uppercase tracking-widest hover:underline"
                  style={{ color: settings.themeColor }}
                >
                  Ver Carrinho Agora
                </button>
              </div>
              <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

