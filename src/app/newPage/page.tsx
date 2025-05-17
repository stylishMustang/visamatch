'use client';

import { useEffect, useState } from 'react';
import { initializePaddle, Environments, Paddle } from '@paddle/paddle-js';
import React from 'react';

// Define the structure of your items for type safety
interface CheckoutItem {
  priceId: string;
  quantity: number;
}

export default function NewPage() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isPaddleLoaded, setIsPaddleLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV as Environments;

    if (!clientToken) {
      const errMsg =
        'Paddle Client Token (NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) is not set. Please check your environment variables.';
      console.error(errMsg);
      setError(errMsg);
      return;
    }
    if (!environment || !['sandbox', 'production'].includes(environment)) {
      const errMsg =
        'Paddle Environment (NEXT_PUBLIC_PADDLE_ENV) is not set or invalid (must be "sandbox" or "production"). Please check your environment variables.';
      console.error(errMsg);
      setError(errMsg);
      return;
    }

    console.log('Attempting to initialize Paddle SDK...');
    setError(null); // Clear previous errors

    initializePaddle({
      token: clientToken,
      environment: environment,
      checkout: {
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: '/checkout/success', // IMPORTANT: Create this page or change URL
          // locale: 'en', // Optional: set a specific locale
          // allowedPaymentMethods: ['card', 'paypal'], // Optional: specify allowed methods
        },
      },
      eventCallback: (data: any) => {
        console.log('Paddle Event:', data);
        switch (data.name) {
          case 'checkout.loaded':
            console.log('Checkout UI has loaded.');
            break;
          case 'checkout.closed':
            console.log('Checkout was closed by the user.');
            setIsProcessing(false);
            break;
          case 'checkout.completed':
            console.log('Checkout completed successfully! Transaction ID:', data.data?.transaction_id);
            // Paddle will redirect to successUrl if set.
            // You can add other client-side logic here if needed,
            // e.g., updating UI, clearing cart, etc.
            setIsProcessing(false);
            // Potentially redirect programmatically if successUrl isn't reliable or for other reasons
            // router.push('/checkout/success');
            break;
          case 'checkout.payment_failed':
            // More specific type assertion for payment_failed event data
            interface PaymentFailedEventData {
              error?: {
                type?: string;
                code?: string;
                detail?: string;
                help_url?: string;
              };
              // other properties that might exist on data.data for this event
            }
            const eventData = data.data as PaymentFailedEventData | undefined;
            console.error('Checkout payment failed:', eventData?.error);
            setError(`Payment failed: ${eventData?.error?.detail || 'Unknown payment error. Check console.'}`);
            setIsProcessing(false);
            break;
          // You can add more event handlers here if needed
        }
      },
    })
      .then((paddleInstance) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
          setIsPaddleLoaded(true);
          console.log('Paddle SDK initialized successfully.');
        } else {
          const errMsg = 'Paddle initialization resolved but paddleInstance is null or undefined.';
          console.error(errMsg);
          setError(errMsg);
        }
      })
      .catch((initError) => {
        console.error('Failed to initialize Paddle SDK:', initError);
        setError(`Failed to initialize Paddle SDK: ${initError.message || 'Unknown error'}`);
      });

    // No specific cleanup needed for Paddle.js v2 initialization
  }, []); // Empty dependency array ensures this runs once on mount

  const handleCheckout = async () => {
    if (!paddle || !isPaddleLoaded) {
      const warnMsg = 'Paddle SDK is not loaded or initialized yet. Please wait or check console for errors.';
      console.warn(warnMsg);
      setError(warnMsg); // Show feedback to user
      return;
    }
    if (isProcessing) {
      console.warn('Checkout is already in progress.');
      return;
    }

    setIsProcessing(true);
    setError(null); // Clear previous errors
    console.log('Opening Paddle Checkout...');

    const checkoutItems: CheckoutItem[] = [
      {
        // Ensure this is your ACTUAL PADDLE SANDBOX PRICE ID
        priceId: 'pri_01jtm9agb3t9wcymyr8rb2p1jp',
        quantity: 1,
      },
    ];

    try {
      paddle.Checkout.open({
        items: checkoutItems,
        // You can also pass customer data if available
        // customer: { email: 'customer@example.com' },
        // customData: { userId: 'your-internal-user-id' }, // Optional
      });
      // For 'overlay' mode, .open() is non-blocking.
      // Event callback and successUrl handle the flow.
    } catch (checkoutError: any) {
      console.error('Error trying to open Paddle Checkout:', checkoutError);
      setError(`Error opening checkout: ${checkoutError.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  let buttonText = 'Malak to Payment';
  if (error) {
    buttonText = 'Error Initializing Payment';
  } else if (!isPaddleLoaded) {
    buttonText = 'Initializing Payment...';
  } else if (isProcessing) {
    buttonText = 'Processing...';
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Complete Your Purchase</h1>

        {/* You can add product details here if needed */}
        <div className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-lg font-semibold text-gray-700">Unlock Full Job Access</p>
          <p className="text-2xl text-blue-600 font-bold mt-1">One-Time Payment</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            <p className="font-semibold">Payment System Error:</p>
            <p>{error}</p>
            {error.includes('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN') && (
              <p>
                Please ensure it is set in your <code>.env.local</code> file.
              </p>
            )}
            {error.includes('priceId') && (
              <p>
                Update the <code>priceId</code> in <code>src/app/newPage/page.tsx</code>.
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={!isPaddleLoaded || isProcessing || !!error}
          className={`w-full px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-4
            ${
              !isPaddleLoaded || isProcessing || !!error
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-300 active:bg-green-800'
            }
          `}
        >
          {buttonText}
        </button>

        {!isPaddleLoaded && !error && (
          <p className="mt-6 text-sm text-gray-500 animate-pulse">Connecting to payment gateway...</p>
        )}

        <p className="mt-8 text-xs text-gray-400">
          Powered by{' '}
          <a
            href="https://paddle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Paddle
          </a>
        </p>
      </div>
    </div>
  );
}
