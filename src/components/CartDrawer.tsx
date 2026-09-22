"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Trash2, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { getCartItem, clearCart, type CartItem } from '@/utils/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState('');

  // Sync with localStorage whenever drawer opens or cart changes
  const syncCart = useCallback(() => {
    setCartItem(getCartItem());
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, [syncCart]);

  const handleClose = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartDrawerClosed'));
    }
    onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = async () => {
    if (!cartItem) return;
    setError('');
    setIsCheckingOut(true);

    try {
      const res = await fetch('/api/shopify/quick-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: cartItem.product.slug }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to generate checkout link');
      }

      // Redirect directly to Shopify — no form, no order saved
      window.location.assign(data.url);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleRemove = () => {
    clearCart();
    setCartItem(null);
  };

  const product = cartItem?.product;
  const image = product?.images?.[0] ?? null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#275e34]">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-[#e3e823]" />
            <span className="font-bold text-white text-base">Your Cart</span>
            {cartItem && (
              <span className="bg-[#e3e823] text-[#275e34] text-xs font-bold px-2 py-0.5 rounded-full">
                1
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!cartItem ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="h-9 w-9 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-700">Your cart is empty</p>
              <p className="text-sm text-gray-400">Add a product to get started.</p>
              <button
                onClick={onClose}
                className="mt-2 text-sm text-[#2e6b3e] font-semibold hover:underline"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            /* Cart item */
            <div className="p-5">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {/* Product image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-gray-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={product!.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ShoppingCart className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                    {product!.title}
                  </p>
                  {product!.brand && (
                    <p className="text-xs text-gray-400 mb-2">{product!.brand}</p>
                  )}
                  {(product as any)?.selectedSize && (
                    <p className="text-xs text-gray-500 mb-2">
                      Size: <span className="font-medium">{(product as any).selectedSize}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-[#275e34] text-base">
                      ${product!.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={handleRemove}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping note */}
              <div className="mt-4 flex items-center gap-2 text-xs text-[#2e6b3e] font-medium bg-[#f0f7f2] rounded-xl px-4 py-3 border border-[#2e6b3e]/10">
                <span>🚚</span>
                <span>Free shipping across the United States</span>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — checkout CTA */}
        {cartItem && (
          <div className="border-t border-gray-100 px-5 py-5 bg-white space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">
                ${product!.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-400">Taxes and final shipping calculated at checkout.</p>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full flex items-center justify-center gap-2.5 bg-[#275e34] hover:bg-[#1a4225] text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading checkout…
                </>
              ) : (
                <>
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </>
              )}
            </button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <span className="text-[10px] text-gray-400 flex items-center gap-1">🔒 Secure checkout</span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1">↩ 30-day returns</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
