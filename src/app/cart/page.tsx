'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/auth';
import { cartService, CartItem } from '../lib/cart';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Image from 'next/image';

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!authService.isAuthenticated()) {
      router.push('/auth');
      return;
    }

    loadCart();
  }, [router]);

  const loadCart = () => {
    const items = cartService.getCart();
    setCartItems(items);
    setIsLoading(false);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const updatedCart = cartService.updateQuantity(itemId, newQuantity);
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    const updatedCart = cartService.removeItem(itemId);
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
    toast({
      title: 'Item removido',
      description: `${itemName} foi removido do carrinho`,
    });
  };

  const handleIncrement = (itemId: string) => {
    const updatedCart = cartService.incrementQuantity(itemId);
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleDecrement = (itemId: string) => {
    const updatedCart = cartService.decrementQuantity(itemId);
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione produtos ao carrinho antes de finalizar',
        variant: 'destructive',
      });
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-16">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-16">
          <Card className="max-w-md mx-auto text-center shadow-lg">
            <CardHeader>
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Seu carrinho está vazio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Adicione produtos ao carrinho para continuar suas compras
              </p>
              <Link href="/catalog">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao catálogo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuar comprando
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Meu Carrinho</h1>
          <p className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                      <Image
                        src={item.image || '/images/placeholder-product.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-xl font-bold text-primary mb-4">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.price)}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDecrement(item.id)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleIncrement(item.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                      <p className="text-xl font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground max-w-[70%] truncate">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(total)}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Finalizar compra
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}