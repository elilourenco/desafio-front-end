'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShoppingBag, ShoppingCart, LogOut, User } from 'lucide-react';
import { authService } from '../lib/auth';
import { cartService } from '../lib/cart';
import { useState, useEffect } from 'react';

const Navbar = () => {
  type User = { id?: string; name: string; email?: string };
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Aguardar montagem do componente no cliente
  useEffect(() => {
    setIsMounted(true);
    setUser(authService.getCurrentUser() ?? null);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Update cart count
    const updateCartCount = () => {
      setCartCount(cartService.getCount());
    };
    
    updateCartCount();
    
    // Listen for storage changes (cart updates)
    const handleStorageChange = () => updateCartCount();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for cart updates within same tab
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [pathname, isMounted]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push('/auth');
  };

  // Durante SSR/hydration, renderize um estado neutro
  if (!isMounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <ShoppingBag className="w-6 h-6 text-primary-foreground" />
            </div>
            <span>StoreVisa</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Placeholder para o botão de entrar - renderizado igual no servidor e cliente */}
            <div className="h-9 w-20 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <span>StoreVisa</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : pathname !== '/auth' ? (
            <Link href="/auth">
              <Button>Entrar</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
