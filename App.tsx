
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, Size, CartItem, DeliveryZone, User, HalfPizzasSelection, Extra, PaymentMethod, Order, PizzaCategory, ItemComment, OrderStatus } from './types';
import { PIZZA_MENU, DRINK_MENU, DELIVERY_ZONES, EXTRAS, DEFAULT_CATEGORIES } from './constants';
import LoginModal from './components/LoginModal';
import SnakeGame from './components/SnakeGame';
import AdminPanel from './components/AdminPanel';
import UserProfileModal from './components/UserProfileModal';

interface FlyingItem {
    id: number;
    x: number;
    y: number;
    destX: number;
    destY: number;
}

// Snow Component
const SnowEffect = () => {
    const flakes = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5 + 0.3,
        fontSize: `${Math.random() * 10 + 10}px`
    })), []);

    return (
        <>
            {flakes.map(flake => (
                <div 
                    key={flake.id} 
                    className="snowflake"
                    style={{
                        left: flake.left,
                        animationDuration: flake.animationDuration,
                        animationDelay: flake.animationDelay,
                        opacity: flake.opacity,
                        fontSize: flake.fontSize
                    }}
                >
                    ❄
                </div>
            ))}
        </>
    );
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Dynamic Data (Loaded from LS or Constants)
    const [pizzaList, setPizzaList] = useState<MenuItem[]>([]);
    const [drinkList, setDrinkList] = useState<MenuItem[]>([]);
    const [zoneList, setZoneList] = useState<DeliveryZone[]>([]);
    const [extrasList, setExtrasList] = useState<Extra[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const [selectedMenu, setSelectedMenu] = useState<'PIZZAS' | 'BEBIDAS' | 'ZONAS'>('PIZZAS');
    const [selectedSize, setSelectedSize] = useState<Size>('FAMILIAR');
    const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // Filters
    const [activeCategory, setActiveCategory] = useState<'TODAS' | string>('TODAS');

    // Half and Half
    const [isHalfAndHalfMode, setIsHalfAndHalfMode] = useState(false);
    const [selectedHalfPizzas, setSelectedHalfPizzas] = useState<HalfPizzasSelection>({ left: null, right: null });
    const [isHalfAndHalfConfiguring, setIsHalfAndHalfConfiguring] = useState(false); // New state for configuring extras
    
    // UI States
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isGameOpen, setIsGameOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);
    const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);

    // Expansion State
    const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
    const [expandedCartItemIndex, setExpandedCartItemIndex] = useState<number | null>(null);
    const [tempItemConfig, setTempItemConfig] = useState<{ quantity: number, extras: Extra[] }>({ quantity: 1, extras: [] });

    // Animations
    const [cartBump, setCartBump] = useState(false);
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const cartButtonRef = useRef<HTMLButtonElement>(null);
    const [modifiedItemIndex, setModifiedItemIndex] = useState<number | null>(null);
    const [zoneAnimationTrigger, setZoneAnimationTrigger] = useState(false);
    const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);

    // Payment and History
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);

    // Sound & Sync Refs
    const prevOrderCountRef = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Comments System
    const [comments, setComments] = useState<Record<string, ItemComment[]>>({});
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentTargetItem, setCommentTargetItem] = useState<MenuItem | null>(null);
    const [tempComment, setTempComment] = useState('');
    const [tempRating, setTempRating] = useState(5);

    // Ref for smooth scrolling
    const contentRef = useRef<HTMLDivElement>(null);

    // Secret Admin Click
    const [secretClicks, setSecretClicks] = useState(0);

    // Favorites System
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    
    // Zoom State
    const [headerZoom, setHeaderZoom] = useState(1);

    // Initialize Audio
    useEffect(() => {
        // Som de campainha de loja agradável
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    // Real-time Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'kantinho_orders') {
                const newOrders = e.newValue ? JSON.parse(e.newValue) : [];
                setOrderHistory(newOrders);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Monitor New Orders for Sound
    useEffect(() => {
        if (orderHistory.length > prevOrderCountRef.current) {
            // Check if the latest order is 'RECEBIDO'
            const latestOrder = orderHistory[orderHistory.length - 1];
            
            // Only play if we have a valid latest order with RECEBIDO status
            if (latestOrder && latestOrder.status === 'RECEBIDO') {
                audioRef.current?.play().catch(err => console.log('Autoplay blocked:', err));
                
                if (isAdminOpen) {
                    showNotification("🔔 Novo Pedido Recebido!", "success");
                }
            }
        }
        prevOrderCountRef.current = orderHistory.length;
    }, [orderHistory, isAdminOpen]);

    // Initialization Effect
    useEffect(() => {
        const storedUser = localStorage.getItem('kantinho_cliente_atual');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // Load Menu Data
        const storedPizzas = localStorage.getItem('kantinho_menu_pizzas');
        setPizzaList(storedPizzas ? JSON.parse(storedPizzas) : PIZZA_MENU);

        const storedDrinks = localStorage.getItem('kantinho_menu_drinks');
        setDrinkList(storedDrinks ? JSON.parse(storedDrinks) : DRINK_MENU);

        const storedZones = localStorage.getItem('kantinho_menu_zones');
        if (storedZones) {
            setZoneList(JSON.parse(storedZones));
        } else {
            // Ensure we have the defaults from constants if nothing in LS
            setZoneList(DELIVERY_ZONES);
        }

        const storedExtras = localStorage.getItem('kantinho_menu_extras');
        setExtrasList(storedExtras ? JSON.parse(storedExtras) : EXTRAS);

        const storedCategories = localStorage.getItem('kantinho_menu_categories');
        setCategories(storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES);

        // Load History
        const history = localStorage.getItem('kantinho_orders');
        if (history) {
            const parsedHistory = JSON.parse(history);
            setOrderHistory(parsedHistory);
            prevOrderCountRef.current = parsedHistory.length; // Init ref to avoid sound on reload
        }

        // Load Comments with Migration Check
        const storedComments = localStorage.getItem('kantinho_comments');
        if (storedComments) {
            try {
                const parsed = JSON.parse(storedComments);
                const migrated: Record<string, ItemComment[]> = {};
                Object.keys(parsed).forEach(key => {
                    if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
                        // Check if old string format
                        if (typeof parsed[key][0] === 'string') {
                            migrated[key] = parsed[key].map((text: string) => ({
                                text,
                                rating: 5,
                                date: new Date().toISOString(),
                                userName: 'Anônimo'
                            }));
                        } else {
                            migrated[key] = parsed[key];
                        }
                    } else {
                        migrated[key] = [];
                    }
                });
                setComments(migrated);
            } catch (e) {
                console.error("Erro ao carregar comentários", e);
            }
        }

        // Load Favorites
        const storedFavs = localStorage.getItem('kantinho_favorites');
        if (storedFavs) setFavorites(JSON.parse(storedFavs));

        setLoading(false);
        
        setTimeout(() => {
            showNotification("🎄 Feliz Natal do Kantinho Delícia! 🎅", "success");
        }, 1500);
    }, []);

    // Helper Functions
    const updatePizzaList = (items: MenuItem[]) => {
        setPizzaList(items);
        localStorage.setItem('kantinho_menu_pizzas', JSON.stringify(items));
    };

    const updateDrinkList = (items: MenuItem[]) => {
        setDrinkList(items);
        localStorage.setItem('kantinho_menu_drinks', JSON.stringify(items));
    };

    const updateZoneList = (zones: DeliveryZone[]) => {
        setZoneList(zones);
        localStorage.setItem('kantinho_menu_zones', JSON.stringify(zones));
    };

    const updateExtrasList = (items: Extra[]) => {
        setExtrasList(items);
        localStorage.setItem('kantinho_menu_extras', JSON.stringify(items));
    };

    const updateCategories = (cats: string[]) => {
        setCategories(cats);
        localStorage.setItem('kantinho_menu_categories', JSON.stringify(cats));
    };

    const showNotification = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getItemPrice = (item: MenuItem, size: Size) => {
        return item.prices[size] || 0;
    };

    const toggleFavorite = (itemName: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        let newFavs;
        if (favorites.includes(itemName)) {
            newFavs = favorites.filter(f => f !== itemName);
            showNotification(`${itemName} removido dos favoritos`, 'warning');
        } else {
            newFavs = [...favorites, itemName];
            showNotification(`${itemName} adicionado aos favoritos!`, 'success');
        }
        setFavorites(newFavs);
        localStorage.setItem('kantinho_favorites', JSON.stringify(newFavs));
    };

    const triggerCartAnimation = () => {
        setCartBump(true);
        setTimeout(() => setCartBump(false), 300);
    };

    const triggerFlyInAnimation = (startX: number, startY: number) => {
        if (!cartButtonRef.current) return;
        const cartRect = cartButtonRef.current.getBoundingClientRect();
        const destX = cartRect.left + cartRect.width / 2;
        const destY = cartRect.top + cartRect.height / 2;
        
        const newItem: FlyingItem = {
            id: Date.now(),
            x: startX,
            y: startY,
            destX,
            destY
        };
        
        setFlyingItems(prev => [...prev, newItem]);
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(i => i.id !== newItem.id));
        }, 800);
    };

    const addToCart = (item: MenuItem, size: Size, e?: React.MouseEvent) => {
        if (!item.prices[size]) {
            showNotification(`Tamanho indisponível para ${item.name}`, 'error');
            return;
        }

        if (e) triggerFlyInAnimation(e.clientX, e.clientY);

        const newItem: CartItem = {
            ...item,
            size,
            quantity: 1,
            pizzaBox: selectedMenu === 'PIZZAS',
            selectedExtras: []
        };

        let addedIndex = -1;

        setCartItems(prev => {
            const existingIdx = prev.findIndex(i => 
                i.name === newItem.name && 
                i.size === newItem.size && 
                JSON.stringify(i.halfPizzas) === JSON.stringify(newItem.halfPizzas)
            );

            if (existingIdx > -1) {
                const updated = [...prev];
                updated[existingIdx].quantity += 1;
                addedIndex = existingIdx;
                return updated;
            }
            addedIndex = prev.length;
            return [...prev, newItem];
        });

        setTimeout(() => {
            setModifiedItemIndex(addedIndex);
            setLastAddedIndex(addedIndex);
            setTimeout(() => {
                setModifiedItemIndex(null);
                setLastAddedIndex(null);
            }, 1000);
        }, 0);

        triggerCartAnimation();
        showNotification(`${item.name} adicionado!`);
    };

    const addExpandedItemToCart = (item: MenuItem, e?: React.MouseEvent) => {
        if (!item.prices[selectedSize]) {
             showNotification(`${item.name} indisponível em tamanho ${selectedSize}`, 'error');
             return;
        }
        
        const newItem: CartItem = {
            ...item,
            size: selectedSize,
            quantity: tempItemConfig.quantity,
            pizzaBox: selectedMenu === 'PIZZAS',
            selectedExtras: tempItemConfig.extras
        };

        if (e) triggerFlyInAnimation(e.clientX, e.clientY);

        let addedIndex = -1;

        setCartItems(prev => {
            const existsIndex = prev.findIndex(i => 
                i.name === newItem.name && 
                i.size === newItem.size &&
                JSON.stringify(i.selectedExtras) === JSON.stringify(newItem.selectedExtras) &&
                JSON.stringify(i.halfPizzas) === JSON.stringify(newItem.halfPizzas)
            );

            if (existsIndex >= 0) {
                const updated = [...prev];
                updated[existsIndex].quantity += newItem.quantity;
                addedIndex = existsIndex;
                return updated;
            }
            addedIndex = prev.length;
            return [...prev, newItem];
        });
        
        setTimeout(() => {
            setLastAddedIndex(addedIndex);
            setTimeout(() => setLastAddedIndex(null), 1000);
        }, 0);

        triggerCartAnimation();
        showNotification(`${item.name} adicionado!`);
        setExpandedItemIndex(null);
        setIsHalfAndHalfConfiguring(false); // Reset half & half config state
        setTempItemConfig({ quantity: 1, extras: [] }); // Reset config
    };

    const removeFromCart = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setCartItems(prev => {
            const updated = [...prev];
            const newQty = updated[index].quantity + delta;
            if (newQty < 1) {
                updated.splice(index, 1);
                return updated;
            }
            updated[index].quantity = newQty;
            return updated;
        });
        setModifiedItemIndex(index);
        setTimeout(() => setModifiedItemIndex(null), 1000);
    };

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((acc, item) => {
            const itemPrice = getItemPrice(item, item.size);
            const extrasPrice = item.selectedExtras?.reduce((sum, e) => sum + e.price, 0) || 0;
            return acc + (itemPrice + extrasPrice) * item.quantity;
        }, 0);
        
        const boxFee = cartItems.reduce((acc, item) => item.pizzaBox ? acc + (100 * item.quantity) : acc, 0);
        const deliveryFee = selectedZone ? selectedZone.price : 0;
        
        return subtotal + boxFee + deliveryFee;
    };

    const handleClearCart = () => {
        setCartItems([]);
        setIsClearCartModalOpen(false);
        showNotification('Carrinho limpo!', 'success');
    };

    const prepareHalfAndHalf = (e: React.MouseEvent) => {
        if (!selectedHalfPizzas.left || !selectedHalfPizzas.right) return;
        
        const priceLeft = selectedHalfPizzas.left.prices[selectedSize] || 0;
        const priceRight = selectedHalfPizzas.right.prices[selectedSize] || 0;
        
        if (priceLeft === 0 || priceRight === 0) {
             showNotification(`Uma das pizzas não tem preço para ${selectedSize}`, "error");
             return;
        }

        setIsHalfAndHalfConfiguring(true);
        setTempItemConfig({ quantity: 1, extras: [] });
        e.stopPropagation();
    };

    const getHalfAndHalfItem = (): MenuItem => {
        if (!selectedHalfPizzas.left || !selectedHalfPizzas.right) return {} as MenuItem;
        const priceLeft = selectedHalfPizzas.left.prices[selectedSize] || 0;
        const priceRight = selectedHalfPizzas.right.prices[selectedSize] || 0;
        const finalPrice = Math.max(priceLeft, priceRight);

        return {
            name: `Meio ${selectedHalfPizzas.left.name} / Meio ${selectedHalfPizzas.right.name}`,
            desc: `Metade: ${selectedHalfPizzas.left.desc} | Metade: ${selectedHalfPizzas.right.desc}`,
            prices: { [selectedSize]: finalPrice },
            category: "ESPECIAL",
            isHalfAndHalf: true,
            halfPizzas: selectedHalfPizzas
        };
    };

    const currentHalfAndHalfPrice = useMemo(() => {
        if (selectedHalfPizzas.left && selectedHalfPizzas.right) {
             const p1 = selectedHalfPizzas.left.prices[selectedSize] || 0;
             const p2 = selectedHalfPizzas.right.prices[selectedSize] || 0;
             if (p1 === 0 || p2 === 0) return null;
             return Math.max(p1, p2);
        }
        return 0;
    }, [selectedHalfPizzas, selectedSize]);

    const handleSaveComment = () => {
        if (!commentTargetItem || !tempComment.trim() || !user) return;
        
        const newComment: ItemComment = {
            text: tempComment,
            rating: tempRating,
            date: new Date().toISOString(),
            userName: user.nome
        };

        const updatedComments = {
            ...comments,
            [commentTargetItem.name]: [...(comments[commentTargetItem.name] || []), newComment]
        };
        
        setComments(updatedComments);
        localStorage.setItem('kantinho_comments', JSON.stringify(updatedComments));
        
        setIsCommentModalOpen(false);
        setTempComment('');
        setTempRating(5);
        showNotification('Avaliação enviada com sucesso!');
    };

    const finalizeOrder = () => {
        setIsOrderConfirmationOpen(false);
        setIsSubmitting(true);

        const total = calculateTotal();
        const subtotal = cartItems.reduce((acc, item) => acc + ((item.prices[item.size] || 0) + (item.selectedExtras?.reduce((s,e)=>s+e.price,0)||0)) * item.quantity, 0);
        const boxFee = cartItems.reduce((acc, item) => item.pizzaBox ? acc + (100 * item.quantity) : acc, 0);
        
        // Save Order
        const newOrder: Order = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: cartItems,
            total,
            paymentMethod,
            deliveryZone: selectedZone?.name,
            status: 'RECEBIDO',
            customerName: user?.nome,
            customerPhone: user?.telefone
        };
        
        const updatedHistory = [...orderHistory, newOrder];
        setOrderHistory(updatedHistory);
        localStorage.setItem('kantinho_orders', JSON.stringify(updatedHistory));

        // WhatsApp Message
        let msg = `*🎄 PEDIDO DE NATAL KANTINHO DELÍCIA 🎄*\n`;
        msg += `*Cliente:* ${user?.nome}\n`;
        msg += `*Tel:* ${user?.telefone}\n\n`;
        
        cartItems.forEach(item => {
            msg += `*${item.quantity}x ${item.name} (${item.size})*\n`;
            if (item.selectedExtras && item.selectedExtras.length > 0) {
                msg += `   + Extras: ${item.selectedExtras.map(e => e.name).join(', ')}\n`;
            }
            if (item.pizzaBox) msg += `   + Caixa (+100$)\n`;
        });
        
        msg += `\n*Subtotal:* ${subtotal}$`;
        if (boxFee > 0) msg += `\n*Caixas:* ${boxFee}$`;
        if (selectedZone) msg += `\n*Entrega (${selectedZone.name}):* ${selectedZone.price}$`;
        
        msg += `\n\n*TOTAL: ${total}$*`;
        msg += `\n*Pagamento:* ${paymentMethod}`;
        if (paymentMethod === 'USDT') msg += ` (Crypto)`;
        
        setTimeout(() => {
            setIsSubmitting(false);
            setCartItems([]);
            setSelectedZone(null);
            
            const url = `https://wa.me/2385999204?text=${encodeURIComponent(msg)}`;
            // Use location href on mobile to ensure redirect
            if (/Android|iPhone/i.test(navigator.userAgent)) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
        }, 2000);
    };

    const handleMenuClick = (menu: 'PIZZAS' | 'BEBIDAS' | 'ZONAS') => {
        setSelectedMenu(menu);
        if (menu === 'PIZZAS') setSelectedSize('FAMILIAR');
        if (menu === 'BEBIDAS') setSelectedSize('UN');
        
        // Smooth scroll and focus
        setTimeout(() => {
            if (contentRef.current) {
                // Calculate offset based on sticky nav height dynamically
                const nav = document.querySelector('nav');
                const navHeight = nav ? nav.offsetHeight : 60;
                const headerOffset = navHeight + 10; // Height + slight padding
                
                const elementPosition = contentRef.current.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }, 100);
    };

    const handleSecretClick = () => {
        const newClicks = secretClicks + 1;
        setSecretClicks(newClicks);
        if (newClicks >= 5) {
            setIsAdminOpen(true);
            setSecretClicks(0);
        }
    };

    const updateOrderStatus = (id: string, status: OrderStatus) => {
        const updatedOrders = orderHistory.map(o => o.id === id ? { ...o, status } : o);
        setOrderHistory(updatedOrders);
        localStorage.setItem('kantinho_orders', JSON.stringify(updatedOrders));
    };

    const reorder = (order: Order) => {
        if (cartItems.length > 0) {
            if (!window.confirm('Seu carrinho não está vazio. Deseja substituir o carrinho atual pelos itens deste pedido?')) return;
        }
        
        // Deep copy items to avoid reference issues
        const newItems = order.items.map(i => ({ ...i })); 
        setCartItems(newItems);
        
        showNotification('Itens adicionados ao carrinho!', 'success');
        setIsHistoryOpen(false);
        setIsCartOpen(true);
    };

    // User Profile Update
    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        showNotification("Perfil atualizado com sucesso!", 'success');
    };

    const handleTempQuantity = (delta: number) => {
        setTempItemConfig(prev => ({
            ...prev,
            quantity: Math.max(1, prev.quantity + delta)
        }));
    };

    const handleTempExtra = (extra: Extra) => {
        setTempItemConfig(prev => {
            const exists = prev.extras.some(e => e.name === extra.name);
            let newExtras;
            if (exists) newExtras = prev.extras.filter(e => e.name !== extra.name);
            else newExtras = [...prev.extras, extra];
            return { ...prev, extras: newExtras };
        });
    };

    const handleZoneSelection = (zone: DeliveryZone) => {
        setSelectedZone(zone);
        setZoneAnimationTrigger(true);
        setTimeout(() => setZoneAnimationTrigger(false), 500);
    };

    const openCommentModal = (item: MenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setCommentTargetItem(item);
        setTempComment('');
        setTempRating(5);
        setIsCommentModalOpen(true);
    };

    const handleItemClick = (index: number, item: MenuItem) => {
        if (isHalfAndHalfMode && selectedMenu === 'PIZZAS') {
             if (!selectedHalfPizzas.left) addHalfPizza(item, 'left');
             else if (!selectedHalfPizzas.right) addHalfPizza(item, 'right');
             return;
        }

        if (expandedItemIndex === index) {
            setExpandedItemIndex(null);
        } else {
            setExpandedItemIndex(index);
            setTempItemConfig({ quantity: 1, extras: [] });
        }
    };

    const addHalfPizza = (pizza: MenuItem, side: 'left' | 'right') => {
        setSelectedHalfPizzas(prev => ({ ...prev, [side]: pizza }));
        showNotification(`${pizza.name} selecionada para o lado ${side === 'left' ? 'Esquerdo' : 'Direito'}`);
    };

    const toggleBox = (index: number) => {
        setCartItems(prev => {
            const updated = [...prev];
            updated[index].pizzaBox = !updated[index].pizzaBox;
            return updated;
        });
    };

    const removeItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const handlePrint = () => {
        if (cartItems.length === 0) return;
        const win = window.open('', '_blank', 'width=400,height=600');
        if (!win) {
            showNotification("Habilite popups para imprimir", "error");
            return;
        }

        const html = `
            <html>
            <head>
                <style>
                    body { font-family: monospace; font-size: 12px; width: 58mm; margin: 0 auto; }
                    .center { text-align: center; }
                    .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                    .flex { display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>
                <div class="center">
                    <h3>🎅 KANTINHO DELICIA 🎄</h3>
                    <p>Tel: 2616090 / 5999204</p>
                    <p>${new Date().toLocaleString()}</p>
                </div>
                <div class="line"></div>
                ${cartItems.map(item => `
                    <div>
                        ${item.quantity}x ${item.name} (${item.size})<br/>
                        Preço: ${item.prices[item.size]}$
                        ${item.selectedExtras?.length ? `<br/>+ ${item.selectedExtras.map(e => e.name).join(', ')}` : ''}
                        ${item.pizzaBox ? '<br/>+ Caixa (100$)' : ''}
                    </div>
                `).join('<div class="line"></div>')}
                <div class="line"></div>
                <div class="flex"><span>Subtotal:</span><span>${cartItems.reduce((acc, item) => acc + ((item.prices[item.size] || 0) + (item.selectedExtras?.reduce((s,e)=>s+e.price,0)||0)) * item.quantity, 0)}$</span></div>
                <div class="flex"><span>Caixas:</span><span>${cartItems.reduce((acc, item) => item.pizzaBox ? acc + (100 * item.quantity) : acc, 0)}$</span></div>
                <div class="flex"><span>Entrega:</span><span>${selectedZone?.price || 0}$</span></div>
                <div class="flex"><span>Pagamento:</span><span>${paymentMethod}</span></div>
                <div class="line"></div>
                <div class="flex" style="font-weight:bold; font-size: 14px;">
                    <span>TOTAL:</span><span>${calculateTotal()}$</span>
                </div>
                <div class="center" style="margin-top:20px;">
                    Feliz Natal! 🎅
                </div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `;
        win.document.write(html);
        win.document.close();
    };

    const filteredPizzaMenu = useMemo(() => {
        if (activeCategory === 'TODAS') return pizzaList;
        return pizzaList.filter(item => item.category === activeCategory);
    }, [activeCategory, pizzaList]);

    const totals = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => {
            const base = (item.prices[item.size] || 0);
            const extras = (item.selectedExtras || []).reduce((s, e) => s + e.price, 0);
            return sum + (base + extras) * item.quantity;
        }, 0);

        const boxes = cartItems.reduce((sum, item) => {
            if (item.pizzaBox || item.isHalfAndHalf) { 
                if (item.pizzaBox) return sum + (100 * item.quantity);
            }
            return sum;
        }, 0);

        const delivery = selectedZone ? selectedZone.price : 0;

        return { subtotal, boxes, delivery, total: subtotal + boxes + delivery };
    }, [cartItems, selectedZone]);

    const groupedCart = useMemo(() => {
        const pizzas = cartItems.filter(item => item.pizzaBox || item.isHalfAndHalf || pizzaList.some(p => p.name === item.name));
        const drinks = cartItems.filter(item => !pizzas.includes(item));
        return { pizzas, drinks };
    }, [cartItems, pizzaList]);

    const handleInitialSubmit = () => {
        if (cartItems.length === 0) return;
        setIsOrderConfirmationOpen(true);
    };

    const confirmAndSendWhatsApp = () => {
        setIsOrderConfirmationOpen(false);
        setIsSubmitting(true);

        let msg = `*🎅 Pedido Natalino Kantinho Delícia 🎄*\n`;
        msg += `--------------------------------\n`;
        msg += `👤 Cliente: ${user?.nome}\n📞 Tel: ${user?.telefone}\n`;
        msg += `📅 Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
        msg += `--------------------------------\n\n`;
        
        const printItems = (items: CartItem[]) => {
            items.forEach(item => {
                const price = item.prices[item.size];
                const itemTotal = (price || 0) * item.quantity;
                msg += `*${item.quantity}x ${item.name} (${item.size})* - ${itemTotal}$\n`;
                if (item.selectedExtras?.length) {
                    msg += `  Extras: ${item.selectedExtras.map(e => e.name).join(', ')}\n`;
                }
                if (item.pizzaBox) msg += `  Caixa: 100$\n`;
                msg += `\n`;
            });
        };

        if (groupedCart.pizzas.length > 0) {
            msg += `🍕 *PIZZAS*\n`;
            printItems(groupedCart.pizzas);
        }
        if (groupedCart.drinks.length > 0) {
            msg += `🥤 *BEBIDAS*\n`;
            printItems(groupedCart.drinks);
        }

        msg += `--------------------------------\n`;
        msg += `💰 Subtotal: ${totals.subtotal}$\n`;
        msg += `📦 Caixas: ${totals.boxes}$\n`;
        if (selectedZone) msg += `🛵 Entrega (${selectedZone.name}): ${totals.delivery || 'GRÁTIS'}\n`;
        msg += `💳 Pagamento: *${paymentMethod}*\n`;
        msg += `--------------------------------\n`;
        msg += `*TOTAL: ${totals.total}$*`;
        msg += `\n\n🎄 Feliz Natal! 🎅`;

        setTimeout(() => {
            // Save to history using the helper logic inside finalizeOrder originally, but adapted here
            const newOrder: Order = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                items: [...cartItems],
                total: totals.total,
                paymentMethod: paymentMethod,
                deliveryZone: selectedZone?.name,
                status: 'RECEBIDO',
                customerName: user?.nome,
                customerPhone: user?.telefone
            };
            
            const updatedHistory = [...orderHistory, newOrder];
            setOrderHistory(updatedHistory);
            localStorage.setItem('kantinho_orders', JSON.stringify(updatedHistory));

            const url = `https://wa.me/2385999204?text=${encodeURIComponent(msg)}`;
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
            setCartItems([]);
            setIsCartOpen(false);
            setIsSubmitting(false);
            showNotification("Pedido enviado com sucesso!", "success");
        }, 2000);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><i className="fas fa-snowflake animate-spin text-4xl text-xmas-gold"></i></div>;
    if (!user) return <LoginModal onLogin={setUser} />;

    const CartSection = ({ title, items, startIndex }: { title: string, items: CartItem[], startIndex: number }) => (
        <div className="mb-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-2 px-1 tracking-wider border-b border-gray-700 pb-1">{title}</h3>
            <div className="space-y-2">
                {items.map((item, localIdx) => {
                    // Find correct index in main cart array
                    // This logic relies on object identity which works for now
                    const idx = cartItems.indexOf(item); 
                    const itemTotal = ((item.prices[item.size] || 0) + (item.selectedExtras?.reduce((a,b)=>a+b.price,0) || 0)) * item.quantity;
                    const isExpanded = expandedCartItemIndex === idx;
                    const isNewOrModified = lastAddedIndex === idx;
                    
                    return (
                        <div key={idx} className={`bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 overflow-hidden ${isNewOrModified ? 'animate-pulse-highlight ring-1 ring-pizza-yellow' : ''}`}>
                            <div className="p-3 flex justify-between items-center cursor-pointer" onClick={() => setExpandedCartItemIndex(isExpanded ? null : idx)}>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-white flex items-center gap-2 text-sm">
                                            <span className="bg-gray-700 w-6 h-6 rounded flex items-center justify-center text-xs">{item.quantity}</span>
                                            {item.name}
                                        </div>
                                        <div className="text-sm font-bold text-gray-300">{itemTotal}$</div>
                                    </div>
                                    {!isExpanded && item.selectedExtras && item.selectedExtras.length > 0 && (
                                        <div className="text-[10px] text-gray-400 mt-1 pl-8 truncate">
                                            + {item.selectedExtras.map(e => e.name).join(', ')}
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3 text-gray-500">
                                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="bg-gray-900/50 p-3 border-t border-gray-700 animate-fade-in">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs text-gray-400">Tamanho: {item.size}</span>
                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                                            <i className="fas fa-trash-alt"></i> Remover
                                        </button>
                                    </div>
                                    
                                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Extras</p>
                                            <div className="flex flex-wrap gap-1">
                                                {item.selectedExtras.map((e, i) => (
                                                    <span key={i} className="text-xs bg-gray-800 text-yellow-500 px-2 py-0.5 rounded border border-gray-700">
                                                        {e.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center bg-gray-800 rounded border border-gray-700">
                                            <button onClick={() => updateQuantity(idx, -1)} className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l">-</button>
                                            <span className="px-2 font-bold text-sm min-w-[30px] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-r">+</button>
                                        </div>
                                        {item.pizzaBox && (
                                            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                                                <input type="checkbox" checked onChange={() => toggleBox(idx)} className="accent-pizza-red w-4 h-4" />
                                                Caixa (+100$)
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans relative overflow-x-hidden">
            <SnowEffect />
            
            {/* Header */}
            <header className="relative bg-gray-900 border-b border-gray-800 shadow-xl z-40">
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    <img 
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop" 
                        alt="Pizza Header" 
                        className="w-full h-full object-cover transition-transform duration-500 ease-out"
                        style={{ transform: `scale(${headerZoom})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-900"></div>
                </div>

                <div className="relative z-10 p-4 text-center">
                    <button 
                        onClick={() => setHeaderZoom(prev => prev === 1 ? 1.2 : 1)}
                        className="absolute top-4 right-4 bg-gray-800/50 p-2 rounded-full text-white hover:bg-gray-700 transition"
                        title="Zoom Imagem"
                    >
                        <i className={`fas fa-${headerZoom === 1 ? 'search-plus' : 'search-minus'}`}></i>
                    </button>

                    <h1 
                        onClick={handleSecretClick}
                        className="text-4xl md:text-6xl font-bold text-pizza-red font-christmas tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] cursor-pointer select-none relative inline-block hover:scale-105 transition-transform"
                    >
                        <span className="absolute -top-6 -left-6 text-5xl transform -rotate-12 filter drop-shadow-lg">🎅</span>
                        Kantinho Delícia
                    </h1>
                    
                    <div className="flex items-center justify-center space-x-4 mb-2 mt-2">
                        <button onClick={() => setIsProfileOpen(true)} className="text-white text-lg hover:text-xmas-gold transition flex items-center gap-2">
                            <i className="fas fa-user-circle"></i>
                            <span>Olá, <span className="font-bold text-xmas-gold">{user.nome}</span>!</span>
                        </button>
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                         <button onClick={() => setIsAboutOpen(true)} className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition shadow-lg border border-white/20"><i className="fas fa-info-circle text-white"></i></button>
                         <button onClick={() => setIsGameOpen(true)} className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition shadow-lg border border-white/20"><i className="fas fa-gamepad text-white"></i></button>
                         <button onClick={() => setIsFavoritesOpen(true)} className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition shadow-lg border border-white/20"><i className="fas fa-heart text-white"></i></button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur shadow-md border-b border-gray-800 py-3">
                <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto px-4 no-scrollbar">
                    {['PIZZAS', 'BEBIDAS', 'ZONAS'].map(menu => (
                        <button
                            key={menu}
                            onClick={() => handleMenuClick(menu as any)}
                            className={`px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all duration-300 transform border whitespace-nowrap ${
                                selectedMenu === menu 
                                ? 'bg-gradient-to-r from-pizza-red to-red-600 text-white border-xmas-gold scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {menu === 'PIZZAS' && '🍕 '}
                            {menu === 'BEBIDAS' && '🥤 '}
                            {menu === 'ZONAS' && '📍 '}
                            {menu}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main ref={contentRef} className="p-4 max-w-6xl mx-auto pb-24 min-h-[60vh]">
                
                {/* Filters for Pizzas */}
                {selectedMenu === 'PIZZAS' && (
                    <div className="flex justify-center gap-2 mb-6 flex-wrap animate-fade-in-section">
                        <button 
                            onClick={() => setActiveCategory('TODAS')}
                            className={`px-3 py-1 rounded text-xs font-bold border transition ${activeCategory === 'TODAS' ? 'bg-xmas-green text-white border-green-400' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                        >
                            TODAS
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1 rounded text-xs font-bold border transition ${activeCategory === cat ? 'bg-xmas-green text-white border-green-400' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
                
                {selectedMenu === 'PIZZAS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-section">
                        {/* Half & Half Builder Card */}
                        <div className={`p-4 rounded-xl border-2 border-dashed border-gray-600 hover:border-xmas-gold transition bg-gray-800/50 flex flex-col items-center justify-center text-center cursor-pointer ${isHalfAndHalfMode ? 'ring-2 ring-xmas-gold bg-gray-800' : ''}`}
                             onClick={() => setIsHalfAndHalfMode(!isHalfAndHalfMode)}
                        >
                            <div className="text-4xl mb-2">🌓</div>
                            <h3 className="font-bold text-xmas-gold">Pizza Meio a Meio</h3>
                            <p className="text-xs text-gray-400">Clique para montar</p>
                            {isHalfAndHalfMode && (
                                <div className="mt-4 w-full">
                                    <div className={`p-2 rounded mb-2 ${selectedHalfPizzas.left ? 'bg-green-900/50 text-green-200' : 'bg-gray-700 text-gray-400'}`}>
                                        {selectedHalfPizzas.left ? selectedHalfPizzas.left.name : 'Selecione Lado Esquerdo'}
                                    </div>
                                    <div className={`p-2 rounded mb-2 ${selectedHalfPizzas.right ? 'bg-green-900/50 text-green-200' : 'bg-gray-700 text-gray-400'}`}>
                                        {selectedHalfPizzas.right ? selectedHalfPizzas.right.name : 'Selecione Lado Direito'}
                                    </div>
                                    
                                    {!isHalfAndHalfConfiguring ? (
                                        <button 
                                            onClick={prepareHalfAndHalf}
                                            disabled={!selectedHalfPizzas.left || !selectedHalfPizzas.right}
                                            className="w-full bg-pizza-red disabled:opacity-50 text-white font-bold py-2 rounded mt-2"
                                        >
                                            Adicionar
                                        </button>
                                    ) : (
                                        <div className="mt-3 pt-3 border-t border-gray-700 animate-fade-in-section text-left">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-gray-400">Quantidade:</span>
                                                <div className="flex items-center bg-gray-700 rounded-lg">
                                                    <button onClick={(e) => { e.stopPropagation(); handleTempQuantity(-1); }} className="px-3 py-1 text-white hover:bg-gray-600 rounded-l">-</button>
                                                    <span className="px-3 font-bold">{tempItemConfig.quantity}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleTempQuantity(1); }} className="px-3 py-1 text-white hover:bg-gray-600 rounded-r">+</button>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Extras:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {extrasList.map(extra => {
                                                        const isSelected = tempItemConfig.extras.some(e => e.name === extra.name);
                                                        return (
                                                            <button 
                                                                key={extra.name}
                                                                onClick={(e) => { e.stopPropagation(); handleTempExtra(extra); }}
                                                                className={`px-2 py-1 rounded text-xs border transition-all duration-200 ${isSelected ? 'bg-green-600 border-green-500 text-white ring-2 ring-green-400/30' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                                                            >
                                                                {extra.name} (+{extra.price}$)
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={(e) => {
                                                    triggerFlyInAnimation(e.clientX, e.clientY);
                                                    addExpandedItemToCart(getHalfAndHalfItem());
                                                    setIsHalfAndHalfMode(false);
                                                    setSelectedHalfPizzas({ left: null, right: null });
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg flex justify-between px-6"
                                            >
                                                <span>Adicionar ao Pedido</span>
                                                <span>{((currentHalfAndHalfPrice || 0) + tempItemConfig.extras.reduce((a,b)=>a+b.price,0)) * tempItemConfig.quantity}$</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setIsHalfAndHalfConfiguring(false); }}
                                                className="w-full bg-gray-700 text-white text-xs py-2 rounded mt-2"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pizza Items */}
                        {pizzaList.filter(p => activeCategory === 'TODAS' || p.category === activeCategory).map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleItemClick(idx, item)}
                                className={`relative bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-xmas-gold transition-all duration-300 transform hover:-translate-y-1 ${isHalfAndHalfMode ? 'cursor-pointer ring-1 ring-gray-600 hover:ring-xmas-gold' : ''}`}
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white font-crimson-text">{item.name}</h3>
                                        <button onClick={(e) => toggleFavorite(item.name, e)} className="text-gray-500 hover:text-red-500 transition">
                                            <i className={`fas fa-heart ${favorites.includes(item.name) ? 'text-red-500' : ''}`}></i>
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 h-10 line-clamp-2">{item.desc}</p>
                                    
                                    {/* Action Area */}
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="text-xmas-gold font-bold text-lg">
                                            {getItemPrice(item, selectedSize)}$
                                        </div>
                                        
                                        {isHalfAndHalfMode ? (
                                            <div className="text-gray-400 text-xs flex items-center gap-1 animate-pulse">
                                                <i className="far fa-hand-pointer"></i> Toque para selecionar
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={(e) => openCommentModal(item, e)} className="p-2 text-gray-400 hover:text-white"><i className="far fa-comment"></i></button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (expandedItemIndex === idx) setExpandedItemIndex(null);
                                                        else {
                                                            setExpandedItemIndex(idx);
                                                            setTempItemConfig({ quantity: 1, extras: [] });
                                                        }
                                                    }}
                                                    className="bg-pizza-red hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg transition active:scale-95"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expansion Panel */}
                                    {expandedItemIndex === idx && !isHalfAndHalfMode && (
                                        <div className="mt-4 pt-4 border-t border-gray-700 animate-fade-in-section" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-gray-400">Quantidade:</span>
                                                <div className="flex items-center bg-gray-700 rounded-lg">
                                                    <button onClick={() => setTempItemConfig(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))} className="px-3 py-1 text-white hover:bg-gray-600 rounded-l">-</button>
                                                    <span className="px-3 font-bold">{tempItemConfig.quantity}</span>
                                                    <button onClick={() => setTempItemConfig(prev => ({...prev, quantity: prev.quantity + 1}))} className="px-3 py-1 text-white hover:bg-gray-600 rounded-r">+</button>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Extras:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {extrasList.map(extra => {
                                                        const isSelected = tempItemConfig.extras.some(e => e.name === extra.name);
                                                        return (
                                                            <button 
                                                                key={extra.name}
                                                                onClick={() => {
                                                                    setTempItemConfig(prev => ({
                                                                        ...prev,
                                                                        extras: isSelected 
                                                                            ? prev.extras.filter(e => e.name !== extra.name)
                                                                            : [...prev.extras, extra]
                                                                    }));
                                                                }}
                                                                className={`px-2 py-1 rounded text-xs border transition-all duration-200 ${isSelected ? 'bg-green-600 border-green-500 text-white ring-2 ring-green-400/30' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                                                            >
                                                                {extra.name} (+{extra.price}$)
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={(e) => {
                                                    triggerFlyInAnimation(e.clientX, e.clientY);
                                                    addExpandedItemToCart(item);
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg flex justify-between px-6"
                                            >
                                                <span>Adicionar ao Pedido</span>
                                                <span>{(getItemPrice(item, selectedSize) + tempItemConfig.extras.reduce((a,b)=>a+b.price,0)) * tempItemConfig.quantity}$</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedMenu === 'BEBIDAS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-section">
                        {drinkList.map((item, idx) => (
                             <div key={idx} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-xmas-gold transition-all">
                                <div className="p-5 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                                        <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                                        <div className="text-xmas-gold font-bold">{item.prices.UN}$</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                         <button onClick={(e) => openCommentModal(item, e)} className="text-gray-400 hover:text-white text-right"><i className="far fa-comment"></i></button>
                                         <button 
                                            onClick={(e) => addToCart(item, 'UN', e)}
                                            className="bg-pizza-red w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition active:scale-95"
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                )}

                {selectedMenu === 'ZONAS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-section">
                        {zoneList.map((zone, idx) => (
                            <div 
                                key={idx}
                                onClick={() => {
                                    setSelectedZone(zone);
                                    setZoneAnimationTrigger(true);
                                    setTimeout(() => setZoneAnimationTrigger(false), 500);
                                }}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedZone?.name === zone.name ? 'bg-green-900/40 border-green-500 animate-zoom-in' : 'bg-gray-800 border-gray-700 hover:border-gray-500'} ${zone.price === 0 ? 'border-green-500/50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white">{zone.name}</h3>
                                    {selectedZone?.name === zone.name && <i className="fas fa-check-circle text-green-500"></i>}
                                </div>
                                <div className="mt-2 flex justify-between text-sm text-gray-400">
                                    <span><i className="fas fa-clock mr-1"></i> {zone.time}</span>
                                    <span className={zone.price === 0 ? "text-green-400 font-bold" : "text-xmas-gold font-bold"}>
                                        {zone.price === 0 ? 'GRÁTIS' : `${zone.price}$`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Flying Items Animation Layer */}
            {flyingItems.map(item => (
                <div
                    key={item.id}
                    className="fixed z-50 text-pizza-red text-2xl pointer-events-none"
                    style={{
                        left: item.x,
                        top: item.y,
                        transition: 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)',
                        transform: `translate(${item.destX - item.x}px, ${item.destY - item.y}px) scale(0.2)`,
                        opacity: 0
                    }}
                >
                    <i className="fas fa-pizza-slice"></i>
                </div>
            ))}

            {/* Floating Cart Button */}
            <button 
                ref={cartButtonRef}
                onClick={() => setIsCartOpen(true)}
                className={`fixed bottom-6 right-6 bg-gradient-to-r from-pizza-red to-red-600 text-white p-4 rounded-full shadow-2xl z-40 flex items-center gap-2 transition-transform duration-300 border-2 border-white/20 ${cartBump ? 'scale-125 bg-xmas-gold' : 'hover:scale-105'} ${zoneAnimationTrigger ? 'animate-bounce-short' : ''}`}
            >
                <i className="fas fa-shopping-cart text-xl"></i>
                {cartItems.length > 0 && (
                    <span className="bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs absolute -top-2 -right-2 shadow-md animate-bounce">
                        {cartItems.reduce((a,b) => a + b.quantity, 0)}
                    </span>
                )}
            </button>

            {/* Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex justify-end">
                    <div className="w-full max-w-md bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-800 transform transition-transform duration-300 animate-fade-in-section">
                        {/* Cart Header */}
                        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-shopping-bag text-xmas-gold"></i> Seu Pedido
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={() => setIsClearCartModalOpen(true)} className="text-red-400 hover:text-red-300 p-2" title="Limpar Carrinho">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white p-2">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cartItems.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    <i className="fas fa-pizza-slice text-6xl mb-4 opacity-20"></i>
                                    <p>Seu carrinho está vazio.</p>
                                </div>
                            ) : (
                                <div>
                                    {groupedCart.pizzas.length > 0 && <CartSection title="Pizzas" items={groupedCart.pizzas} startIndex={0} />}
                                    {groupedCart.drinks.length > 0 && <CartSection title="Bebidas" items={groupedCart.drinks} startIndex={groupedCart.pizzas.length} />}
                                </div>
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cartItems.length > 0 && (
                            <div className="bg-gray-800 border-t border-gray-700 p-4">
                                {/* Delivery Zone Selection if not set */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Zona de Entrega</label>
                                    <select 
                                        value={selectedZone?.name || ''} 
                                        onChange={(e) => setSelectedZone(zoneList.find(z => z.name === e.target.value) || null)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm focus:border-xmas-gold outline-none"
                                    >
                                        <option value="">Selecione para calcular entrega...</option>
                                        {zoneList.map(z => (
                                            <option key={z.name} value={z.name}>
                                                {z.name} ({z.price === 0 ? 'GRÁTIS' : `${z.price}$`})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Payment Method */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Pagamento</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['DINHEIRO', 'CARTAO', 'USDT'] as PaymentMethod[]).map(pm => (
                                            <button
                                                key={pm}
                                                onClick={() => setPaymentMethod(pm)}
                                                className={`py-2 px-3 rounded text-xs font-bold border transition ${paymentMethod === pm ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-900 text-gray-400 border-gray-700'}`}
                                            >
                                                {pm === 'CARTAO' && <i className="fas fa-credit-card mr-1"></i>}
                                                {pm === 'DINHEIRO' && <i className="fas fa-money-bill mr-1"></i>}
                                                {pm === 'USDT' && <i className="fas fa-coins mr-1"></i>}
                                                {pm}
                                            </button>
                                        ))}
                                    </div>
                                    {paymentMethod === 'USDT' && (
                                        <div className="mt-2 bg-gray-900 p-2 rounded text-[10px] text-gray-400 border border-gray-700 font-mono">
                                            <div className="mb-1 cursor-pointer hover:text-white" onClick={() => {navigator.clipboard.writeText('TBpLLwNfzeTjVkmM9fhYr6smSSoJmVgP4W'); showNotification('TRC20 Copiado!');}}>
                                                <span className="text-green-500 font-bold">TRC20:</span> TBpLLwNfzeTjVkmM9fhYr6smSSoJmVgP4W <i className="fas fa-copy"></i>
                                            </div>
                                            <div className="cursor-pointer hover:text-white" onClick={() => {navigator.clipboard.writeText('0xefd88608923edf8e44518e4027811926b1ea306d'); showNotification('BEP20 Copiado!');}}>
                                                <span className="text-yellow-500 font-bold">BEP20:</span> 0xefd88608923edf8e44518e4027811926b1ea306d <i className="fas fa-copy"></i>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="space-y-1 text-sm text-gray-400 mb-4 border-t border-gray-700 pt-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>{cartItems.reduce((acc, item) => acc + ((item.prices[item.size] || 0) + (item.selectedExtras?.reduce((s,e)=>s+e.price,0)||0)) * item.quantity, 0)}$</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Caixas</span>
                                        <span>{cartItems.reduce((acc, item) => item.pizzaBox ? acc + (100 * item.quantity) : acc, 0)}$</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Entrega</span>
                                        <span className={selectedZone?.price === 0 ? 'text-green-400 font-bold' : ''}>
                                            {selectedZone?.price === 0 ? 'GRÁTIS' : `${selectedZone?.price || 0}$`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-white pt-2 mt-2 border-t border-gray-700">
                                        <span>Total</span>
                                        <span className="text-xmas-gold">{calculateTotal()}$</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsOrderConfirmationOpen(true)}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 animate-pulse-highlight"
                                >
                                    <span>Fazer Pedido</span>
                                    <i className="fab fa-whatsapp text-xl"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            {isAdminOpen && <AdminPanel 
                onClose={() => setIsAdminOpen(false)} 
                orders={orderHistory} 
                pizzas={pizzaList} setPizzas={setPizzaList}
                drinks={drinkList} setDrinks={setDrinkList}
                zones={zoneList} setZones={setZoneList}
                extras={extrasList} setExtras={setExtrasList}
                categories={categories} setCategories={setCategories}
                updateOrderStatus={updateOrderStatus}
                comments={comments}
            />}
            {isGameOpen && <SnakeGame onClose={() => setIsGameOpen(false)} />}
            
            {/* User Profile Modal */}
            {isProfileOpen && user && (
                <UserProfileModal 
                    user={user}
                    orders={orderHistory}
                    favorites={favorites}
                    onClose={() => setIsProfileOpen(false)}
                    onUpdateUser={handleUserUpdate}
                    onOpenHistory={() => { setIsProfileOpen(false); setIsHistoryOpen(true); }}
                />
            )}

            {/* Comment Modal */}
            {isCommentModalOpen && commentTargetItem && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-600">
                        <h3 className="text-xl font-bold mb-4">Avaliar {commentTargetItem.name}</h3>
                        <div className="flex justify-center mb-4 space-x-2">
                            {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setTempRating(star)} className="focus:outline-none transition transform hover:scale-110">
                                    <i className={`fas fa-star text-2xl ${star <= tempRating ? 'text-yellow-400' : 'text-gray-600'}`}></i>
                                </button>
                            ))}
                        </div>
                        <textarea 
                            className="w-full bg-gray-900 text-white rounded p-3 border border-gray-600 mb-4 h-24 resize-none focus:border-blue-500 outline-none"
                            placeholder="Escreva seu comentário..."
                            value={tempComment}
                            onChange={(e) => setTempComment(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsCommentModalOpen(false)} className="flex-1 bg-gray-700 py-2 rounded">Cancelar</button>
                            <button onClick={handleSaveComment} className="flex-1 bg-blue-600 py-2 rounded font-bold">Enviar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Cart Confirmation Modal */}
            {isClearCartModalOpen && (
                 <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-600 text-center">
                        <i className="fas fa-trash-alt text-4xl text-red-500 mb-4"></i>
                        <h3 className="text-xl font-bold mb-2">Esvaziar Carrinho?</h3>
                        <p className="text-gray-400 mb-6">Tem certeza que deseja remover todos os itens?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsClearCartModalOpen(false)} className="flex-1 bg-gray-700 py-2 rounded">Não</button>
                            <button onClick={handleClearCart} className="flex-1 bg-red-600 py-2 rounded font-bold">Sim, Esvaziar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Confirmation Modal */}
            {isOrderConfirmationOpen && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4">
                    <div className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-600 flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-700 text-center">
                            <h2 className="text-2xl font-bold text-xmas-gold font-christmas tracking-widest">Confirmação</h2>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <h3 className="font-bold text-gray-400 text-xs uppercase mb-2">Itens do Pedido</h3>
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm mb-1">
                                            <span>{item.quantity}x {item.name} ({item.size})</span>
                                            <span className="font-bold text-gray-400">{getItemPrice(item, item.size) * item.quantity}$</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <h3 className="font-bold text-gray-400 text-xs uppercase mb-2">Entrega e Pagamento</h3>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Zona:</span>
                                        <span className="text-white">{selectedZone?.name || 'Não selecionada'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Pagamento:</span>
                                        <span className="text-white">{paymentMethod}</span>
                                    </div>
                                </div>
                                <div className="text-center py-4">
                                    <p className="text-gray-400 text-sm">Total a Pagar</p>
                                    <p className="text-4xl font-bold text-xmas-gold">{calculateTotal()}$</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700 flex gap-3">
                            <button onClick={() => setIsOrderConfirmationOpen(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold hover:bg-gray-600">Voltar</button>
                            <button onClick={confirmAndSendWhatsApp} className="flex-1 py-3 bg-green-600 rounded-xl font-bold hover:bg-green-500 shadow-lg animate-pulse-highlight">Confirmar Pedido</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-green-900 z-[100] flex flex-col items-center justify-center text-white">
                    <i className="fas fa-check-circle text-6xl mb-4 animate-bounce"></i>
                    <h2 className="text-3xl font-bold mb-2">Pedido Confirmado!</h2>
                    <p className="text-green-200">Preparando mensagem para WhatsApp...</p>
                    <div className="mt-8 w-64 bg-green-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-white h-full animate-[width_2s_ease-out_forwards]" style={{width: '0%'}}></div>
                    </div>
                </div>
            )}

            {/* About Modal */}
            {isAboutOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full border border-gray-600">
                        <h2 className="text-2xl font-bold text-pizza-red mb-4">Sobre Nós</h2>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            A Kantinho Delícia traz o sabor autêntico da pizza com um toque especial de Cabo Verde. 
                            Ingredientes frescos, massa artesanal e muito carinho em cada fatia.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-900 p-3 rounded text-center">
                                <i className="fas fa-clock text-blue-400 mb-1"></i>
                                <p className="text-sm font-bold">18:00 - 23:00</p>
                            </div>
                            <div className="bg-gray-900 p-3 rounded text-center">
                                <i className="fas fa-phone text-green-400 mb-1"></i>
                                <p className="text-sm font-bold">2616090</p>
                            </div>
                        </div>
                        <button onClick={() => setIsAboutOpen(false)} className="w-full bg-gray-700 py-2 rounded text-white">Fechar</button>
                    </div>
                </div>
            )}

            {/* Favorites Modal */}
            {isFavoritesOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full border border-gray-600 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-red-500"><i className="fas fa-heart"></i> Favoritos</h2>
                            <button onClick={() => setIsFavoritesOpen(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {favorites.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Você ainda não tem favoritos.</p>
                            ) : favorites.map(favName => {
                                const item = pizzaList.find(p => p.name === favName) || drinkList.find(d => d.name === favName);
                                if (!item) return null;
                                return (
                                    <div key={favName} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                                        <span className="font-bold">{favName}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => addToCart(item, item.prices.FAMILIAR ? 'FAMILIAR' : 'UN')} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Add</button>
                                            <button onClick={(e) => toggleFavorite(favName, e)} className="text-red-400 px-2"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            
            {/* History Modal */}
            {isHistoryOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full border border-gray-600 max-h-[80vh] flex flex-col">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-blue-400"><i className="fas fa-history"></i> Histórico</h2>
                            <button onClick={() => setIsHistoryOpen(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {orderHistory.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Nenhum pedido anterior.</p>
                            ) : orderHistory.slice().reverse().map(order => (
                                <div key={order.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400 text-xs">{new Date(order.date).toLocaleDateString()}</span>
                                        <span className="font-bold text-green-400">{order.total}$</span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-3">{order.items.length} itens • {order.deliveryZone || 'Retirada'}</p>
                                    <button 
                                        onClick={() => reorder(order)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded text-sm font-bold"
                                    >
                                        Pedir Novamente
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 animate-bounce-short ${notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                    <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                    <span className="font-bold">{notification.msg}</span>
                </div>
            )}
        </div>
    );
}

export default App;
