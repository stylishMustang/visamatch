'use client';
import { useEffect, useState } from 'react';
// refer to https://developer.paddle.com/paddlejs/methods/paddle-checkout-open
// Define Paddle type to fix TypeScript errors

export default function NewPage() {
  const [isPaddleLoaded, setIsPaddleLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Your Paddle vendor ID should be a number
  const PADDLE_VENDOR_ID = 222999; // Replace with your actual vendor ID

  useEffect(() => {
    // Check if Paddle is already loaded
    if (window.Paddle) {
      initializePaddle();
      return;
    }

    // Dynamically load Paddle.js
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;

    script.onload = () => {
      initializePaddle();
    };

    // Append the script tag to the document head
    document.head.appendChild(script);

    // Cleanup the script after component unmounts
    return () => {
      // Only remove if it's the script we added
      const paddleScript = document.querySelector('script[src*="paddle.com"]');
      if (paddleScript && paddleScript.parentNode) {
        paddleScript.parentNode.removeChild(paddleScript);
      }
    };
  }, []);

  // Initialize Paddle with proper error checking
  const initializePaddle = () => {
    if (typeof window !== 'undefined' && window.Paddle) {
      try {
        // For Paddle Classic, use Paddle.Setup with vendor ID
        window.Paddle.Initialize({
          token: 'live_9606674b1ce6876277fe92ee313',
          eventCallback: (data: any) => {
            console.log('Paddle event:', data);
            if (data.event === 'Checkout.Close') {
              setIsProcessing(false);
            }
          },
        });
        setIsPaddleLoaded(true);
        console.log('Paddle Classic initialized successfully');
      } catch (error) {
        console.error('Error initializing Paddle:', error);
      }
    }
  };

  const handleCheckout = () => {
    if (!isPaddleLoaded || isProcessing) {
      console.log('Paddle not loaded or processing already in progress');
      return;
    }

    setIsProcessing(true);
    const items = [
      {
        priceId: 'pri_01jthq77the6v5w6svppa4e1pr',
        quantity: 1,
      },
    ];

    try {
      if (typeof window !== 'undefined' && window.Paddle && window.Paddle.Checkout) {
        // For Paddle Classic, we use product IDs not price IDs
        window.Paddle.Checkout.open({
          items: items,
          settings: {
            displayMode: 'overlay',
            variant: 'one-page',
          }, // Replace with your actual product ID
          // Optional custom data
        });
      } else {
        throw new Error('Paddle SDK not fully loaded');
      }
    } catch (error) {
      console.error('Error opening Paddle checkout:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold mb-4">Payment Page</h1>

      <button
        onClick={handleCheckout}
        disabled={!isPaddleLoaded || isProcessing}
        className={`px-6 py-3 rounded-md ${
          !isPaddleLoaded || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        } text-white transition-colors`}
      >
        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
      </button>

      {/* This container is for inline mode if you decide to use it */}
      <div id="checkout-container" className="w-full max-w-lg"></div>
    </div>
  );
}
