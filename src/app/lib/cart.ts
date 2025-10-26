
"use client";
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CART_KEY = 'checkout_app_cart';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const cartService = {
  // Get cart items
  getCart(): CartItem[] {
    if (!isBrowser) return [];
    
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart from localStorage:', error);
      return [];
    }
  },

  // Save cart to localStorage
  saveCart(cart: CartItem[]) {
    if (!isBrowser) return;
    
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  // Add item to cart
  addItem(productId: string, name: string, price: number, image: string): CartItem[] {
    if (!isBrowser) return [];

    try {
      const cart = this.getCart();
      const existingItem = cart.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: crypto.randomUUID(), // More secure than Math.random()
          productId,
          name,
          price,
          quantity: 1,
          image,
        });
      }

      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return [];
    }
  },

  // Update item quantity
  updateQuantity(itemId: string, quantity: number): CartItem[] {
    if (!isBrowser) return [];

    try {
      const cart = this.getCart();
      const item = cart.find(item => item.id === itemId);

      if (item) {
        item.quantity = Math.max(0, quantity); // Allow 0 to remove item
        if (item.quantity === 0) {
          return this.removeItem(itemId);
        }
        this.saveCart(cart);
      }

      return cart;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return [];
    }
  },

  // Increment item quantity
  incrementQuantity(itemId: string): CartItem[] {
    return this.updateQuantity(itemId, this.getQuantity(itemId) + 1);
  },

  // Decrement item quantity
  decrementQuantity(itemId: string): CartItem[] {
    return this.updateQuantity(itemId, this.getQuantity(itemId) - 1);
  },

  // Remove item from cart
  removeItem(itemId: string): CartItem[] {
    if (!isBrowser) return [];

    try {
      const cart = this.getCart().filter(item => item.id !== itemId);
      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return [];
    }
  },

  // Clear cart
  clearCart(): void {
    if (!isBrowser) return;
    
    try {
      localStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  // Get cart total
  getTotal(): number {
    if (!isBrowser) return 0;
    
    try {
      return this.getCart().reduce((total, item) => total + item.price * item.quantity, 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  },

  // Get cart count
  getCount(): number {
    if (!isBrowser) return 0;
    
    try {
      return this.getCart().reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      console.error('Error calculating cart count:', error);
      return 0;
    }
  },

  // Get item quantity
  getQuantity(itemId: string): number {
    if (!isBrowser) return 0;
    
    try {
      const item = this.getCart().find(item => item.id === itemId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Error getting item quantity:', error);
      return 0;
    }
  },

  // Check if item exists in cart
  hasItem(productId: string): boolean {
    if (!isBrowser) return false;
    
    try {
      return this.getCart().some(item => item.productId === productId);
    } catch (error) {
      console.error('Error checking if item exists in cart:', error);
      return false;
    }
  },

  // Get item by product ID
  getItemByProductId(productId: string): CartItem | null {
    if (!isBrowser) return null;
    
    try {
      return this.getCart().find(item => item.productId === productId) || null;
    } catch (error) {
      console.error('Error getting item by product ID:', error);
      return null;
    }
  },

  // Merge carts (useful for when user logs in)
  mergeCarts(newCart: CartItem[]): CartItem[] {
    if (!isBrowser) return [];
    
    try {
      const currentCart = this.getCart();
      const mergedCart = [...currentCart];

      newCart.forEach(newItem => {
        const existingItemIndex = mergedCart.findIndex(item => item.productId === newItem.productId);
        
        if (existingItemIndex > -1) {
          // Update quantity if item already exists
          mergedCart[existingItemIndex].quantity += newItem.quantity;
        } else {
          // Add new item
          mergedCart.push({
            ...newItem,
            id: crypto.randomUUID() // Generate new ID for merged item
          });
        }
      });

      this.saveCart(mergedCart);
      return mergedCart;
    } catch (error) {
      console.error('Error merging carts:', error);
      return [];
    }
  },

  // Validate cart items (remove invalid items)
  validateCart(): CartItem[] {
    if (!isBrowser) return [];
    
    try {
      const cart = this.getCart();
      const validCart = cart.filter(item => 
        item.id && 
        item.productId && 
        item.name && 
        item.price > 0 && 
        item.quantity > 0
      );

      if (validCart.length !== cart.length) {
        this.saveCart(validCart);
      }

      return validCart;
    } catch (error) {
      console.error('Error validating cart:', error);
      return [];
    }
  },
};