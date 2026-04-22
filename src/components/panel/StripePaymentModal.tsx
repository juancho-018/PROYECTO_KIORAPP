import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { alertService } from '@/config/setup';

// Nota: Esta es una llave pública de prueba de Stripe.
// En producción, debe provenir de variables de entorno (ej. import.meta.env.VITE_STRIPE_PUBLIC_KEY)
const stripePromise = loadStripe('pk_test_51O1234567890abcdefghijklmnopqrstuvwxyz');

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function StripePaymentForm({ amount, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // Aquí normalmente harías una petición a tu backend para crear un PaymentIntent
    // y obtener el client_secret. Como estamos simulando la parte de validación frontend:
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        alertService.showToast('error', error.message || 'Error al procesar la tarjeta');
        setLoading(false);
      } else {
        // Pago simulado exitoso (se creó el método de pago)
        console.log('[Stripe] PaymentMethod creado:', paymentMethod);
        alertService.showToast('success', 'Pago con tarjeta aprobado');
        onSuccess();
      }
    } catch (err) {
      alertService.showToast('error', 'Error inesperado con la pasarela de pago');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': { color: '#94a3b8' },
              },
              invalid: { color: '#ef4444' },
            },
            hidePostalCode: true
          }} 
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all font-[Inter]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 rounded-2xl bg-[#0070ba] py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-[#005ea6] disabled:opacity-60 transition-all active:scale-95 font-[Inter] flex items-center justify-center gap-2"
        >
          {loading ? (
             <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Pagar ${(amount).toLocaleString('es-CO')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export interface StripePaymentModalProps {
  isOpen: boolean;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function StripePaymentModal({ isOpen, amount, onSuccess, onClose }: StripePaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Pago con Tarjeta</h2>
          <p className="text-slate-500 text-sm mt-1">Ingresa los datos de tu tarjeta (Stripe)</p>
        </div>

        <Elements stripe={stripePromise}>
          <StripePaymentForm amount={amount} onSuccess={onSuccess} onCancel={onClose} />
        </Elements>

        <p className="text-center text-[10px] font-bold text-slate-400 mt-6 flex items-center justify-center gap-1">
          <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          PAGOS 100% SEGUROS Y CIFRADOS
        </p>
      </div>
    </div>
  );
}
