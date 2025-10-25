'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../lib/auth';
import { orderService, type Order as OrderType, type OrderStatus } from '../../lib/orders';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export default function Order() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!authService.isAuthenticated()) {
      router.push('/auth');
      return;
    }

    if (!id) {
      router.push('/');
      return;
    }

    // Load order
    const loadedOrder = orderService.getOrder(id);
    if (!loadedOrder) {
      router.push('/');
      return;
    }

    // Defer state updates to avoid synchronous setState inside an effect
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setOrder(loadedOrder);
      setIsLoading(false);
    });

    // If status is processing, simulate status changes
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (loadedOrder.status === 'processing') {
      timer = setTimeout(() => {
        const updatedOrder = orderService.getOrder(id);
        if (!cancelled && updatedOrder) {
          setOrder(updatedOrder);
        }
      }, 2000);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, router]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-16 h-16 text-primary animate-spin" />;
      case 'paid':
        return <CheckCircle2 className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-16 h-16 text-orange-500" />;
      default:
        return <Clock className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Pagamento Pendente',
          description: 'Aguardando confirmação do pagamento',
        };
      case 'processing':
        return {
          title: 'Processando Pagamento',
          description: 'Estamos verificando seu pagamento...',
        };
      case 'paid':
        return {
          title: 'Pagamento Confirmado!',
          description: 'Seu pedido foi aprovado com sucesso',
        };
      case 'failed':
        return {
          title: 'Pagamento Recusado',
          description: 'Não foi possível processar seu pagamento',
        };
      case 'expired':
        return {
          title: 'Pagamento Expirado',
          description: 'O prazo para pagamento expirou',
        };
      default:
        return {
          title: 'Status Desconhecido',
          description: 'Entre em contato com o suporte',
        };
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const statusInfo = getStatusText(order.status);
  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {StatusIcon}
              </div>
              <CardTitle className="text-3xl">{statusInfo.title}</CardTitle>
              <CardDescription className="text-base">{statusInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.status === 'paid' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Tudo pronto!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Você receberá um e-mail com os detalhes do seu pedido em breve.
                  </AlertDescription>
                </Alert>
              )}

              {order.status === 'failed' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Ops! Algo deu errado</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Verifique seus dados de pagamento e tente novamente. Se o problema persistir,
                    entre em contato com nosso suporte.
                  </AlertDescription>
                </Alert>
              )}

              {order.status === 'expired' && (
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Pagamento expirado</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    O prazo para pagamento deste pedido expirou. Faça um novo pedido para continuar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número do pedido</span>
                  <span className="font-mono font-medium">#{order.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forma de pagamento</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod === 'pix' && 'Pix'}
                    {order.paymentMethod === 'credit-card' && 'Cartão de Crédito'}
                    {order.paymentMethod === 'boleto' && 'Boleto Bancário'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${
                    order.status === 'paid' ? 'text-green-600' :
                    order.status === 'failed' ? 'text-red-600' :
                    order.status === 'expired' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {statusInfo.title}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Itens do pedido</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
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
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.total)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continuar comprando
                  </Button>
                </Link>
                
                {(order.status === 'failed' || order.status === 'expired') && (
                  <Link href="/cart" className="flex-1">
                    <Button className="w-full">
                      Tentar novamente
                    </Button>
                  </Link>
                )}
              </div>

              {order.paymentDetails && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Detalhes do pagamento</h3>
                    <div className="space-y-2 text-sm">
                      {order.paymentDetails.pixCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Código PIX</span>
                          <span className="font-mono">{order.paymentDetails.pixCode}</span>
                        </div>
                      )}
                      {order.paymentDetails.boletoCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Código do Boleto</span>
                          <span className="font-mono">{order.paymentDetails.boletoCode}</span>
                        </div>
                      )}
                      {order.paymentDetails.cardLastDigits && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cartão</span>
                          <span className="font-mono">**** **** **** {order.paymentDetails.cardLastDigits}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}