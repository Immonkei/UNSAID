'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  HeartCrack,
  Leaf,
  Home,
  Users,
  Brain,
  Zap,
  CloudRain,
  Wind,
  Moon,
  ChevronDown,
  Check,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryItem {
  name: string;
  icon: LucideIcon;
  countKey?: string;
}

export const CATEGORIES: CategoryItem[] = [
  { name: 'All', icon: Sparkles },
  { name: 'Love', icon: Heart },
  { name: 'Heartbreak', icon: HeartCrack },
  { name: 'Life', icon: Leaf },
  { name: 'Family', icon: Home },
  { name: 'Friendship', icon: Users },
  { name: 'Overthinking', icon: Brain },
  { name: 'Motivation', icon: Zap },
  { name: 'Regret', icon: CloudRain },
  { name: 'Letting Go', icon: Wind },
  { name: 'Other', icon: Moon },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCategoryItem =
    CATEGORIES.find((c) => c.name === selectedCategory) || CATEGORIES[0];
  const ActiveIcon = activeCategoryItem.icon;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Category Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer select-none backdrop-blur-xl ${
          isOpen
            ? 'bg-[#141824]/90 border-[#7C99B8]/70 text-neutral-100 shadow-[0_0_20px_rgba(124,153,184,0.2)]'
            : selectedCategory !== 'All'
            ? 'bg-[#10141e]/85 border-[#7C99B8]/50 text-[#7C99B8]'
            : 'bg-[#0f121a]/70 border-white/[0.08] hover:border-white/[0.16] text-neutral-300 hover:text-white'
        }`}
      >
        <ActiveIcon className="w-3.5 h-3.5 text-[#7C99B8]" />
        <span className="tracking-tight">
          {selectedCategory === 'All' ? 'All Topics' : selectedCategory}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-200' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 rounded-2xl bg-[#0e121b]/95 backdrop-blur-3xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(124,153,184,0.1)] p-1.5 z-50 animate-fadeIn divide-y divide-white/[0.05]">
          <div className="py-1">
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Filter by Topic
            </div>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto no-scrollbar space-y-0.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-neutral-800/90 text-neutral-100 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-[#7C99B8]' : 'text-neutral-500'
                      }`}
                    />
                    <span>{cat.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#7C99B8]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
