'use client';

import { Sparkles, Hash } from 'lucide-react';

export interface MoodTag {
  label: string;
  tag: string;
  categoryHint?: string;
}

export const POPULAR_TAGS: MoodTag[] = [
  { label: '#UnsentLetters', tag: 'UnsentLetters', categoryHint: 'Love' },
  { label: '#3AMThoughts', tag: '3AMThoughts', categoryHint: 'Overthinking' },
  { label: '#Heartache', tag: 'Heartache', categoryHint: 'Heartbreak' },
  { label: '#LettingGo', tag: 'LettingGo', categoryHint: 'Letting Go' },
  { label: '#Closure', tag: 'Closure', categoryHint: 'Regret' },
  { label: '#FirstLove', tag: 'FirstLove', categoryHint: 'Love' },
  { label: '#Forgiveness', tag: 'Forgiveness', categoryHint: 'Life' },
  { label: '#GrowingUp', tag: 'GrowingUp', categoryHint: 'Family' },
];

interface EmotionalTagBarProps {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function EmotionalTagBar({
  selectedTag,
  onSelectTag,
}: EmotionalTagBarProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
      <span className="hidden sm:flex items-center space-x-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500 shrink-0 pr-1">
        <Hash className="w-3 h-3 text-[#7C99B8]" />
        <span>Mood:</span>
      </span>

      {/* "All" Mood reset pill */}
      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`shrink-0 px-3 py-1 rounded-full text-xs font-mono transition-all duration-300 cursor-pointer border ${
          selectedTag === null
            ? 'bg-neutral-200 text-neutral-950 font-semibold border-neutral-200 shadow-sm'
            : 'bg-[#0f121a]/60 hover:bg-[#0f121a]/90 text-neutral-400 hover:text-neutral-200 border-white/[0.08]'
        }`}
      >
        All Moods
      </button>

      {/* Mood Tags */}
      {POPULAR_TAGS.map((m) => {
        const isSelected = selectedTag === m.tag;

        return (
          <button
            type="button"
            key={m.tag}
            onClick={() => onSelectTag(isSelected ? null : m.tag)}
            className={`shrink-0 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all duration-300 cursor-pointer border ${
              isSelected
                ? 'bg-[#7C99B8]/25 text-[#7C99B8] font-medium border-[#7C99B8]/50 shadow-[0_0_15px_rgba(124,153,184,0.25)]'
                : 'bg-[#0f121a]/60 hover:bg-[#0f121a]/90 text-neutral-400 hover:text-neutral-200 border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
