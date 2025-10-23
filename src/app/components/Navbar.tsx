import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, LogOut, User } from 'lucide-react';
import { authService } from '@/lib/auth';
import { cartService } from '@/lib/cart';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Update cart count
    const updateCartCount = () => {
      setCartCount(cartService.getCount());
    };

    updateCartCount();
    
    // Listen for storage changes (cart updates)
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates within same tab
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <span>Checkout Pro</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link to="/cart">
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
          )}

          {!user && location.pathname !== '/auth' && (
            <Link to="/auth">
              <Button>Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
