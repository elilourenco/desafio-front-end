// Order management with mock payment processing
// Compatible with Next.js App Router and React 19

export type PaymentMethod = 'pix' | 'credit-card' | 'boleto';
export type OrderStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'expired';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentDetails?: {
    pixCode?: string;
    pixQrCode?: string;
    boletoCode?: string;
    boletoUrl?: string;
    cardLastDigits?: string;
  };
}

const ORDERS_KEY = 'checkout_app_orders';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper to generate secure IDs
const generateId = (): string => {
  return crypto.randomUUID();
};

// Helper to get current timestamp
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const orderService = {
  // Get all orders
  getOrders(): Order[] {
    if (!isBrowser) return [];
    
    try {
      const orders = localStorage.getItem(ORDERS_KEY);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error getting orders from localStorage:', error);
      return [];
    }
  },

  // Save orders
  saveOrders(orders: Order[]): void {
    if (!isBrowser) return;
    
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  },

  // Get order by ID
  getOrder(id: string): Order | null {
    if (!isBrowser) return null;
    
    try {
      const orders = this.getOrders();
      return orders.find(o => o.id === id) || null;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return null;
    }
  },

  // Create new order
  createOrder(
    userId: string,
    items: OrderItem[],
    total: number,
    paymentMethod: PaymentMethod,
    paymentDetails?: Order['paymentDetails']
  ): Order {
    if (!isBrowser) {
      throw new Error('LocalStorage não disponível');
    }

    try {
      const orders = this.getOrders();
      
      // Validate input
      if (!userId.trim()) {
        throw new Error('ID do usuário é obrigatório');
      }

      if (!items.length) {
        throw new Error('Carrinho vazio');
      }

      if (total <= 0) {
        throw new Error('Total inválido');
      }

      const newOrder: Order = {
        id: generateId(),
        userId,
        items: items.map(item => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
        total: Number(total),
        paymentMethod,
        status: 'pending',
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        paymentDetails,
      };

      orders.push(newOrder);
      this.saveOrders(orders);

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    if (!isBrowser) return null;

    try {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);

      if (order) {
        order.status = status;
        order.updatedAt = getCurrentTimestamp();
        this.saveOrders(orders);
      }

      return order || null;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  },

  // Simulate payment processing
  async processPayment(orderId: string, paymentMethod: PaymentMethod): Promise<OrderStatus> {
    if (!isBrowser) {
      throw new Error('LocalStorage não disponível');
    }

    try {
      // Update to processing
      this.updateOrderStatus(orderId, 'processing');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 85% success rate for better UX
      const isSuccess = Math.random() > 0.15;
      
      let finalStatus: OrderStatus;
      
      if (paymentMethod === 'pix') {
        // Pix can expire after some time
        finalStatus = isSuccess ? 'paid' : (Math.random() > 0.5 ? 'expired' : 'failed');
      } else if (paymentMethod === 'credit-card') {
        // Credit card has higher success rate
        finalStatus = Math.random() > 0.1 ? 'paid' : 'failed';
      } else {
        // Boleto
        finalStatus = isSuccess ? 'paid' : 'failed';
      }

      this.updateOrderStatus(orderId, finalStatus);
      return finalStatus;
    } catch (error) {
      console.error('Error processing payment:', error);
      this.updateOrderStatus(orderId, 'failed');
      throw error;
    }
  },

  // Get user orders
  getUserOrders(userId: string): Order[] {
    if (!isBrowser) return [];
    
    try {
      return this.getOrders()
        .filter(o => o.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  },

  // Cancel order
  cancelOrder(orderId: string): Order | null {
    if (!isBrowser) return null;

    try {
      const order = this.getOrder(orderId);
      
      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      if (order.status !== 'pending' && order.status !== 'processing') {
        throw new Error('Não é possível cancelar este pedido');
      }

      return this.updateOrderStatus(orderId, 'failed');
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  },

  // Get orders by status
  getOrdersByStatus(status: OrderStatus): Order[] {
    if (!isBrowser) return [];
    
    try {
      return this.getOrders()
        .filter(o => o.status === status)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting orders by status:', error);
      return [];
    }
  },

  // Get order statistics
  getOrderStats(userId?: string) {
    if (!isBrowser) return { total: 0, paid: 0, pending: 0, failed: 0 };

    try {
      const orders = userId ? this.getUserOrders(userId) : this.getOrders();
      
      return {
        total: orders.length,
        paid: orders.filter(o => o.status === 'paid').length,
        pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        failed: orders.filter(o => o.status === 'failed' || o.status === 'expired').length,
        totalRevenue: orders
          .filter(o => o.status === 'paid')
          .reduce((sum, order) => sum + order.total, 0),
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      return { total: 0, paid: 0, pending: 0, failed: 0, totalRevenue: 0 };
    }
  },

  // Clear all orders (for testing/development)
  clearAllOrders(): void {
    if (!isBrowser) return;
    
    try {
      localStorage.removeItem(ORDERS_KEY);
    } catch (error) {
      console.error('Error clearing orders:', error);
    }
  },
};