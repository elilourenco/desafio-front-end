// Mock product data with TypeScript and Next.js compatibility

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags?: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  features?: string[];
  specifications?: Record<string, string>;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Notebook Gamer Pro',
    description: 'Notebook gamer de alta performance com Intel i7, 16GB RAM, RTX 3060 e SSD 512GB. Ideal para jogos e trabalho pesado.',
    price: 5499.99,
    originalPrice: 5999.99,
    image: '/images/products/notebook-gamer.jpg',
    category: 'Eletrônicos',
    tags: ['gamer', 'performance', 'ssd'],
    inStock: true,
    rating: 4.8,
    reviewCount: 142,
    features: [
      'Processador Intel i7 11ª geração',
      '16GB RAM DDR4',
      'Placa de vídeo RTX 3060 6GB',
      'SSD 512GB NVMe',
      'Tela 15.6" Full HD 144Hz'
    ],
    specifications: {
      'Processador': 'Intel Core i7-11800H',
      'Memória': '16GB DDR4 3200MHz',
      'Armazenamento': '512GB SSD NVMe',
      'Placa de Vídeo': 'NVIDIA GeForce RTX 3060 6GB',
      'Tela': '15.6" Full HD IPS 144Hz'
    }
  },
  {
    id: '2',
    name: 'Mouse Gamer RGB',
    description: 'Mouse gamer com iluminação RGB personalizável, DPI ajustável até 16000 e 7 botões programáveis.',
    price: 159.90,
    originalPrice: 199.90,
    image: '/images/products/mouse-gamer.jpg',
    category: 'Periféricos',
    tags: ['gamer', 'rgb', 'precisão'],
    inStock: true,
    rating: 4.5,
    reviewCount: 89,
    features: [
      'DPI ajustável até 16000',
      '7 botões programáveis',
      'Iluminação RGB personalizável',
      'Sensor óptico de alta precisão',
      'Cabo reforçado'
    ],
    specifications: {
      'Sensor': 'Óptico PMW 3389',
      'DPI': '200-16000',
      'Polling Rate': '1000Hz',
      'Botões': '7 programáveis',
      'Conexão': 'USB 2.0'
    }
  },
  {
    id: '3',
    name: 'Teclado Mecânico RGB',
    description: 'Teclado mecânico com switches Blue, iluminação RGB completa e layout ABNT2 para maior conforto.',
    price: 349.90,
    originalPrice: 429.90,
    image: '/images/products/teclado-mecanico.jpg',
    category: 'Periféricos',
    tags: ['mecânico', 'rgb', 'abnt2'],
    inStock: true,
    rating: 4.6,
    reviewCount: 67,
    features: [
      'Switches mecânicos Blue',
      'Iluminação RGB personalizável',
      'Layout ABNT2',
      'Teclas ABS de dupla injeção',
      'Base em alumínio'
    ],
    specifications: {
      'Switch': 'Blue Mechanical',
      'Iluminação': 'RGB 16.8 milhões de cores',
      'Layout': 'ABNT2',
      'Anti-ghosting': 'Teclas N-key rollover',
      'Conexão': 'USB-C'
    }
  },
  {
    id: '4',
    name: 'Headset Wireless 7.1',
    description: 'Headset gamer wireless com som surround 7.1 virtual, bateria de 20 horas e microfone removível.',
    price: 599.00,
    image: '/images/products/headset-wireless.jpg',
    category: 'Áudio',
    tags: ['wireless', '7.1', 'gamer'],
    inStock: true,
    rating: 4.4,
    reviewCount: 123,
    features: [
      'Som surround 7.1 virtual',
      'Bateria de 20 horas',
      'Microfone removível com cancelamento de ruído',
      'Conforto prolongado com almofadas em gel',
      'Conexão wireless 2.4GHz'
    ],
    specifications: {
      'Conectividade': 'Wireless 2.4GHz / Bluetooth',
      'Bateria': '20 horas de uso',
      'Driver': '50mm Neodymium',
      'Microfone': 'Removível com cancelamento de ruído',
      'Compatibilidade': 'PC, PS4, PS5, Mobile'
    }
  },
  {
    id: '5',
    name: 'Monitor 27" 144Hz IPS',
    description: 'Monitor gamer 27 polegadas com taxa de atualização de 144Hz, painel IPS e tempo de resposta de 1ms.',
    price: 1299.00,
    originalPrice: 1499.00,
    image: '/images/products/monitor-27.jpg',
    category: 'Monitores',
    tags: ['144hz', 'ips', 'gamer'],
    inStock: false,
    rating: 4.7,
    reviewCount: 56,
    features: [
      'Tela 27" Full HD IPS',
      'Taxa de atualização 144Hz',
      'Tempo de resposta 1ms',
      'Suporte FreeSync',
      'Portas HDMI e DisplayPort'
    ],
    specifications: {
      'Tamanho': '27 polegadas',
      'Resolução': '1920x1080 Full HD',
      'Taxa de Atualização': '144Hz',
      'Tempo de Resposta': '1ms',
      'Painel': 'IPS'
    }
  },
  {
    id: '6',
    name: 'Webcam Full HD Pro',
    description: 'Webcam Full HD com gravação em 1080p 60fps, microfone integrado com redução de ruído e ajuste automático de luz.',
    price: 389.90,
    image: '/images/products/webcam-fullhd.jpg',
    category: 'Periféricos',
    tags: ['1080p', 'microfone', 'streaming'],
    inStock: true,
    rating: 4.3,
    reviewCount: 78,
    features: [
      'Gravação Full HD 1080p 60fps',
      'Microfone integrado com redução de ruído',
      'Ajuste automático de luz',
      'Lente de vidro com ângulo de 78°',
      'Compatibilidade plug-and-play'
    ],
    specifications: {
      'Resolução': '1080p Full HD',
      'Frame Rate': '60fps',
      'Microfone': 'Estéreo com redução de ruído',
      'Conexão': 'USB 2.0',
      'Compatibilidade': 'Windows, Mac, Linux'
    }
  },
];

// Utility functions for product management
export const productService = {
  // Get all products
  getAllProducts(): Product[] {
    return products;
  },

  // Get product by ID
  getProductById(id: string): Product | undefined {
    return products.find(product => product.id === id);
  },

  // Get products by category
  getProductsByCategory(category: string): Product[] {
    return products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  },

  // Get products in stock
  getInStockProducts(): Product[] {
    return products.filter(product => product.inStock);
  },

  // Search products
  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // Get featured products
  getFeaturedProducts(limit?: number): Product[] {
    const featured = products
      .filter(product => product.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating);
    
    return limit ? featured.slice(0, limit) : featured;
  },

  // Get products on sale
  getProductsOnSale(): Product[] {
    return products.filter(product => product.originalPrice && product.originalPrice > product.price);
  },

  // Get categories
  getCategories(): string[] {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
  },
};

// Custom hook for product management
export const useProducts = () => {
  const getAll = () => productService.getAllProducts();
  const getById = (id: string) => productService.getProductById(id);
  const getByCategory = (category: string) => productService.getProductsByCategory(category);
  const search = (query: string) => productService.searchProducts(query);
  const getFeatured = (limit?: number) => productService.getFeaturedProducts(limit);
  const getOnSale = () => productService.getProductsOnSale();
  const getCategories = () => productService.getCategories();

  return {
    getAll,
    getById,
    getByCategory,
    search,
    getFeatured,
    getOnSale,
    getCategories,
  };
};

// Type for product filters
export interface ProductFilters {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
}

// Utility function to filter products
export const filterProducts = (products: Product[], filters: ProductFilters): Product[] => {
  return products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) return false;
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    if (filters.minRating && product.rating < filters.minRating) return false;
    if (filters.tags && filters.tags.length > 0) {
      if (!product.tags?.some(tag => filters.tags!.includes(tag))) return false;
    }
    return true;
  });
};