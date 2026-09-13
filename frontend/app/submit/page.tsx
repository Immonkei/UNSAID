import SubmitForm from '../../components/SubmitForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to thoughts</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-light text-neutral-100">
          Leave It Here
        </h1>
        <p className="text-sm text-neutral-400">
          Whatever you couldn&apos;t say out loud, write it down. No registration required.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
}
