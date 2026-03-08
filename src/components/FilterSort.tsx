'use client';

import { useState } from 'react';
import { Filter, SortAsc, SortDesc, X } from 'lucide-react';

export type SortOption = 'progress' | 'name' | 'recent' | 'vehicles';
export type SortDirection = 'asc' | 'desc';
export type FilterOption = 'all' | 'driverless' | 'active' | 'public_program';

interface FilterSortProps {
  onSortChange: (sort: SortOption, direction: SortDirection) => void;
  onFilterChange: (filter: FilterOption) => void;
  currentSort: SortOption;
  currentDirection: SortDirection;
  currentFilter: FilterOption;
}

export function FilterSort({
  onSortChange,
  onFilterChange,
  currentSort,
  currentDirection,
  currentFilter,
}: FilterSortProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'progress', label: 'Progress' },
    { value: 'name', label: 'Name' },
    { value: 'recent', label: 'Recent Activity' },
    { value: 'vehicles', label: 'Vehicles' },
  ];

  const filterOptions: { value: FilterOption; label: string; count?: number }[] = [
    { value: 'all', label: 'All Cities' },
    { value: 'driverless', label: 'Driverless' },
    { value: 'public_program', label: 'Public Program' },
    { value: 'active', label: 'Active' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-1.5 text-[10px] rounded-lg border transition-colors ${
            currentFilter !== 'all'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>{filterOptions.find(f => f.value === currentFilter)?.label}</span>
        </button>

        {showFilters && (
          <div className="absolute top-full left-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 min-w-[150px]">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onFilterChange(option.value);
                  setShowFilters(false);
                }}
                className={`w-full px-3 py-2 text-left text-[10px] hover:bg-neutral-800 transition-colors ${
                  currentFilter === option.value ? 'text-red-400' : 'text-neutral-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
        {sortOptions.map(option => (
          <button
            key={option.value}
            onClick={() => {
              if (currentSort === option.value) {
                onSortChange(option.value, currentDirection === 'asc' ? 'desc' : 'asc');
              } else {
                onSortChange(option.value, 'desc');
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${
              currentSort === option.value
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {option.label}
            {currentSort === option.value && (
              currentDirection === 'asc'
                ? <SortAsc className="w-3 h-3" />
                : <SortDesc className="w-3 h-3" />
            )}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {currentFilter !== 'all' && (
        <button
          onClick={() => onFilterChange('all')}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
