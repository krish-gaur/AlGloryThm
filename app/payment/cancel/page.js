import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <main className="min-h-screen relative noise flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative glass-strong rounded-2xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-white/60" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Payment cancelled</h1>
        <p className="text-white/60 mb-6">No charge was made. You can try again anytime.</p>
        <Link href="/" className="btn-ghost px-6 py-3 rounded-lg inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back home</Link>
      </div>
    </main>
  );
}
