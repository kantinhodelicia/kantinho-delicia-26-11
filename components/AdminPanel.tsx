
import React, { useState, useEffect } from 'react';
import { MenuItem, Order, DeliveryZone, Extra, Size, OrderStatus, ItemComment } from '../types';

interface AdminPanelProps {
    onClose: () => void;
    orders: Order[];
    pizzas: MenuItem[];
    setPizzas: (items: MenuItem[]) => void;
    drinks: MenuItem[];
    setDrinks: (items: MenuItem[]) => void;
    zones: DeliveryZone[];
    setZones: (zones: DeliveryZone[]) => void;
    extras: Extra[];
    setExtras: (extras: Extra[]) => void;
    categories: string[];
    setCategories: (cats: string[]) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    comments: Record<string, ItemComment[]>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onClose, orders, pizzas, setPizzas, drinks, setDrinks, zones, setZones, extras, setExtras, categories, setCategories, updateOrderStatus, comments
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MENU' | 'PEDIDOS' | 'ZONAS'>('DASHBOARD');
    
    // Estados para edição
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<Partial<MenuItem>>({});
    const [editCategory, setEditCategory] = useState<'PIZZAS' | 'BEBIDAS'>('PIZZAS');

    // Extras States
    const [newExtraName, setNewExtraName] = useState('');
    const [newExtraPrice, setNewExtraPrice] = useState('');

    // Categories States
    const [newCategoryName, setNewCategoryName] = useState('');

    // Zones States
    const [newZoneName, setNewZoneName] = useState('');
    const [newZonePrice, setNewZonePrice] = useState('');
    const [newZoneTime, setNewZoneTime] = useState('');
    const [zoneError, setZoneError] = useState('');

    // Filter States
    const [filterPeriod, setFilterPeriod] = useState<'TODOS' | 'HOJE' | 'SEMANA' | 'MES'>('TODOS');
    const [activePizzaFilter, setActivePizzaFilter] = useState<'TODAS' | string>('TODAS');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Confirmation State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: string; index: number } | null>(null);

    // Comments Modal
    const [viewCommentsItem, setViewCommentsItem] = useState<string | null>(null);

    // Validation Regex
    const timeRegex = /^\d+(?:-\d+)?\s*min$/i;

    // Load persisted filter
    useEffect(() => {
        const savedFilter = localStorage.getItem('admin_pizza_filter');
        if (savedFilter && (categories.includes(savedFilter) || savedFilter === 'TODAS')) {
            setActivePizzaFilter(savedFilter);
        }
    }, [categories]);

    // Save filter change
    const handleFilterChange = (filter: string) => {
        setActivePizzaFilter(filter);
        localStorage.setItem('admin_pizza_filter', filter);
    };

    // Login Simples (PIN: 542300)
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '542300') {
            setIsAuthenticated(true);
        } else {
            alert('PIN Incorreto!');
            setPin('');
        }
    };

    // --- Helpers ---
    const handleDeleteItem = (index: number, type: 'PIZZAS' | 'BEBIDAS') => {
        setDeleteModal({ isOpen: true, type, index });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        const { type, index } = deleteModal;
        
        if (type === 'PIZZAS') {
            const newPizzas = [...pizzas];
            newPizzas.splice(index, 1);
            setPizzas(newPizzas);
        } else if (type === 'BEBIDAS') {
            const newDrinks = [...drinks];
            newDrinks.splice(index, 1);
            setDrinks(newDrinks);
        } else if (type === 'EXTRAS') {
            const newExtras = [...extras];
            newExtras.splice(index, 1);
            setExtras(newExtras);
        } else if (type === 'ZONAS') {
            const newZones = [...zones];
            newZones.splice(index, 1);
            setZones(newZones);
        } else if (type === 'CATEGORIAS') {
            const newCats = [...categories];
            newCats.splice(index, 1);
            setCategories(newCats);
        }
        setDeleteModal(null);
    };

    const handleSaveItem = () => {
        if (!editItem.name || !editItem.desc) {
            alert('Preencha nome e descrição');
            return;
        }
        const newItem: MenuItem = {
            name: editItem.name,
            desc: editItem.desc,
            prices: editItem.prices || {},
            category: editItem.category
        };
        if (editCategory === 'PIZZAS') {
            if (!newItem.prices.FAMILIAR) newItem.prices.FAMILIAR = 0;
            setPizzas([...pizzas, newItem]);
        } else {
            if (!newItem.prices.UN) newItem.prices.UN = 0;
            setDrinks([...drinks, newItem]);
        }
        setIsEditing(false);
        setEditItem({});
    };

    // Inline Price Update with Validation and Visuals
    const inputHighlightClass = "transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-gray-800 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)]";

    const updatePizzaPrice = (index: number, size: Size, newVal: string) => {
        const val = parseInt(newVal);
        if (isNaN(val) || val < 0) return; // Prevent negative and empty
        const newPizzas = [...pizzas];
        newPizzas[index].prices = { ...newPizzas[index].prices, [size]: val };
        setPizzas(newPizzas);
    };

    const updateDrinkPrice = (index: number, newVal: string) => {
        const val = parseInt(newVal);
        if (isNaN(val) || val < 0) return;
        const newDrinks = [...drinks];
        newDrinks[index].prices = { ...newDrinks[index].prices, UN: val };
        setDrinks(newDrinks);
    };

    // Categories Logic
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        if (categories.includes(newCategoryName.toUpperCase())) {
            alert('Categoria já existe!');
            return;
        }
        setCategories([...categories, newCategoryName.toUpperCase()]);
        setNewCategoryName('');
    };

    // Extras Logic with Validation
    const handleAddExtra = () => {
        if (!newExtraName || !newExtraPrice) return;
        const price = parseInt(newExtraPrice);
        if (price <= 0) {
            alert("O preço do extra deve ser um número positivo.");
            return;
        }
        setExtras([...extras, { name: newExtraName, price }]);
        setNewExtraName('');
        setNewExtraPrice('');
    };

    const updateExtra = (index: number, field: 'name' | 'price', value: string) => {
        const newExtras = [...extras];
        if (field === 'name') {
            newExtras[index].name = value;
        } else {
            const val = parseInt(value);
            if (val < 0) return;
            newExtras[index].price = isNaN(val) ? 0 : val;
        }
        setExtras(newExtras);
    };

    // Zones Logic with Validation
    const handleAddZone = () => {
        if (!newZoneName || !newZonePrice || !newZoneTime) return;
        
        // Time format validation (e.g., "25-35 min")
        if (!timeRegex.test(newZoneTime)) {
            setZoneError("Formato inválido (ex: 20-30 min)");
            return;
        }
        setZoneError('');

        const price = parseInt(newZonePrice);
        if (price < 0) {
             alert("O preço deve ser positivo.");
             return;
        }

        setZones([...zones, { name: newZoneName, price: price, time: newZoneTime }]);
        setNewZoneName('');
        setNewZonePrice('');
        setNewZoneTime('');
    };

    const updateZone = (index: number, field: keyof DeliveryZone, value: string) => {
        const newZones = [...zones];
        if (field === 'price') {
            const val = parseInt(value);
            if (val < 0) return;
            newZones[index].price = isNaN(val) ? 0 : val;
        }
        else if (field === 'time') {
             newZones[index] = { ...newZones[index], [field]: value };
        }
        else {
             newZones[index] = { ...newZones[index], [field]: value };
        }
        setZones(newZones);
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const d = new Date(order.date);
        const now = new Date();
        
        // Date Filter
        let dateMatch = true;
        if (filterPeriod === 'HOJE') {
            dateMatch = d.toDateString() === now.toDateString();
        } else if (filterPeriod === 'SEMANA') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            dateMatch = d >= oneWeekAgo;
        } else if (filterPeriod === 'MES') {
            dateMatch = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }

        // Search Filter (ID or Customer Name)
        const search = searchTerm.toLowerCase();
        const searchMatch = !searchTerm || 
            order.id.toLowerCase().includes(search) || 
            (order.customerName || '').toLowerCase().includes(search);

        return dateMatch && searchMatch;
    }).reverse();

    const filteredPizzas = activePizzaFilter === 'TODAS' 
        ? pizzas 
        : pizzas.filter(p => p.category === activePizzaFilter);

    // CSV Export
    const handleExportCSV = () => {
        const headers = ["ID", "Data", "Nome Cliente", "Itens", "Total", "Metodo Pagamento", "Zona Entrega"];
        const rows = filteredOrders.map(o => {
            const itemsStr = o.items.map(i => `${i.quantity}x ${i.name} (${i.size})`).join('; ');
            return [
                o.id,
                new Date(o.date).toLocaleString(),
                o.customerName ? `${o.customerName} (${o.customerPhone || ''})` : "Cliente", 
                `"${itemsStr}"`, 
                o.total,
                o.paymentMethod,
                o.deliveryZone || 'Retirada'
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `pedidos_kantinho_${filterPeriod.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Dashboard Stats
    const stats = {
        totalPedidos: orders.length,
        faturamentoTotal: orders.reduce((acc, order) => acc + order.total, 0),
        vendasHoje: orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).reduce((acc, o) => acc + o.total, 0),
        pedidosHoje: orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length,
    };

    const getStatusColor = (status: OrderStatus) => {
        switch(status) {
            case 'RECEBIDO': return 'bg-yellow-600/20 text-yellow-300 border border-yellow-600';
            case 'PREPARO': return 'bg-orange-600 text-white';
            case 'PRONTO': return 'bg-blue-600 text-white';
            case 'ENTREGUE': return 'bg-green-600 text-white';
            case 'CONCLUIDO': return 'bg-green-800 text-green-200';
            default: return 'bg-gray-600 text-gray-200';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-[200] flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm text-center">
                    <div className="mb-6">
                        <i className="fas fa-user-shield text-5xl text-blue-500 mb-2"></i>
                        <h2 className="text-2xl font-bold text-white">Acesso Administrativo</h2>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input 
                            type="password" 
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className={`w-full bg-gray-700 text-white text-center text-2xl tracking-widest p-3 rounded-lg border border-gray-600 focus:outline-none mb-4 ${inputHighlightClass}`}
                            placeholder="PIN"
                            maxLength={6}
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition">
                            Entrar
                        </button>
                        <button onClick={onClose} type="button" className="mt-4 text-gray-400 hover:text-white text-sm">
                            Voltar para Loja
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 z-[200] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <i className="fas fa-cogs text-blue-500"></i> Admin
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Kantinho Delícia</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <i className="fas fa-chart-line w-5"></i> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('PEDIDOS')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'PEDIDOS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <i className="fas fa-receipt w-5"></i> Pedidos
                    </button>
                    <button onClick={() => setActiveTab('MENU')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'MENU' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <i className="fas fa-pizza-slice w-5"></i> Cardápio
                    </button>
                    <button onClick={() => setActiveTab('ZONAS')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'ZONAS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <i className="fas fa-map-marker-alt w-5"></i> Zonas
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={onClose} className="w-full px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition flex items-center justify-center gap-2">
                        <i className="fas fa-sign-out-alt"></i> Sair
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-8">
                
                {activeTab === 'DASHBOARD' && (
                    <div className="animate-fade-in-section">
                        <h2 className="text-3xl font-bold text-white mb-6">Visão Geral</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                                <div className="text-gray-400 text-sm mb-1">Vendas Hoje</div>
                                <div className="text-2xl font-bold text-green-400">{stats.vendasHoje}$</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                                <div className="text-gray-400 text-sm mb-1">Pedidos Hoje</div>
                                <div className="text-2xl font-bold text-blue-400">{stats.pedidosHoje}</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                                <div className="text-gray-400 text-sm mb-1">Faturamento Total</div>
                                <div className="text-2xl font-bold text-yellow-400">{stats.faturamentoTotal}$</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                                <div className="text-gray-400 text-sm mb-1">Total Pedidos</div>
                                <div className="text-2xl font-bold text-purple-400">{stats.totalPedidos}</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'MENU' && (
                    <div className="animate-fade-in-section space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-white">Gerenciar Cardápio</h2>
                            <button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition">
                                <i className="fas fa-plus"></i> Novo Item
                            </button>
                        </div>

                         {/* Categories Management */}
                         <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Categorias de Pizza</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {categories.map((cat, idx) => (
                                    <div key={idx} className="bg-gray-700 px-3 py-1 rounded-full flex items-center gap-2 border border-gray-600">
                                        <span className="text-sm font-bold text-gray-300">{cat}</span>
                                        <button onClick={() => setDeleteModal({ isOpen: true, type: 'CATEGORIAS', index: idx })} className="text-red-400 hover:text-red-300 text-xs">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 max-w-md">
                                <input 
                                    placeholder="Nova Categoria (ex: GOURMET)" 
                                    className={`bg-gray-900 text-white p-2 rounded flex-1 border border-gray-600 ${inputHighlightClass}`}
                                    value={newCategoryName} 
                                    onChange={e => setNewCategoryName(e.target.value)} 
                                />
                                <button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded font-bold">Add</button>
                            </div>
                        </div>

                        {/* Pizzas */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b border-gray-700 pb-2">
                                <h3 className="text-xl font-bold text-blue-400">Pizzas</h3>
                                <div className="flex gap-2 mt-2 md:mt-0 overflow-x-auto pb-1 max-w-full">
                                    <button onClick={() => handleFilterChange('TODAS')} className={`px-3 py-1 rounded text-xs font-bold transition ${activePizzaFilter === 'TODAS' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>TODAS</button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleFilterChange(cat)}
                                            className={`px-3 py-1 rounded text-xs font-bold transition ${activePizzaFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid gap-4">
                                {filteredPizzas.map((pizza) => {
                                    const realIdx = pizzas.indexOf(pizza);
                                    const commentCount = comments[pizza.name]?.length || 0;
                                    return (
                                        <div key={realIdx} className="bg-gray-900 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {pizza.name} 
                                                    <span className="text-[10px] bg-gray-700 px-1.5 rounded text-gray-400 border border-gray-600">{pizza.category}</span>
                                                    {commentCount > 0 && (
                                                        <button 
                                                            onClick={() => setViewCommentsItem(pizza.name)}
                                                            className="text-xs bg-gray-800 text-yellow-500 px-2 py-0.5 rounded border border-gray-700 hover:bg-gray-700 flex items-center gap-1"
                                                        >
                                                            <i className="fas fa-comment"></i> {commentCount}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{pizza.desc}</div>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1"><span className="text-xs text-gray-500 w-12">Fam:</span><input type="number" className={`bg-gray-700 text-white text-xs w-16 p-1 rounded border border-transparent ${inputHighlightClass}`} value={pizza.prices.FAMILIAR || ''} onChange={(e) => updatePizzaPrice(realIdx, 'FAMILIAR', e.target.value)} /></div>
                                                    <div className="flex items-center gap-1"><span className="text-xs text-gray-500 w-12">Med:</span><input type="number" className={`bg-gray-700 text-white text-xs w-16 p-1 rounded border border-transparent ${inputHighlightClass}`} value={pizza.prices.MEDIO || ''} onChange={(e) => updatePizzaPrice(realIdx, 'MEDIO', e.target.value)} /></div>
                                                    <div className="flex items-center gap-1"><span className="text-xs text-gray-500 w-12">Peq:</span><input type="number" className={`bg-gray-700 text-white text-xs w-16 p-1 rounded border border-transparent ${inputHighlightClass}`} value={pizza.prices.PEQ || ''} onChange={(e) => updatePizzaPrice(realIdx, 'PEQ', e.target.value)} /></div>
                                                </div>
                                                <button onClick={() => handleDeleteItem(realIdx, 'PIZZAS')} className="text-red-500 hover:text-red-400 p-2 ml-2 transition hover:scale-110"><i className="fas fa-trash"></i></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bebidas */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-gray-700 pb-2">Bebidas</h3>
                            <div className="grid gap-3">
                                {drinks.map((drink, idx) => (
                                    <div key={idx} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {drink.name}
                                                {comments[drink.name]?.length > 0 && (
                                                    <button 
                                                        onClick={() => setViewCommentsItem(drink.name)}
                                                        className="text-xs bg-gray-800 text-yellow-500 px-2 py-0.5 rounded border border-gray-700 hover:bg-gray-700 flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-comment"></i> {comments[drink.name].length}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">{drink.desc}</div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs text-gray-500">Preço:</span>
                                            <input type="number" className={`bg-gray-700 text-white text-sm w-20 p-1 rounded border border-transparent ${inputHighlightClass}`} value={drink.prices.UN || ''} onChange={(e) => updateDrinkPrice(idx, e.target.value)} />
                                            <button onClick={() => handleDeleteItem(idx, 'BEBIDAS')} className="text-red-500 hover:text-red-400 p-2 transition hover:scale-110"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Extras */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-2">Extras</h3>
                            <div className="grid gap-2 mb-4">
                                {extras.map((extra, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-900 p-2 rounded">
                                        <div className="flex-1 flex items-center gap-2">
                                            <input className={`bg-gray-700 text-white p-1 rounded flex-1 border border-transparent ${inputHighlightClass}`} value={extra.name} onChange={e => updateExtra(idx, 'name', e.target.value)} />
                                            {comments[extra.name]?.length > 0 && (
                                                <button 
                                                    onClick={() => setViewCommentsItem(extra.name)}
                                                    className="text-xs bg-gray-800 text-yellow-500 px-2 py-0.5 rounded border border-gray-700 hover:bg-gray-700 flex items-center gap-1"
                                                >
                                                    <i className="fas fa-comment"></i> {comments[extra.name].length}
                                                </button>
                                            )}
                                        </div>
                                        <input type="number" className={`bg-gray-700 text-white p-1 rounded w-20 border border-transparent ${inputHighlightClass}`} value={extra.price} onChange={e => updateExtra(idx, 'price', e.target.value)} />
                                        <span className="text-gray-500">$</span>
                                        <button onClick={() => setDeleteModal({ isOpen: true, type: 'EXTRAS', index: idx })} className="text-red-500 px-2 transition hover:scale-110"><i className="fas fa-trash"></i></button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input placeholder="Novo Extra" className={`bg-gray-700 text-white p-2 rounded flex-1 border border-transparent ${inputHighlightClass}`} value={newExtraName} onChange={e => setNewExtraName(e.target.value)} />
                                <input type="number" placeholder="Preço" className={`bg-gray-700 text-white p-2 rounded w-24 border border-transparent ${inputHighlightClass}`} value={newExtraPrice} onChange={e => setNewExtraPrice(e.target.value)} />
                                <button onClick={handleAddExtra} className="bg-green-600 text-white px-4 rounded font-bold hover:bg-green-500 transition">Add</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ZONAS' && (
                     <div className="animate-fade-in-section">
                        <h2 className="text-3xl font-bold text-white mb-6">Gerenciar Zonas</h2>
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="grid gap-2 mb-6">
                                {zones.map((zone, idx) => {
                                    const isTimeValid = timeRegex.test(zone.time);
                                    return (
                                        <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-gray-900 p-3 rounded">
                                            <input className={`bg-gray-700 text-white p-2 rounded flex-1 w-full border border-transparent ${inputHighlightClass}`} value={zone.name} onChange={e => updateZone(idx, 'name', e.target.value)} />
                                            <div className="w-full md:w-32 relative group">
                                                <input 
                                                    className={`bg-gray-700 text-white p-2 rounded w-full border ${isTimeValid ? 'border-transparent' : 'border-red-500 ring-1 ring-red-500'} ${inputHighlightClass}`} 
                                                    value={zone.time} 
                                                    onChange={e => updateZone(idx, 'time', e.target.value)} 
                                                />
                                                {!isTimeValid && <span className="absolute -top-6 right-0 text-xs bg-red-600 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition">Inválido</span>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input type="number" className={`bg-gray-700 text-white p-2 rounded w-20 border border-transparent ${inputHighlightClass}`} value={zone.price} onChange={e => updateZone(idx, 'price', e.target.value)} />
                                                <span className="text-gray-500">$</span>
                                            </div>
                                            <button onClick={() => setDeleteModal({ isOpen: true, type: 'ZONAS', index: idx })} className="text-red-500 px-3 transition hover:scale-110"><i className="fas fa-trash"></i></button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 bg-gray-900 p-4 rounded-lg border border-gray-700">
                                <input placeholder="Nome da Zona" className={`bg-gray-700 text-white p-2 rounded flex-1 border border-transparent ${inputHighlightClass}`} value={newZoneName} onChange={e => setNewZoneName(e.target.value)} />
                                <div className="flex-1">
                                    <input placeholder="Tempo (ex: 20-30 min)" className={`w-full bg-gray-700 text-white p-2 rounded border ${zoneError ? 'border-red-500' : 'border-transparent'} ${inputHighlightClass}`} value={newZoneTime} onChange={e => { setNewZoneTime(e.target.value); setZoneError(''); }} />
                                    {zoneError && <p className="text-red-500 text-xs mt-1">{zoneError}</p>}
                                </div>
                                <input type="number" placeholder="Preço" className={`bg-gray-700 text-white p-2 rounded w-24 border border-transparent ${inputHighlightClass}`} value={newZonePrice} onChange={e => setNewZonePrice(e.target.value)} />
                                <button onClick={handleAddZone} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-500 transition">Adicionar Zona</button>
                            </div>
                        </div>
                     </div>
                )}

                {activeTab === 'PEDIDOS' && (
                    <div className="animate-fade-in-section">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-3xl font-bold text-white">Histórico de Pedidos</h2>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="🔍 Buscar ID ou Cliente..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-800 text-white p-2 pl-3 pr-8 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                                <button onClick={handleExportCSV} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-gray-500 flex items-center justify-center gap-2 shadow transition hover:scale-105">
                                    <i className="fas fa-file-csv text-green-400"></i> Exportar CSV
                                </button>
                                <select 
                                    value={filterPeriod} 
                                    onChange={(e) => setFilterPeriod(e.target.value as any)}
                                    className="bg-gray-800 text-white p-2 rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="TODOS">Todos os Períodos</option>
                                    <option value="HOJE">Hoje</option>
                                    <option value="SEMANA">Última Semana</option>
                                    <option value="MES">Este Mês</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredOrders.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado.</p>
                            ) : filteredOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    className={`bg-gray-800 rounded-xl border transition-all cursor-pointer ${
                                        expandedOrderId === order.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-700 hover:border-gray-500'
                                    } ${order.status === 'RECEBIDO' ? 'border-l-4 border-l-yellow-400 bg-gray-800/80 shadow-[inset_0_0_20px_rgba(250,204,21,0.1)]' : ''}`}
                                >
                                    <div className="p-4 flex justify-between items-start" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-blue-400 font-bold">#{order.id.slice(-6)}</span>
                                                <span className="text-gray-500">|</span>
                                                <span className="text-gray-300 font-bold">{order.customerName || 'Cliente'}</span>
                                                <span className="text-gray-500 text-sm">({new Date(order.date).toLocaleString()})</span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                                    order.status === 'RECEBIDO' ? 'border-yellow-500 animate-pulse text-yellow-300' : 'border-transparent'
                                                } ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300"><i className="fas fa-box mr-1"></i>{order.items.length} itens</span>
                                                <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300"><i className="fas fa-credit-card mr-1"></i>{order.paymentMethod}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                             <div className="text-xl font-bold text-green-400">{order.total}$</div>
                                             <i className={`fas fa-chevron-${expandedOrderId === order.id ? 'up' : 'down'} text-gray-500 mt-2`}></i>
                                        </div>
                                    </div>
                                    
                                    {expandedOrderId === order.id && (
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-700 bg-gray-900/50 rounded-b-xl animate-fade-in">
                                            
                                            {/* Status Update Section */}
                                            <div className="mb-4 flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                <span className="text-sm font-bold text-gray-300">Atualizar Status:</span>
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                    className={`p-1 rounded text-sm font-bold border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="RECEBIDO" className="bg-gray-800 text-gray-300">RECEBIDO</option>
                                                    <option value="PREPARO" className="bg-gray-800 text-yellow-300">EM PREPARO</option>
                                                    <option value="PRONTO" className="bg-gray-800 text-blue-300">PRONTO</option>
                                                    <option value="ENTREGUE" className="bg-gray-800 text-green-300">ENTREGUE</option>
                                                    <option value="CONCLUIDO" className="bg-gray-800 text-green-500">CONCLUÍDO</option>
                                                </select>
                                            </div>

                                            <div className="grid gap-2 text-sm text-gray-300">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-start bg-gray-800/50 p-3 rounded border border-gray-700/50 hover:bg-gray-700/50 transition">
                                                        <div>
                                                            <div className="font-bold text-white flex items-center gap-2">
                                                                <span className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">{item.quantity}</span> 
                                                                {item.name} 
                                                                <span className="text-xs text-gray-500 font-normal border border-gray-600 px-1 rounded bg-gray-900">({item.size})</span>
                                                            </div>
                                                            {item.selectedExtras && item.selectedExtras.length > 0 && (
                                                                <div className="text-xs text-yellow-500 ml-8 mt-1 flex items-center gap-1">
                                                                    <i className="fas fa-plus-circle text-[10px]"></i> 
                                                                    {item.selectedExtras.map(e => e.name).join(', ')}
                                                                </div>
                                                            )}
                                                            {item.pizzaBox && <div className="text-xs text-gray-400 ml-8 mt-1"><i className="fas fa-box-open mr-1"></i> Caixa Adicional</div>}
                                                        </div>
                                                        <span className="font-mono bg-gray-900 px-2 py-1 rounded border border-gray-700">
                                                            {((item.prices[item.size] || 0) + (item.selectedExtras?.reduce((a,b)=>a+b.price,0)||0)) * item.quantity}$
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="mt-3 flex justify-between items-center border-t border-gray-700 pt-3">
                                                    <div className="text-gray-400 text-xs flex gap-4">
                                                        <span><i className="fas fa-map-marker-alt mr-1"></i> {order.deliveryZone || 'Retirada na Loja'}</span>
                                                        {order.customerPhone && (
                                                            <a href={`tel:${order.customerPhone}`} className="hover:text-white flex items-center">
                                                                <i className="fas fa-phone-alt mr-1"></i> {order.customerPhone}
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-bold text-white">
                                                        Total: <span className="text-xmas-gold">{order.total}$</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Customer Comments in Order Section */}
                                                {order.customerName && (
                                                    <div className="mt-2 pt-2 border-t border-gray-700 border-dashed">
                                                        {(() => {
                                                            const orderComments = order.items.flatMap(item => {
                                                                const itemReviews = comments[item.name] || [];
                                                                return itemReviews.filter(r => r.userName === order.customerName).map(r => ({ ...r, itemName: item.name }));
                                                            });

                                                            if (orderComments.length > 0) {
                                                                return (
                                                                    <div className="bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
                                                                        <p className="text-xs font-bold text-yellow-500 mb-1"><i className="fas fa-comment-dots"></i> Avaliações deste cliente para os itens:</p>
                                                                        {orderComments.map((c, idx) => (
                                                                            <div key={idx} className="text-xs text-gray-300 ml-2 mb-1">
                                                                                <span className="text-white font-bold">{c.itemName}:</span> "{c.text}" <span className="text-yellow-600">({c.rating}★)</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/90 z-[220] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-600 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-trash-alt text-red-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Excluir Item?</h3>
                        <p className="text-gray-400 mb-6 text-sm">Tem certeza que deseja remover este item permanentemente? Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-white font-medium transition">Cancelar</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded text-white font-bold shadow-lg transition">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Comentários */}
            {viewCommentsItem && (
                 <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-600 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                            <h3 className="text-xl font-bold text-white">Avaliações: {viewCommentsItem}</h3>
                            <button onClick={() => setViewCommentsItem(null)} className="text-gray-400 hover:text-white">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {comments[viewCommentsItem]?.length > 0 ? (
                                comments[viewCommentsItem].slice().reverse().map((c, i) => (
                                    <div key={i} className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-blue-400 text-sm">{c.userName}</span>
                                            <div className="flex text-yellow-500 text-xs">
                                                {[...Array(5)].map((_, s) => (
                                                    <i key={s} className={`fas fa-star ${s < c.rating ? '' : 'text-gray-600'}`}></i>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-200 text-sm italic">"{c.text}"</p>
                                        <div className="text-right mt-2 text-[10px] text-gray-500">
                                            {new Date(c.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <i className="far fa-comment-dots text-4xl mb-2 opacity-30"></i>
                                    <p>Nenhuma avaliação encontrada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            )}

            {/* Modal de Adição */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-600">
                        <h3 className="text-xl font-bold text-white mb-4">Adicionar Novo Item</h3>
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm mb-1">Tipo</label>
                            <div className="flex bg-gray-700 rounded p-1">
                                <button onClick={() => setEditCategory('PIZZAS')} className={`flex-1 py-1 rounded transition ${editCategory === 'PIZZAS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}>Pizza</button>
                                <button onClick={() => setEditCategory('BEBIDAS')} className={`flex-1 py-1 rounded transition ${editCategory === 'BEBIDAS' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}>Bebida</button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="Nome do Item" className={`w-full bg-gray-700 p-2 rounded text-white border border-gray-600 ${inputHighlightClass}`} value={editItem.name || ''} onChange={e => setEditItem({...editItem, name: e.target.value})} />
                            <textarea placeholder="Descrição" className={`w-full bg-gray-700 p-2 rounded text-white border border-gray-600 ${inputHighlightClass}`} value={editItem.desc || ''} onChange={e => setEditItem({...editItem, desc: e.target.value})} />
                            
                            {editCategory === 'PIZZAS' && (
                                <div className="mb-2">
                                    <label className="block text-gray-400 text-xs mb-1">Categoria</label>
                                    <select 
                                        className={`w-full bg-gray-700 p-2 rounded text-white border border-gray-600 ${inputHighlightClass}`}
                                        value={editItem.category || 'CLÁSSICA'}
                                        onChange={e => setEditItem({...editItem, category: e.target.value})}
                                    >
                                        <option value="CLÁSSICA">CLÁSSICA</option>
                                        {categories.filter(c => c !== 'CLÁSSICA').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {editCategory === 'PIZZAS' ? (
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="number" placeholder="Familiar" className={`bg-gray-700 p-2 rounded text-white border border-gray-600 text-sm ${inputHighlightClass}`} onChange={e => setEditItem({...editItem, prices: { ...editItem.prices, FAMILIAR: parseInt(e.target.value) }})} />
                                    <input type="number" placeholder="Médio" className={`bg-gray-700 p-2 rounded text-white border border-gray-600 text-sm ${inputHighlightClass}`} onChange={e => setEditItem({...editItem, prices: { ...editItem.prices, MEDIO: parseInt(e.target.value) }})} />
                                    <input type="number" placeholder="Pequeno" className={`bg-gray-700 p-2 rounded text-white border border-gray-600 text-sm ${inputHighlightClass}`} onChange={e => setEditItem({...editItem, prices: { ...editItem.prices, PEQ: parseInt(e.target.value) }})} />
                                </div>
                            ) : (
                                <input type="number" placeholder="Preço Unitário" className={`w-full bg-gray-700 p-2 rounded text-white border border-gray-600 ${inputHighlightClass}`} onChange={e => setEditItem({...editItem, prices: { ...editItem.prices, UN: parseInt(e.target.value) }})} />
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-700 py-2 rounded text-white hover:bg-gray-600 transition">Cancelar</button>
                            <button onClick={handleSaveItem} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded text-white font-bold transition">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
