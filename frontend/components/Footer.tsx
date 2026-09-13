export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-12 text-center text-neutral-500 text-xs">
      <div className="max-w-4xl mx-auto px-4 space-y-3">
        <p className="font-serif italic text-neutral-400 text-sm">
          &ldquo;Nobody knows it&apos;s me, but someone might understand.&rdquo;
        </p>
        <p className="text-neutral-500">
          UNSAID is completely anonymous. We never collect or publish your identity.
        </p>
        <p className="text-neutral-500 text-[11px]">
          &copy; {new Date().getFullYear()} UNSAID. All approved thoughts belong to the collective emotional archive.
        </p>
      </div>
    </footer>
  );
}
