
import React, { useState } from 'react';
import { BookOpen, PenLine, ArrowRight } from 'lucide-react';

interface StoryFormProps {
  onAddStory: (text: string) => void;
}

const StoryForm: React.FC<StoryFormProps> = ({ onAddStory }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 5) {
      onAddStory(text.trim());
      setText('');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6 text-[10px] font-semibold uppercase tracking-[0.4em] text-black/20">
        <PenLine size={12} /> The Guestbook
      </div>
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Etch a new truth into the history..."
          className="w-full bg-transparent border-b border-black/10 pb-4 pt-1 text-sm font-light focus:outline-none focus:border-[#b2935b] transition-all placeholder:text-black/10 italic font-serif selection:bg-[#b2935b]/20"
          maxLength={120}
        />
        <button
          type="submit"
          disabled={text.trim().length <= 5}
          className="absolute right-0 bottom-4 text-black/15 hover:text-[#b2935b] disabled:opacity-0 transition-all p-1"
        >
          <ArrowRight size={18} strokeWidth={1.5} />
        </button>
      </form>
      <p className="mt-3 text-[8px] uppercase tracking-widest text-black/10 font-medium">
        {text.length}/120 characters cataloged
      </p>
    </div>
  );
};

export default StoryForm;
