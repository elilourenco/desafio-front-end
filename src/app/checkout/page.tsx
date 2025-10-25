'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/auth';
import { cartService } from '../lib/cart';
import { orderService, PaymentMethod } from '../lib/orders';
import Navbar from '../components/Navbar';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { PixPaymentForm, CreditCardPaymentForm, BoletoPaymentForm } from '../components/PaymentForms';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';

export default function Checkout() {
  const [step, setStep] = useState<'method' | 'payment'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState(cartService.getCart());
  const router = useRouter();
  const { toast } = useToast();
  const user = authService.getCurrentUser();
  const total = cartService.getTotal();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!authService.isAuthenticated()) {
      router.push('/auth');
      return;
    }

    // Redirect to cart if empty
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }
  }, [router, cartItems.length]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartItems(cartService.getCart());
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('payment');
  };

  const handlePaymentSubmit = async (paymentDetails: Record<string, unknown>) => {
    if (!user || !selectedMethod) return;

    setIsProcessing(true);

    try {
      // Create order
      const order = orderService.createOrder(
        user.id,
        cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        selectedMethod,
        paymentDetails
      );

      // Simulate payment processing
      await orderService.processPayment(order.id, selectedMethod);

      // Clear cart
      cartService.clearCart();
      window.dispatchEvent(new Event('cart-updated'));

      // Navigate to order status
      router.push(`/order/${order.id}`);
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleBackToMethod = () => {
    setStep('method');
    setSelectedMethod(null);
  };

  if (!user) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {step === 'payment' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMethod}
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao carrinho
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">
            {step === 'method' ? 'Escolha a forma de pagamento' : 'Complete o pagamento'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 'method' ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados do comprador</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-mail</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Forma de pagamento</h2>
                  <PaymentMethodSelector
                    selectedMethod={selectedMethod}
                    onSelectMethod={handleSelectMethod}
                  />
                </div>
              </div>
            ) : (
              <div>
                {selectedMethod === 'pix' && (
                  <PixPaymentForm
                    method={selectedMethod}
                    total={total}
                    onSubmit={handlePaymentSubmit}
                    isProcessing={isProcessing}
                  />
                )}
                {selectedMethod === 'credit-card' && (
                  <CreditCardPaymentForm
                    method={selectedMethod}
                    total={total}
                    onSubmit={handlePaymentSubmit}
                    isProcessing={isProcessing}
                  />
                )}
                {selectedMethod === 'boleto' && (
                  <BoletoPaymentForm
                    method={selectedMethod}
                    total={total}
                    onSubmit={handlePaymentSubmit}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            )}
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

                {selectedMethod && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Forma de pagamento</span>
                      <span className="font-medium capitalize">
                        {selectedMethod === 'pix' && 'Pix'}
                        {selectedMethod === 'credit-card' && 'Cartão de Crédito'}
                        {selectedMethod === 'boleto' && 'Boleto Bancário'}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}