'use client';

import { Card, CardContent } from '../components/ui/card';
import { CreditCard, QrCode, FileText } from 'lucide-react';

type PaymentMethod = 'pix' | 'credit-card' | 'boleto';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onSelectMethod 
}: PaymentMethodSelectorProps) => {
  const methods = [
    {
      id: 'pix' as const,
      name: 'Pix',
      description: 'Pagamento instantâneo',
      icon: QrCode,
    },
    {
      id: 'credit-card' as const,
      name: 'Cartão de Crédito',
      description: 'Aprovação imediata',
      icon: CreditCard,
    },
    {
      id: 'boleto' as const,
      name: 'Boleto Bancário',
      description: 'Vencimento em 3 dias',
      icon: FileText,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        
        return (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected
                ? 'ring-2 ring-primary border-primary shadow-md'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <CardContent className="p-6 text-center">
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </div>
              <h3 
                className={`font-semibold mb-1 transition-colors ${
                  isSelected ? 'text-primary' : ''
                }`}
              >
                {method.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {method.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;