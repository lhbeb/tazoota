'use client';

import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { RefreshCw, Download, Upload, CheckCircle, XCircle, AlertCircle, Play, Link as LinkIcon } from 'lucide-react';

interface SyncResult {
  updated?: number;
  matched?: number;
  created?: number;
  failed?: number;
  notFound?: number;
  skipped?: number;
  details: { slug?: string; key?: string; title?: string; status: string; reason?: string; variantId?: string; error?: string }[];
}

export default function ShopifySyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const adminToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('admin_token') || '';
    return '';
  };

  // Step 1: Export Supabase → Shopify CSV
  const handleExport = () => {
    const token = adminToken();
    const a = document.createElement('a');
    a.href = `/api/shopify/export-csv`;
    a.download = 'tazoota-shopify-import.csv';
    // Pass token via cookie (already set) — just trigger download
    fetch('/api/shopify/export-csv', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => setError('Export failed'));
  };

  // Step 3: Import Shopify export CSV → populate variant IDs in Supabase
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/shopify/import-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import failed');
      } else {
        setResult(data.results);
      }
    } catch {
      setError('Network error during import');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Step 2b: Run API sync (if token is set)
  const handleApiSync = async () => {
    setSyncing(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/shopify/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Sync failed');
      else setResult(data.results);
    } catch {
      setError('Network error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0b2a17]">Shopify Product Sync</h1>
          <p className="text-gray-500 mt-1 text-sm">Push Supabase products to Shopify and sync variant IDs back.</p>
        </div>

        {/* Route A: CSV export/import */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-lg">Route A — CSV Export / Import (Recommended)</h2>

          {/* Step 1 */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <p className="font-medium text-sm text-gray-800">Step 1 — Export products as Shopify CSV</p>
            <p className="text-xs text-gray-500">Downloads a CSV formatted for Shopify product import.</p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#0b2a17] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a4a2e] transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV for Shopify
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <p className="font-medium text-sm text-gray-800">Step 2 — Import into Shopify</p>
            <p className="text-xs text-gray-500">
              Go to <strong>tazoota.myshopify.com/admin/products</strong> → <strong>Import</strong> → upload the CSV.
              Shopify will create the products and assign variant IDs.
            </p>
            <p className="text-xs text-gray-500">
              Then go to <strong>Products → Export → All products → CSV for Excel</strong> and download the export.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <p className="font-medium text-sm text-gray-800">Step 3 — Upload Shopify export CSV here</p>
            <p className="text-xs text-gray-500">
              Upload the CSV Shopify gave you after import. This reads variant IDs and saves them to Supabase.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'Importing...' : 'Upload Shopify Export CSV'}
            </button>
          </div>
        </div>

        {/* Route B: Direct API sync */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-lg">Route B — Direct API Sync</h2>
          <p className="text-sm text-gray-500">
            Requires <code className="bg-gray-100 px-1 rounded">SHOPIFY_API_ACCESS_TOKEN</code> set in Vercel env vars.
            First authorize via{' '}
            <a href="/api/shopify/auth" className="text-blue-600 underline">/api/shopify/auth</a>.
          </p>
          <div className="flex gap-3">
            <a
              href="/api/shopify/auth"
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <LinkIcon className="h-4 w-4" /> Connect Shopify
            </a>
            <button
              onClick={handleApiSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {syncing ? 'Syncing...' : 'Run API Sync'}
            </button>
          </div>
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
            <h2 className="font-semibold text-lg">Results</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Updated', value: result.updated ?? result.matched ?? 0, color: 'text-green-600' },
                { label: 'Created', value: result.created ?? 0, color: 'text-blue-600' },
                { label: 'Not Found', value: result.notFound ?? 0, color: 'text-yellow-600' },
                { label: 'Failed', value: result.failed ?? 0, color: 'text-red-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {result.details.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-gray-50 text-sm">
                  {d.status === 'updated' && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                  {d.status === 'not_found' && <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                  {d.status === 'error' && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                  <span className="font-mono text-xs text-gray-600 flex-1 truncate">{d.slug || d.key || d.title}</span>
                  <span className={`text-xs font-medium ${
                    d.status === 'updated' ? 'text-green-600' :
                    d.status === 'not_found' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{d.status}</span>
                  {d.variantId && <span className="text-xs text-gray-400 font-mono">{d.variantId}</span>}
                  {d.error && <span className="text-xs text-red-400">{d.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
