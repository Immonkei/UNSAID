'use client';

const CATEGORIES = [
  'All',
  'Love',
  'Heartbreak',
  'Life',
  'Family',
  'Friendship',
  'Overthinking',
  'Motivation',
  'Regret',
  'Letting Go',
  'Other',
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
    <div className="w-full overflow-x-auto no-scrollbar py-3">
      <div className="flex items-center space-x-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
