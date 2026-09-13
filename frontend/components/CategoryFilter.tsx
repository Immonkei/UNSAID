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
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center space-x-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-950 shadow-[0_2px_10px_rgba(255,255,255,0.15)] scale-[1.02]'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 border border-neutral-800/80'
              }`}
            >
              <span className="text-[11px]">{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
