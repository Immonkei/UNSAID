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
        <p className="text-neutral-500 text-[11px] flex items-center justify-center space-x-1">
          <span>&copy; {new Date().getFullYear()} UNSAID.</span>
          <span>•</span>
          <span>Developed by <span className="text-neutral-300 font-medium hover:text-[#7C99B8] transition-colors">Immonkei</span></span>
        </p>
      </div>
    </footer>
  );
}
