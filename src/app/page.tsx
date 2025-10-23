
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, QrCode, FileText, Trash2, Plus, Minus, CheckCircle, XCircle, Clock, Loader2, AlertCircle, User, MapPin, Phone, Mail } from 'lucide-react';

// Mock de produtos
const MOCK_PRODUCTS = [
  { id: 1, name: 'Notebook Gamer', price: 4599.90, image: '💻', stock: 5 },
  { id: 2, name: 'Mouse Wireless', price: 129.90, image: '🖱️', stock: 15 },
  { id: 3, name: 'Teclado Mecânico', price: 349.90, image: '⌨️', stock: 8 },
  { id: 4, name: 'Monitor 27"', price: 1299.90, image: '🖥️', stock: 3 },
  { id: 5, name: 'Headset Gamer', price: 399.90, image: '🎧', stock: 12 },
  { id: 6, name: 'Webcam Full HD', price: 279.90, image: '📷', stock: 0 },
];

const CheckoutApp = () => {
  const [currentStep, setCurrentStep] = useState('auth');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [buyerData, setBuyerData] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [paymentData, setPaymentData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar sessão do usuário
  useEffect(() => {
    setTimeout(() => {
      const savedUser = JSON.parse(localStorage.getItem('mockUser') || 'null');
      const savedCart = JSON.parse(localStorage.getItem('mockCart') || '[]');
      if (savedUser) {
        setUser(savedUser);
        setCurrentStep('products');
        setBuyerData({
          name: savedUser.name,
          email: savedUser.email,
          cpf: savedUser.cpf || '',
          phone: savedUser.phone || '',
          zipCode: savedUser.zipCode || '',
          address: savedUser.address || '',
          number: savedUser.number || '',
          complement: savedUser.complement || '',
          city: savedUser.city || '',
          state: savedUser.state || '',
        });
      }
      if (savedCart.length > 0) {
        setCart(savedCart);
      }
      setIsLoading(false);
    }, 800);
  }, []);

  // Salvar carrinho
  useEffect(() => {
    if (cart.length >= 0) {
      localStorage.setItem('mockCart', JSON.stringify(cart));
    }
  }, [cart]);

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Componente de Autenticação
  const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '', cpf: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
      setError('');

      if (!formData.email || !formData.password) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }

      if (!isLogin && (!formData.name || !formData.phone)) {
        setError('Nome e telefone são obrigatórios para criar conta');
        return;
      }

      setLoading(true);

      // Simular chamada de API
      setTimeout(() => {
        const mockUser = {
          id: Date.now(),
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          phone: formData.phone || '',
          cpf: formData.cpf || '',
        };

        setUser(mockUser);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setBuyerData({
          name: mockUser.name,
          email: mockUser.email,
          cpf: mockUser.cpf,
          phone: mockUser.phone,
          zipCode: '',
          address: '',
          number: '',
          complement: '',
          city: '',
          state: '',
        });
        setCurrentStep('products');
        setLoading(false);
      }, 1000);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Acesse sua conta para continuar' : 'Crie sua conta para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onKeyPress={handleKeyPress}
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 98765-4321"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        let formatted = value;
                        if (value.length > 10) {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                        } else if (value.length > 6) {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
                        } else if (value.length > 2) {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                        }
                        setFormData({ ...formData, phone: formatted });
                      }}
                      onKeyPress={handleKeyPress}
                      maxLength="15"
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF (opcional)</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        let formatted = value;
                        if (value.length > 9) {
                          formatted = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`;
                        } else if (value.length > 6) {
                          formatted = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
                        } else if (value.length > 3) {
                          formatted = `${value.slice(0, 3)}.${value.slice(3)}`;
                        }
                        setFormData({ ...formData, cpf: formatted });
                      }}
                      onKeyPress={handleKeyPress}
                      maxLength="14"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyPress={handleKeyPress}
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyPress={handleKeyPress}
                  aria-required="true"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Componente de Produtos
  const ProductsScreen = () => {
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
      setTimeout(() => setLoadingProducts(false), 500);
    }, []);

    const addToCart = (product) => {
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Estoque insuficiente');
          return;
        }
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    };

    const updateQuantity = (id, delta) => {
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      setCart(cart.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          if (newQuantity > product.stock) {
            alert('Estoque insuficiente');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0));
    };

    const removeItem = (id) => {
      setCart(cart.filter(item => item.id !== id));
    };

    const getTotal = () => {
      return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tech Store</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">Olá, {user.name}</span>
              <Button variant="outline" size="sm" onClick={() => {
                setUser(null);
                setCart([]);
                localStorage.removeItem('mockUser');
                localStorage.removeItem('mockCart');
                setCurrentStep('auth');
              }}>
                Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Produtos Disponíveis</h2>
              
              {loadingProducts ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-16 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                      </CardHeader>
                      <CardFooter>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {MOCK_PRODUCTS.map(product => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="text-5xl mb-2">{product.image}</div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="text-2xl font-bold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </CardDescription>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Sem estoque</Badge>
                        ) : product.stock < 5 ? (
                          <Badge variant="outline" className="text-orange-600">
                            Últimas {product.stock} unidades
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            Em estoque
                          </Badge>
                        )}
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          onClick={() => addToCart(product)} 
                          className="w-full"
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? (
                            'Indisponível'
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar ao Carrinho
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Carrinho vazio</p>
                      <p className="text-sm text-gray-400 mt-2">Adicione produtos para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 pb-3 border-b last:border-b-0">
                          <span className="text-2xl">{item.image}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label={`Diminuir quantidade de ${item.name}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center" aria-label={`Quantidade: ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label={`Aumentar quantidade de ${item.name}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remover ${item.name} do carrinho`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">R$ {getTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                {cart.length > 0 && (
                  <CardFooter>
                    <Button onClick={() => {
                      setCurrentStep('checkout');
                      setCheckoutStep(1);
                    }} className="w-full">
                      Ir para Checkout
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de Checkout
  const CheckoutScreen = () => {
    const [errors, setErrors] = useState({});

    const getTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const validateBuyerData = () => {
      const newErrors = {};
      
      if (!buyerData.name) newErrors.name = 'Nome é obrigatório';
      if (!buyerData.email) newErrors.email = 'Email é obrigatório';
      if (!buyerData.cpf) newErrors.cpf = 'CPF é obrigatório';
      if (!buyerData.phone) newErrors.phone = 'Telefone é obrigatório';
      if (!buyerData.zipCode) newErrors.zipCode = 'CEP é obrigatório';
      if (!buyerData.address) newErrors.address = 'Endereço é obrigatório';
      if (!buyerData.number) newErrors.number = 'Número é obrigatório';
      if (!buyerData.city) newErrors.city = 'Cidade é obrigatória';
      if (!buyerData.state) newErrors.state = 'Estado é obrigatório';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleBuyerDataSubmit = () => {
      if (validateBuyerData()) {
        setCheckoutStep(2);
      }
    };

    const validatePaymentData = () => {
      if (!paymentMethod) {
        alert('Selecione um método de pagamento');
        return false;
      }

      if (paymentMethod === 'card') {
        if (!paymentData.number || !paymentData.name || !paymentData.expiry || !paymentData.cvv) {
          alert('Preencha todos os dados do cartão');
          return false;
        }
      }

      return true;
    };

    const handlePaymentSubmit = () => {
      if (validatePaymentData()) {
        setCheckoutStep(3);
      }
    };

    const confirmOrder = () => {
      setProcessing(true);
      setOrderStatus('processing');

      setTimeout(() => {
        const outcomes = ['paid', 'paid', 'paid', 'failed', 'expired'];
        const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        setOrderStatus(randomOutcome);
        setProcessing(false);

        if (randomOutcome === 'paid') {
          setCart([]);
          localStorage.removeItem('mockCart');
        }
      }, 3000);
    };

    // Status da compra
    if (orderStatus) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              {orderStatus === 'processing' && (
                <>
                  <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
                  <CardTitle>Processando Pagamento</CardTitle>
                  <CardDescription>Aguarde enquanto confirmamos seu pagamento...</CardDescription>
                </>
              )}
              {orderStatus === 'paid' && (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <CardTitle className="text-green-600">Pagamento Confirmado!</CardTitle>
                  <CardDescription>Seu pedido #{Date.now().toString().slice(-6)} foi processado com sucesso</CardDescription>
                </>
              )}
              {orderStatus === 'failed' && (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <CardTitle className="text-red-600">Pagamento Recusado</CardTitle>
                  <CardDescription>Não foi possível processar seu pagamento. Verifique seus dados e tente novamente.</CardDescription>
                </>
              )}
              {orderStatus === 'expired' && (
                <>
                  <Clock className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                  <CardTitle className="text-orange-600">Pagamento Expirado</CardTitle>
                  <CardDescription>O prazo para pagamento expirou. Por favor, inicie um novo processo.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              {orderStatus === 'paid' && (
                <Button onClick={() => {
                  setCurrentStep('products');
                  setOrderStatus(null);
                  setPaymentMethod('');
                  setCheckoutStep(1);
                }} className="w-full">
                  Continuar Comprando
                </Button>
              )}
              {(orderStatus === 'failed' || orderStatus === 'expired') && (
                <>
                  <Button onClick={() => {
                    setOrderStatus(null);
                    setCheckoutStep(2);
                  }} className="w-full">
                    Tentar Novamente
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setCurrentStep('products');
                    setOrderStatus(null);
                    setCheckoutStep(1);
                  }} className="w-full">
                    Voltar ao Carrinho
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => {
              if (checkoutStep > 1) {
                setCheckoutStep(checkoutStep - 1);
              } else {
                setCurrentStep('products');
              }
            }}>
              ← Voltar
            </Button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className={`flex-1 text-center ${checkoutStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${checkoutStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="text-xs sm:text-sm">Dados</span>
              </div>
              <div className={`flex-1 h-1 ${checkoutStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex-1 text-center ${checkoutStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${checkoutStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="text-xs sm:text-sm">Pagamento</span>
              </div>
              <div className={`flex-1 h-1 ${checkoutStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex-1 text-center ${checkoutStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${checkoutStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="text-xs sm:text-sm">Revisão</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {/* Step 1: Dados do Comprador */}
              {checkoutStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Dados do Comprador
                    </CardTitle>
                    <CardDescription>Confirme seus dados para entrega</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyerName">Nome Completo *</Label>
                        <Input
                          id="buyerName"
                          value={buyerData.name || ''}
                          onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                          aria-required="true"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buyerEmail">Email *</Label>
                        <Input
                          id="buyerEmail"
                          type="email"
                          value={buyerData.email || ''}
                          onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                          aria-required="true"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyerCpf">CPF *</Label>
                        <Input
                          id="buyerCpf"
                          placeholder="000.000.000-00"
                          value={buyerData.cpf || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = value;
                            if (value.length > 9) {
                              formatted = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`;
                            } else if (value.length > 6) {
                              formatted = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
                            } else if (value.length > 3) {
                              formatted = `${value.slice(0, 3)}.${value.slice(3)}`;
                            }
                            setBuyerData({ ...buyerData, cpf: formatted });
                          }}
                          maxLength="14"
                          aria-required="true"
                          className={errors.cpf ? 'border-red-500' : ''}
                        />
                        {errors.cpf && <p className="text-xs text-red-500">{errors.cpf}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buyerPhone">Telefone *</Label>
                        <Input
                          id="buyerPhone"
                          placeholder="(11) 98765-4321"
                          value={buyerData.phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = value;
                            if (value.length > 10) {
                              formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                            } else if (value.length > 6) {
                              formatted = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
                            } else if (value.length > 2) {
                              formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                            }
                            setBuyerData({ ...buyerData, phone: formatted });
                          }}
                          maxLength="15"
                          aria-required="true"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Endereço de Entrega
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">CEP *</Label>
                          <Input
                            id="zipCode"
                            placeholder="00000-000"
                            value={buyerData.zipCode || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              const formatted = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5, 8)}` : value;
                              setBuyerData({ ...buyerData, zipCode: formatted });
                            }}
                            maxLength="9"
                            aria-required="true"
                            className={errors.zipCode ? 'border-red-500' : ''}
                          />
                          {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode}</p>}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Endereço *</Label>
                            <Input
                              id="address"
                              placeholder="Rua, Avenida..."
                              value={buyerData.address || ''}
                              onChange={(e) => setBuyerData({ ...buyerData, address: e.target.value })}
                              aria-required="true"
                              className={errors.address ? 'border-red-500' : ''}
                            />
                            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="number">Número *</Label>
                            <Input
                              id="number"
                              placeholder="123"
                              value={buyerData.number || ''}
                              onChange={(e) => setBuyerData({ ...buyerData, number: e.target.value })}
                              aria-required="true"
                              className={errors.number ? 'border-red-500' : ''}
                            />
                            {errors.number && <p className="text-xs text-red-500">{errors.number}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            placeholder="Apt, Bloco..."
                            value={buyerData.complement || ''}
                            onChange={(e) => setBuyerData({ ...buyerData, complement: e.target.value })}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Cidade *</Label>
                            <Input
                              id="city"
                              placeholder="São Paulo"
                              value={buyerData.city || ''}
                              onChange={(e) => setBuyerData({ ...buyerData, city: e.target.value })}
                              aria-required="true"
                              className={errors.city ? 'border-red-500' : ''}
                            />
                            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">Estado *</Label>
                            <Input
                              id="state"
                              placeholder="SP"
                              maxLength="2"
                              value={buyerData.state || ''}
                              onChange={(e) => setBuyerData({ ...buyerData, state: e.target.value.toUpperCase() })}
                              aria-required="true"
                              className={errors.state ? 'border-red-500' : ''}
                            />
                            {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleBuyerDataSubmit} className="w-full">
                      Continuar para Pagamento
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 2: Método de Pagamento */}
              {checkoutStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                    <CardDescription>Selecione como deseja pagar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pix">
                          <QrCode className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Pix</span>
                        </TabsTrigger>
                        <TabsTrigger value="card">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Cartão</span>
                        </TabsTrigger>
                        <TabsTrigger value="boleto">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Boleto</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="pix" className="mt-6">
                        <div className="space-y-4">
                          <div className="bg-white p-6 rounded-lg border text-center">
                            <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code com seu banco</p>
                            <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                              00020126580014BR.GOV.BCB.PIX0136{Math.random().toString(36).substring(2, 15)}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => {
                              navigator.clipboard.writeText(`00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}`);
                              alert('Código Pix copiado!');
                            }}>
                              Copiar Código
                            </Button>
                          </div>
                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              O pagamento via Pix expira em 30 minutos. Após o pagamento, a confirmação é instantânea.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </TabsContent>

                      <TabsContent value="card" className="mt-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Número do Cartão *</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                              value={paymentData.number || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '');
                                const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                setPaymentData({ ...paymentData, number: formatted });
                              }}
                              aria-required="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardName">Nome no Cartão *</Label>
                            <Input
                              id="cardName"
                              placeholder="JOÃO SILVA"
                              value={paymentData.name || ''}
                              onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value.toUpperCase() })}
                              aria-required="true"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiry">Validade *</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/AA"
                                maxLength="5"
                                value={paymentData.expiry || ''}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }
                                  setPaymentData({ ...paymentData, expiry: value });
                                }}
                                aria-required="true"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                maxLength="3"
                                type="password"
                                value={paymentData.cvv || ''}
                                onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                                aria-required="true"
                              />
                            </div>
                          </div>
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Seus dados estão seguros. Não armazenamos informações do cartão.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </TabsContent>

                      <TabsContent value="boleto" className="mt-6">
                        <div className="space-y-4">
                          <Alert>
                            <FileText className="h-4 w-4" />
                            <AlertDescription>
                              O boleto será gerado após a confirmação e estará disponível para download. 
                              O prazo de pagamento é de até 3 dias úteis.
                            </AlertDescription>
                          </Alert>
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="font-semibold mb-2">Informações do Boleto:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Vencimento: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</li>
                              <li>• Valor: R$ {getTotal().toFixed(2)}</li>
                              <li>• Após o pagamento, a confirmação pode levar até 2 dias úteis</li>
                              <li>• Você receberá o boleto por email</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={!paymentMethod}
                      className="w-full"
                    >
                      Continuar para Revisão
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 3: Revisão */}
              {checkoutStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revisão do Pedido</CardTitle>
                    <CardDescription>Confira todos os dados antes de finalizar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Dados Pessoais
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                        <p><strong>Nome:</strong> {buyerData.name}</p>
                        <p><strong>Email:</strong> {buyerData.email}</p>
                        <p><strong>CPF:</strong> {buyerData.cpf}</p>
                        <p><strong>Telefone:</strong> {buyerData.phone}</p>
                      </div>
                      <Button variant="link" size="sm" className="mt-2" onClick={() => setCheckoutStep(1)}>
                        Editar
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Endereço de Entrega
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                        <p>{buyerData.address}, {buyerData.number}</p>
                        {buyerData.complement && <p>{buyerData.complement}</p>}
                        <p>{buyerData.city} - {buyerData.state}</p>
                        <p>CEP: {buyerData.zipCode}</p>
                      </div>
                      <Button variant="link" size="sm" className="mt-2" onClick={() => setCheckoutStep(1)}>
                        Editar
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        {paymentMethod === 'pix' && <QrCode className="w-4 h-4" />}
                        {paymentMethod === 'card' && <CreditCard className="w-4 h-4" />}
                        {paymentMethod === 'boleto' && <FileText className="w-4 h-4" />}
                        Forma de Pagamento
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        {paymentMethod === 'pix' && <p>Pagamento via <strong>Pix</strong></p>}
                        {paymentMethod === 'card' && (
                          <>
                            <p>Cartão de Crédito</p>
                            <p className="text-gray-600 mt-1">•••• •••• •••• {paymentData.number?.slice(-4)}</p>
                          </>
                        )}
                        {paymentMethod === 'boleto' && <p>Pagamento via <strong>Boleto Bancário</strong></p>}
                      </div>
                      <Button variant="link" size="sm" className="mt-2" onClick={() => setCheckoutStep(2)}>
                        Editar
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Itens do Pedido
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Ao confirmar, você concorda com nossos termos de uso e política de privacidade.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={confirmOrder} disabled={processing} className="w-full">
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Confirmar Pedido'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Resumo Lateral */}
            <div className="md:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>R$ {getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frete:</span>
                      <span className="text-green-600">Grátis</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderização principal
  if (!user) {
    return <AuthScreen />;
  }

  if (currentStep === 'products') {
    return <ProductsScreen />;
  }

  if (currentStep === 'checkout') {
    return <CheckoutScreen />;
  }

  return null;
};

export default CheckoutApp;