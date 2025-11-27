import React, { useState } from 'react';
import { User } from '../types';

interface LoginModalProps {
    onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError('Por favor preencha todos os campos');
            return;
        }
        
        const user: User = {
            nome: name,
            telefone: phone,
            ultimoAcesso: new Date().toISOString()
        };
        
        localStorage.setItem('kantinho_cliente_atual', JSON.stringify(user));
        
        // Save to clients history list
        const clients = JSON.parse(localStorage.getItem('kantinho_clientes') || '[]');
        const existingIndex = clients.findIndex((c: User) => c.telefone === phone);
        if (existingIndex >= 0) {
            clients[existingIndex] = user;
        } else {
            clients.push(user);
        }
        localStorage.setItem('kantinho_clientes', JSON.stringify(clients));

        onLogin(user);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100] p-4 relative overflow-hidden">
            {/* Christmas Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1544967082-d9d3f661eb1d?q=80&w=1000&auto=format&fit=crop" 
                    alt="Christmas Background" 
                    className="w-full h-full object-cover opacity-40 animate-pulse-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
            </div>

            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-xmas-gold relative z-10 transform transition-all duration-500 hover:scale-[1.01] hover:shadow-xmas-gold/20">
                {/* Decorative Santa Hat */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-7xl drop-shadow-xl filter animate-bounce-short" style={{ animationDelay: '1s' }}>
                    🎅
                </div>

                <div className="text-center mb-8 mt-4">
                    <h1 className="text-5xl font-bold font-christmas text-pizza-red mb-2 drop-shadow-md tracking-wide">
                        Kantinho Delícia
                    </h1>
                    <p className="text-xmas-gold font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                        <i className="fas fa-snowflake animate-spin" style={{ animationDuration: '3s' }}></i> 
                        Entre para fazer seu pedido de Natal
                        <i className="fas fa-snowflake animate-spin" style={{ animationDuration: '4s' }}></i>
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Seu Nome</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-xmas-green transition-colors"><i className="fas fa-user"></i></span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-xmas-green focus:ring-1 focus:ring-xmas-green transition-all placeholder-gray-500"
                                placeholder="Como podemos te chamar?"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Telefone</label>
                         <div className="relative group">
                            <span className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-xmas-green transition-colors"><i className="fas fa-phone"></i></span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-xmas-green focus:ring-1 focus:ring-xmas-green transition-all placeholder-gray-500"
                                placeholder="Seu número de contato"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-500/50 text-red-200 text-sm rounded-lg p-3 text-center animate-pulse flex items-center justify-center gap-2">
                            <i className="fas fa-sleigh"></i>
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-xmas-green to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-green-500/50 flex items-center justify-center gap-3 group"
                    >
                        <span className="text-lg">Entrar na Festa</span>
                        <i className="fas fa-gift text-xmas-gold group-hover:animate-bounce"></i>
                    </button>
                </form>

                 <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 font-christmas text-lg tracking-wider">🎄 Feliz Natal e Boas Festas! 🎄</p>
                </div>
            </div>
            
            {/* Falling Snow Overlay (CSS only for login) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
                <div className="snowflake" style={{ left: '10%', animationDelay: '0s' }}>❄</div>
                <div className="snowflake" style={{ left: '30%', animationDelay: '2s', fontSize: '1.5em' }}>❅</div>
                <div className="snowflake" style={{ left: '50%', animationDelay: '4s' }}>❆</div>
                <div className="snowflake" style={{ left: '70%', animationDelay: '1s', fontSize: '0.8em' }}>❄</div>
                <div className="snowflake" style={{ left: '90%', animationDelay: '3s' }}>❅</div>
            </div>
        </div>
    );
};

export default LoginModal;