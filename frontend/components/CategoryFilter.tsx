'use client';

const CATEGORIES = [
  { name: 'All', emoji: '✨' },
  { name: 'Love', emoji: '❤️' },
  { name: 'Heartbreak', emoji: '💔' },
  { name: 'Life', emoji: '🌿' },
  { name: 'Family', emoji: '🏡' },
  { name: 'Friendship', emoji: '🤝' },
  { name: 'Overthinking', emoji: '💭' },
  { name: 'Motivation', emoji: '⚡' },
  { name: 'Regret', emoji: '🌧️' },
  { name: 'Letting Go', emoji: '🕊️' },
  { name: 'Other', emoji: '🌙' },
] as const;

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="relative w-full group/filter">
      {/* Subtle fade masks on left and right edges for clean scrolling appearance */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#09090b] to-transparent z-10 opacity-70" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10 opacity-70" />

      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-2 min-w-max px-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`group relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950 shadow-[0_0_20px_rgba(124,153,184,0.3)] font-semibold'
                    : 'bg-[#0f1115]/90 text-neutral-400 hover:text-neutral-200 hover:bg-[#15181e] border border-white/[0.06] hover:border-white/[0.14]'
                }`}
              >
                <span className="text-xs transition-transform duration-200 group-hover:scale-110">
                  {cat.emoji}
                </span>
                <span className="tracking-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
