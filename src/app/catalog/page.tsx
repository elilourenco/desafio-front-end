'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/auth';
import { cartService } from '../lib/cart';
import { products, Product } from '../lib/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { useToast } from '../hooks/use-toast';

export default function Catalog() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!authService.isAuthenticated()) {
      router.push('/auth');
    }
  }, [router]);

  const handleAddToCart = (product: Product) => {
    try {
      cartService.addItem(product.id, product.name, product.price, product.image);
      
      // Dispatch custom event for cart updates
      window.dispatchEvent(new Event('cart-updated'));
      
      toast({
        title: 'Produto adicionado!',
        description: `${product.name} foi adicionado ao carrinho`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o produto ao carrinho',
        variant: 'destructive',
      });
    }
  };

  const featuredProducts = products.filter(product => product.rating >= 4.5);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Catálogo de Produtos</h1>
          <p className="text-muted-foreground text-lg">
            Descubra os melhores produtos com preços incríveis
          </p>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Destaques</h2>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Mais Vendidos
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* All Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Todos os Produtos</h2>
            <div className="text-sm text-muted-foreground">
              {allProducts.length} produtos encontrados
            </div>
          </div>
          
          {allProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                Nenhum produto encontrado
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* Categories Quick Access */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(products.map(p => p.category))).map((category) => (
              <button
                key={category}
                className="p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
                onClick={() => {
                  // Scroll to category or filter products
                  const element = document.getElementById(`category-${category.toLowerCase()}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="font-medium text-foreground">{category}</div>
                <div className="text-sm text-muted-foreground">
                  {products.filter(p => p.category === category).length} produtos
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}