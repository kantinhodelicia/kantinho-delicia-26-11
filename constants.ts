
import { MenuItem, DeliveryZone, Extra } from './types';

export const DEFAULT_CATEGORIES = ['CLÁSSICA', 'ESPECIAL', 'VEGETARIANA'];

export const PIZZA_MENU: MenuItem[] = [
    {
        name: "MARGUERITA",
        desc: "Queijo mussarela, gouda, oregano e molho tomate",
        prices: { FAMILIAR: 800, MEDIO: 750, PEQ: 500 },
        category: "VEGETARIANA"
    },
    {
        name: "4 QUEIJOS",
        desc: "Queijo mussarela, queijo azul, edem e fogo e molho tomate",
        prices: { FAMILIAR: 950, MEDIO: 850, PEQ: 650 },
        category: "VEGETARIANA"
    },
    {
        name: "FIAMBRE",
        desc: "Fiambre, Queijo e molho tomate",
        prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 600 },
        category: "CLÁSSICA"
    },
    {
        name: "FRANGO",
        desc: "Frango, queijo, molho tomate",
        prices: { FAMILIAR: 850, MEDIO: 850, PEQ: 600 },
        category: "CLÁSSICA"
    },
    {
        name: "CHOURIÇO",
        desc: "Chouriço Queijo e molho tomate",
        prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 550 },
        category: "CLÁSSICA"
    },
    {
        name: "BACON",
        desc: "Bacon, queijo, molho tomate",
        prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 550 },
        category: "CLÁSSICA"
    },
    {
        name: "PRESUNTO",
        desc: "Presunto, queijo, molho tomate",
        prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 550 },
        category: "CLÁSSICA"
    },
    {
        name: "LINGUIÇA E QUEIJO DE TERRA",
        desc: "Linguiça, molho tomate",
        prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 },
        category: "ESPECIAL"
    },
    {
        name: "CARNE MOIDA",
        desc: "Carne moída, queijo, molho tomate",
        prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 },
        category: "CLÁSSICA"
    },
    {
        name: "ATUM",
        desc: "Atum, cebola, queijo, molho tomate",
        prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 650 },
        category: "ESPECIAL"
    },
    {
        name: "VEGETARIANO",
        desc: "Cebola, tomate, pimentão, cogumelo, queijo, molho tomate",
        prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 },
        category: "VEGETARIANA"
    },
    {
        name: "ESPECIAL DA CASA",
        desc: "Bacon, cogumelo, nata, queijo, molho tomate",
        prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 650 },
        category: "ESPECIAL"
    },
    {
        name: "QUATRO ESTAÇÕES",
        desc: "Queijo e molho tomate cogumelo Fiambre Chouriço atum",
        prices: { FAMILIAR: 1000, MEDIO: 850, PEQ: 0 },
        category: "ESPECIAL"
    },
    {
        name: "TROPICAL",
        desc: "Frutas da época, queijo, molho tomate",
        prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 },
        category: "ESPECIAL"
    },
    {
        name: "MARISCO",
        desc: "Marisco, queijo, molho tomate",
        prices: { FAMILIAR: 1200, MEDIO: 1000, PEQ: 0 },
        category: "ESPECIAL"
    },
    {
        name: "CAMARÃO",
        desc: "Camarão, queijo, molho tomate",
        prices: { FAMILIAR: 1200, MEDIO: 1000, PEQ: 0 },
        category: "ESPECIAL"
    },
    {
        name: "MADA",
        desc: "Queijo, molho tomate, Chouriço, Bacon, Camarão e Ananás",
        prices: { FAMILIAR: 1500, MEDIO: 0, PEQ: 0 },
        category: "ESPECIAL"
    },
    {
        name: "CALZONE",
        desc: "Frango ou, Chouriço, Presunto, Cogumelo, Atum e Cebola (queijo e molho tomate)",
        prices: { FAMILIAR: 850, MEDIO: 0, PEQ: 0 },
        category: "ESPECIAL"
    }
];

export const DRINK_MENU: MenuItem[] = [
    {
        name: "ÁGUA",
        desc: "Água mineral",
        prices: { UN: 100 },
        category: "BEBIDAS"
    },
    {
        name: "COCA-COLA",
        desc: "Refrigerante Coca-Cola",
        prices: { UN: 300 },
        category: "BEBIDAS"
    },
    {
        name: "FANTA LARANJA",
        desc: "Refrigerante Fanta Laranja",
        prices: { UN: 150 },
        category: "BEBIDAS"
    },
    {
        name: "CERVEJA",
        desc: "Cerveja local",
        prices: { UN: 200 },
        category: "BEBIDAS"
    },
    {
        name: "SUMO NATURAL",
        desc: "Sumo natural da casa",
        prices: { UN: 200 },
        category: "BEBIDAS"
    },
    {
        name: "VINHO TINTO",
        desc: "Vinho tinto da região",
        prices: { UN: 500 },
        category: "BEBIDAS"
    }
];

export const DELIVERY_ZONES: DeliveryZone[] = [
    { name: "Retirada no Balcão", price: 0, time: "15-20 min" },
    { name: "Alto Glória", price: 200, time: "25-35 min" },
    { name: "Achada Santo António", price: 200, time: "25-35 min" },
    { name: "Achada São Filipe", price: 300, time: "35-45 min" },
    { name: "Achada Grande Frente", price: 300, time: "35-45 min" },
    { name: "Achada Grande Trás", price: 300, time: "35-45 min" },
    { name: "Achada Eugênio Lima", price: 300, time: "35-45 min" },
    { name: "Achada Limpo/Achada Mato", price: 300, time: "35-45 min" },
    { name: "Achadinha", price: 200, time: "25-35 min" },
    { name: "Achadinha Pires", price: 250, time: "30-40 min" },
    { name: "Bairro Craveiro Lopes", price: 200, time: "25-35 min" },
    { name: "Bela Vista", price: 150, time: "20-30 min" },
    { name: "Campus Unicv", price: 250, time: "30-40 min" },
    { name: "Cidadela", price: 200, time: "25-35 min" },
    { name: "Cova Minhoto", price: 250, time: "30-40 min" },
    { name: "Calabaceira", price: 250, time: "30-40 min" },
    { name: "Coqueiro", price: 250, time: "30-40 min" },
    { name: "Castelão", price: 250, time: "30-40 min" },
    { name: "Fazenda", price: 200, time: "25-35 min" },
    { name: "Zona Quelém", price: 150, time: "20-30 min" },
    { name: "Quebra Canela", price: 200, time: "25-35 min" },
    { name: "Fundo Cobom", price: 150, time: "20-30 min" },
    { name: "Terra Branca", price: 50, time: "15-25 min" },
    { name: "Tira Chapéu", price: 100, time: "15-25 min" },
    { name: "Lém Ferreira", price: 200, time: "25-35 min" },
    { name: "Monte Vermelho", price: 200, time: "25-35 min" },
    { name: "Ponta Água", price: 250, time: "30-40 min" },
    { name: "Pensamento", price: 250, time: "30-40 min" },
    { name: "Palmarejo", price: 250, time: "30-40 min" },
    { name: "Palmarejo Grande", price: 200, time: "25-35 min" },
    { name: "Praia Negra", price: 200, time: "25-35 min" },
    { name: "Plateau", price: 200, time: "25-35 min" },
    { name: "Prainha", price: 200, time: "25-35 min" },
    { name: "São Pedro Latada", price: 300, time: "35-45 min" },
    { name: "Safende", price: 250, time: "30-40 min" },
    { name: "Várzea", price: 150, time: "20-30 min" },
    { name: "Vila Nova", price: 250, time: "30-40 min" }
];

export const EXTRAS: Extra[] = [
    { name: "Queijo Extra", price: 100 },
    { name: "Bacon Extra", price: 150 },
    { name: "Ananás", price: 100 },
    { name: "Cogumelo", price: 100 },
    { name: "Nata", price: 70 },
    { name: "Camarão", price: 300 },
    { name: "Ovo", price: 50 }
];
