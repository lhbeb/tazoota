"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSuccess(true);
      setEmail('');

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#1e0e8b] py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Tazoota&apos;s Project List
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Be first to discover new lawn mowers, garden equipment, power tools, and limited-time offers—useful ideas for your next project, without the inbox clutter.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-lg border-0 text-[#262626] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1e0e8b] transition-all duration-200"
                  disabled={isSubmitting || isSuccess}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="bg-[#d4da3b] text-[#1e0e8b] hover:bg-[#d4da3b]/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px] shadow-lg shadow-black/10"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1e0e8b]"></div>
                    Signing Up...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="h-5 w-5" />
                    You&apos;re In!
                  </>
                ) : (
                  <>
                    Get Early Access
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex justify-center mt-3">
                <p className="text-red-300 font-semibold bg-white/10 px-4 py-1.5 rounded-md text-sm shadow-sm backdrop-blur-sm border border-red-300/20">
                  {error}
                </p>
              </div>
            )}

            {isSuccess && (
              <div className="flex justify-center mt-3">
                <p className="text-green-300 font-semibold bg-white/10 px-4 py-1.5 rounded-md text-sm shadow-sm backdrop-blur-sm border border-green-300/20">
                  Thanks for subscribing! Check your email for confirmation.
                </p>
              </div>
            )}
          </form>

          <p className="text-white/60 text-sm mt-6 opacity-80">
            Practical updates for real projects. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection; 
