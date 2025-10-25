'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Check, QrCode } from 'lucide-react';
import { PaymentMethod } from '@/lib/orders';

interface PaymentFormProps {
  method: PaymentMethod;
  total: number;
  onSubmit: (paymentDetails: any) => void;
  isProcessing: boolean;
}

export const PixPaymentForm = ({ total, onSubmit, isProcessing }: PaymentFormProps) => {
  const [copied, setCopied] = useState(false);
  
  // Mock Pix code
  const pixCode = '00020126360014BR.GOV.BCB.PIX0114+55119999999990204000053039865802BR5925CHECKOUT PRO LTDA6009SAO PAULO62070503***63041D3D';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirm = () => {
    onSubmit({
      pixCode,
      pixQrCode: 'data:image/png;base64,mock-qr-code',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via Pix</CardTitle>
        <CardDescription>
          Escaneie o QR Code ou copie o código Pix para pagar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="inline-block p-6 bg-muted rounded-lg mb-4">
            <QrCode className="w-48 h-48 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Escaneie este QR Code com o app do seu banco
          </p>
        </div>

        <div className="space-y-2">
          <Label>Código Pix</Label>
          <div className="flex gap-2">
            <Input
              value={pixCode}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Atenção:</strong> Este Pix expira em 30 minutos
          </p>
        </div>

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="font-medium">Total a pagar</span>
          <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(total)}
          </span>
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full"
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando pagamento...
            </>
          ) : (
            'Já fiz o pagamento'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export const CreditCardPaymentForm = ({ total, onSubmit, isProcessing }: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      return;
    }

    onSubmit({
      cardLastDigits: cardNumber.replace(/\s/g, '').slice(-4),
    });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento com Cartão de Crédito</CardTitle>
        <CardDescription>
          Preencha os dados do seu cartão de crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Número do cartão</Label>
            <Input
              id="card-number"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              disabled={isProcessing}
              autoComplete="cc-number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-name">Nome no cartão</Label>
            <Input
              id="card-name"
              placeholder="NOME COMO NO CARTÃO"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              disabled={isProcessing}
              autoComplete="cc-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Validade</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength={5}
                disabled={isProcessing}
                autoComplete="cc-exp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                maxLength={4}
                disabled={isProcessing}
                autoComplete="cc-csc"
              />
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Total a pagar</span>
            <span className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(total)}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isProcessing || !cardNumber || !cardName || !expiryDate || !cvv}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando pagamento...
              </>
            ) : (
              'Confirmar pagamento'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const BoletoPaymentForm = ({ total, onSubmit, isProcessing }: PaymentFormProps) => {
  const [copied, setCopied] = useState(false);
  
  // Mock boleto code
  const boletoCode = '23790.00000 00000.000000 00000.000000 0 00000000000000';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boletoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirm = () => {
    onSubmit({
      boletoCode,
      boletoUrl: 'https://example.com/boleto.pdf',
    });
  };

  const handleDownloadBoleto = () => {
    window.open('https://example.com/boleto.pdf', '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via Boleto Bancário</CardTitle>
        <CardDescription>
          Copie o código de barras ou baixe o boleto para pagar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Código de barras</Label>
          <div className="flex gap-2">
            <Input
              value={boletoCode}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Atenção:</strong> O boleto vence em 3 dias úteis. Após o pagamento,
            pode levar até 2 dias úteis para compensação.
          </p>
        </div>

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="font-medium">Total a pagar</span>
          <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(total)}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadBoleto}
        >
          Baixar boleto PDF
        </Button>

        <Button
          onClick={handleConfirm}
          className="w-full"
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando boleto...
            </>
          ) : (
            'Confirmar e gerar boleto'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};