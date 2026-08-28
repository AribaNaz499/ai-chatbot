import React from 'react';

export default function SuggestionChips({ onSelectChip }) {
  const chips = ['Summarize PDF', 'Company FAQs', 'Ask Question'];

  return (
    <div className="px-2 py-2 flex gap-2 overflow-x-auto scrollbar-none">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelectChip(chip)}
          className="px-3.5 py-1.5 rounded-xl bg-[#151a26] border border-emerald-900/40 text-xs text-emerald-300/80 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-950/40 transition-all whitespace-nowrap shadow-sm"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}