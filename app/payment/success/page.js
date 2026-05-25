'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function SuccessInner() {
  const sp = useSearchParams();
  const sessionId = sp.get('session_id');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    fetch(`/api/stripe/verify-session?session_id=${sessionId}`).then((r) => r.json()).then((d) => {
      setInfo(d.data);
      setLoading(false);
    });
  }, [sessionId]);

  return (
    <main className="min-h-screen relative noise flex items-center justify-center px-6">
      <div className="aurora w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 bg-[#0066FF]" style={{ opacity: 0.3 }} />
      <div className="relative glass-strong rounded-2xl p-12 max-w-md w-full text-center">
        {loading ? <Loader2 className="w-10 h-10 animate-spin text-[#00D4FF] mx-auto" /> : (
          <>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center mx-auto mb-6 glow-blue-strong">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Payment {info?.status === 'paid' ? 'received!' : 'processing'}</h1>
            <p className="text-white/60 mb-6">
              {info?.status === 'paid' ? `Thanks! We've confirmed $${(info.amount/100).toFixed(2)} from ${info?.email || 'you'}.` : 'Your payment is being processed.'}
            </p>
            <Link href="/" className="btn-primary px-6 py-3 rounded-lg inline-flex items-center gap-2">Back home <ArrowRight className="w-4 h-4" /></Link>
          </>
        )}
      </div>
    </main>
  );
}
export default function Page() {
  return <Suspense fallback={null}><SuccessInner /></Suspense>;
}
