'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { RefreshCw, Link as LinkIcon, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface SyncResult {
  matched: number;
  created: number;
  failed: number;
  skipped: number;
  details: { slug: string; status: string; reason?: string; variantId?: string }[];
}

export default function ShopifySyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const [tokenSet, setTokenSet] = useState(false);

  const handleConnect = () => {
    window.location.href = '/api/shopify/auth';
  };

  const handleSync = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const adminToken = localStorage.getItem('admin_token');
      const res = await fetch('/api/shopify/sync', {
        method: 'POST',
        headers: { ...(adminToken && { Authorization: `Bearer ${adminToken}` }) },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sync failed');
      } else {
        setResult(data.results);
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0b2a17]">Shopify Product Sync</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Push Supabase products to Shopify and sync variant IDs back.
          </p>
        </div>

        {/* Step 1: Connect */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-1">Step 1 — Connect Shopify</h2>
          <p className="text-sm text-gray-500 mb-4">
            Authorize access to <strong>tazoota.myshopify.com</strong>. After authorizing, you'll receive an
            access token — add it to your Vercel environment variables as{' '}
            <code className="bg-gray-100 px-1 rounded">SHOPIFY_API_ACCESS_TOKEN</code>.
          </p>
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 bg-[#0b2a17] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#1a4a2e] transition-colors"
          >
            <LinkIcon className="h-4 w-4" /> Connect to Shopify
          </button>
        </div>

        {/* Step 2: Sync */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-1">Step 2 — Run Sync</h2>
          <p className="text-sm text-gray-500 mb-4">
            Once <code className="bg-gray-100 px-1 rounded">SHOPIFY_API_ACCESS_TOKEN</code> is set in Vercel,
            click Sync. This will:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1">
            <li>Match existing Shopify products by title → save variant ID to Supabase</li>
            <li>Create missing products in Shopify → save new variant ID to Supabase</li>
            <li>Set <code className="bg-gray-100 px-1 rounded">checkout_flow = 'shopify'</code> on all synced products</li>
          </ul>
          <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? 'Syncing...' : 'Run Sync'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg">Sync Results</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Matched', value: result.matched, color: 'text-blue-600' },
                { label: 'Created', value: result.created, color: 'text-green-600' },
                { label: 'Failed', value: result.failed, color: 'text-red-600' },
                { label: 'Skipped', value: result.skipped, color: 'text-gray-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1">
              {result.details.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-gray-50 text-sm">
                  {d.status === 'matched' && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                  {d.status === 'created' && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                  {d.status === 'failed' && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                  {d.status === 'skipped' && <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                  <span className="font-mono text-xs text-gray-600 flex-1 truncate">{d.slug}</span>
                  <span className={`text-xs font-medium ${
                    d.status === 'matched' ? 'text-blue-600' :
                    d.status === 'created' ? 'text-green-600' :
                    d.status === 'failed' ? 'text-red-600' : 'text-gray-400'
                  }`}>{d.status}</span>
                  {d.variantId && <span className="text-xs text-gray-400 font-mono">{d.variantId}</span>}
                  {d.reason && <span className="text-xs text-red-400">{d.reason}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
