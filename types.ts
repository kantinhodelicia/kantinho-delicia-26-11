
export type Size = 'FAMILIAR' | 'MEDIO' | 'PEQ' | 'UN';

export type PizzaCategory = 'CLÁSSICA' | 'ESPECIAL' | 'VEGETARIANA';

export interface MenuItem {
  name: string;
  desc: string;
  prices: {
    [key in Size]?: number;
  };
  category?: PizzaCategory | string;
  isHalfAndHalf?: boolean;
  halfPizzas?: {
    left: MenuItem | null;
    right: MenuItem | null;
  };
}

export interface Extra {
  name: string;
  price: number;
}

export interface CartItem extends MenuItem {
  size: Size;
  quantity: number;
  pizzaBox?: boolean;
  selectedExtras?: Extra[];
}

export interface DeliveryZone {
  name: string;
  price: number;
  time: string;
}

export interface User {
  nome: string;
  telefone: string;
  ultimoAcesso?: string;
}

export interface HalfPizzasSelection {
  left: MenuItem | null;
  right: MenuItem | null;
}

export type PaymentMethod = 'DINHEIRO' | 'CARTAO' | 'USDT';

export type OrderStatus = 'RECEBIDO' | 'PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CONCLUIDO';

export interface Order {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    paymentMethod: PaymentMethod;
    deliveryZone?: string;
    status: OrderStatus;
    customerName?: string;
    customerPhone?: string;
}

export interface ItemComment {
    text: string;
    rating: number;
    date: string;
    userName: string;
}