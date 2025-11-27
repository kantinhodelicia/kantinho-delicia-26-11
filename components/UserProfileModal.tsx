
import React, { useState, useEffect } from 'react';
import { User, Order, MenuItem } from '../types';

interface UserProfileModalProps {
    user: User;
    orders: Order[];
    favorites: string[];
    onClose: () => void;
    onUpdateUser: (updatedUser: User) => void;
    onOpenHistory: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
    user, orders, favorites, onClose, onUpdateUser, onOpenHistory 
}) => {
    const [name, setName] = useState(user.nome);
    const [phone, setPhone] = useState(user.telefone);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'PERFIL' | 'STATS'>('PERFIL');

    // Cálculos de Estatísticas
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
    const favoriteZone = orders.length > 0 
        ? orders.map(o => o.deliveryZone || 'Retirada')
            .sort((a,b) => orders.filter(v => v.deliveryZone===a).length - orders.filter(v => v.deliveryZone===b).length).pop()
        : '-';

    // Sistema de Rank Natalino
    const getRank = () => {
        if (totalOrders >= 50) return { title: "Papai Noel da Pizza", icon: "🎅", color: "text-red-500" };
        if (totalOrders >= 20) return { title: "Mestre da Pizza", icon: "👑", color: "text-xmas-gold" };
        if (totalOrders >= 10) return { title: "Rena Líder", icon: "🦌", color: "text-blue-400" };
        if (totalOrders >= 5) return { title: "Ajudante de Elfo", icon: "🧝", color: "text-green-400" };
        return { title: "Visitante Natalino", icon: "🎄", color: "text-gray-400" };
    };

    const rank = getRank();

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        const updatedUser: User = {
            ...user,
            nome: name,
            telefone: phone
        };
        
        // Atualizar localStorage
        localStorage.setItem('kantinho_cliente_atual', JSON.stringify(updatedUser));
        
        // Atualizar lista global de clientes
        const clients = JSON.parse(localStorage.getItem('kantinho_clientes') || '[]');
        const idx = clients.findIndex((c: User) => c.telefone === user.telefone); // Busca pelo telefone antigo
        if (idx >= 0) {
            clients[idx] = updatedUser;
        }
        localStorage.setItem('kantinho_clientes', JSON.stringify(clients));

        onUpdateUser(updatedUser);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[150] flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-2xl border-2 border-xmas-gold shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header do Perfil */}
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-center border-b border-gray-700">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                    
                    <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-3 border-4 border-xmas-gold shadow-lg relative">
                        {user.nome.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-1 border border-gray-600">
                            <span className="text-xl">{rank.icon}</span>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white font-christmas tracking-wide">{user.nome}</h2>
                    <p className={`text-sm font-bold ${rank.color} mt-1 uppercase tracking-wider`}>{rank.title}</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button 
                        onClick={() => setActiveTab('PERFIL')}
                        className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'PERFIL' ? 'text-xmas-gold border-b-2 border-xmas-gold bg-gray-700/30' : 'text-gray-400 hover:text-white'}`}
                    >
                        PERFIL
                    </button>
                    <button 
                        onClick={() => setActiveTab('STATS')}
                        className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'STATS' ? 'text-xmas-gold border-b-2 border-xmas-gold bg-gray-700/30' : 'text-gray-400 hover:text-white'}`}
                    >
                        ESTATÍSTICAS
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'PERFIL' ? (
                        <div className="space-y-6">
                            {isEditing ? (
                                <form onSubmit={handleSave} className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1">Nome</label>
                                        <input 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-xmas-gold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1">Telefone</label>
                                        <input 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-xmas-gold focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-700 text-white py-2 rounded font-bold hover:bg-gray-600">Cancelar</button>
                                        <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-500 shadow-lg">Salvar</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-400">Nome</p>
                                            <p className="text-lg font-bold text-white">{user.nome}</p>
                                        </div>
                                        <i className="fas fa-user text-gray-500"></i>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-400">Telefone</p>
                                            <p className="text-lg font-bold text-white">{user.telefone}</p>
                                        </div>
                                        <i className="fas fa-phone text-gray-500"></i>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-400">Desde</p>
                                            <p className="text-sm font-bold text-white">{new Date(user.ultimoAcesso || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                        <i className="fas fa-calendar text-gray-500"></i>
                                    </div>

                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 hover:text-white transition flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-edit"></i> Editar Dados
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-700">
                                <button 
                                    onClick={onOpenHistory}
                                    className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-history"></i> Ver Meus Pedidos
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center">
                                    <i className="fas fa-pizza-slice text-2xl text-pizza-orange mb-2"></i>
                                    <p className="text-3xl font-bold text-white">{totalOrders}</p>
                                    <p className="text-xs text-gray-400 uppercase">Pedidos Feitos</p>
                                </div>
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center">
                                    <i className="fas fa-heart text-2xl text-red-500 mb-2"></i>
                                    <p className="text-3xl font-bold text-white">{favorites.length}</p>
                                    <p className="text-xs text-gray-400 uppercase">Favoritos</p>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Total Gasto</p>
                                    <p className="text-2xl font-bold text-xmas-gold">{totalSpent}$</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                                    <i className="fas fa-wallet text-green-400"></i>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Zona Favorita</p>
                                    <p className="text-lg font-bold text-white truncate max-w-[200px]">{favoriteZone}</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                                    <i className="fas fa-map-marker-alt text-blue-400"></i>
                                </div>
                            </div>
                            
                            <div className="mt-6 bg-gradient-to-r from-xmas-green to-green-900 p-4 rounded-xl border border-green-500/50 shadow-lg">
                                <p className="text-xs text-green-200 uppercase font-bold mb-2 flex items-center gap-2">
                                    <i className="fas fa-trophy text-xmas-gold"></i> Próximo Nível
                                </p>
                                <div className="w-full bg-black/30 rounded-full h-3 mb-2">
                                    <div 
                                        className="bg-xmas-gold h-3 rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min((totalOrders % 10) * 10, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-center text-white">Faça mais {10 - (totalOrders % 10)} pedidos para subir de rank!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
