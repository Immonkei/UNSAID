'use client';

import { useState, useEffect } from 'react';
import { Flame, Sparkles, HeartHandshake } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function CandleVigil() {
  const [totalCandles, setTotalCandles] = useState<number>(0);
  const [hasLit, setHasLit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      try {
        const data = await api.getCandleStatus();
        if (mounted) {
          setTotalCandles(data.totalCandles);
          setHasLit(data.hasLit);
        }
      } catch {
        // Silent fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);

    const prevLit = hasLit;
    const prevCount = totalCandles;
    const nextLit = !hasLit;
    const nextCount = nextLit ? prevCount + 1 : Math.max(0, prevCount - 1);

    setHasLit(nextLit);
    setTotalCandles(nextCount);

    if (nextLit) {
      toast('You lit a silent candle in the quiet.', {
        icon: '🕯️',
        description: 'For anyone carrying what cannot be said. You are not alone.',
      });
    } else {
      toast('Your candle flame rested.', {
        description: 'You can light it again whenever you return.',
      });
    }

    try {
      const res = await api.toggleCandle();
      setHasLit(res.hasLit);
      setTotalCandles(res.totalCandles);
    } catch {
      setHasLit(prevLit);
      setTotalCandles(prevCount);
      toast.error('Could not light candle. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#121622]/80 via-[#0a0d14]/90 to-[#07090e]/95 border border-white/[0.09] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(124,153,184,0.06)] overflow-hidden transition-all duration-500 hover:border-[#7C99B8]/30 group">
      {/* Ambient background bloom from the candle */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          hasLit
            ? 'bg-amber-500/20 opacity-100 scale-110'
            : 'bg-[#7C99B8]/10 opacity-60 scale-90 group-hover:opacity-80'
        }`}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-2 max-w-md">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-300/90 border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Silent Vigil</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-500">Night Gathering</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-light text-neutral-100 tracking-[0.01em]">
            Leave a light for someone hurting in secret.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            Light a silent candle to tell anyone passing through tonight that their pain is heard,
            their grief is valid, and they do not walk this darkness alone.
          </p>
        </div>

        {/* Right Interactive Candle */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            disabled={loading || toggling}
            className={`group/btn relative flex items-center space-x-3 px-5 py-3 rounded-2xl border transition-all duration-500 cursor-pointer select-none active:scale-95 ${
              hasLit
                ? 'bg-gradient-to-r from-amber-950/80 to-amber-900/40 border-amber-500/40 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'bg-neutral-900/60 hover:bg-neutral-900/90 border-white/[0.1] hover:border-amber-400/40 text-neutral-300'
            }`}
          >
            {/* Animated Candle Icon with flickering glow */}
            <div className="relative flex items-center justify-center">
              <Flame
                className={`w-5 h-5 transition-all duration-500 ${
                  hasLit
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse'
                    : 'text-neutral-400 group-hover/btn:text-amber-300'
                }`}
              />
              {hasLit && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
            </div>

            <div className="text-left">
              <div className="text-xs font-medium tracking-wide">
                {hasLit ? 'Your Candle is Burning' : 'Light a Silent Candle'}
              </div>
              <div className="text-[10px] font-mono text-neutral-400 group-hover/btn:text-amber-200/80">
                {hasLit ? 'Tap to extinguish flame' : 'Send silent warmth'}
              </div>
            </div>
          </button>

          {/* Vigil Flame Count */}
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
            <HeartHandshake className="w-3.5 h-3.5 text-[#7C99B8]" />
            <span>
              <strong className="text-neutral-200 font-serif text-sm font-medium">
                {loading ? '...' : totalCandles}
              </strong>{' '}
              {totalCandles === 1 ? 'candle burning tonight' : 'candles burning tonight'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
