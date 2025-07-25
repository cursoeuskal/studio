'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function TagInput({ value, onChange, placeholder, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, value.length - 1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 min-h-[2.75rem] bg-transparent">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="py-1 px-2.5 text-sm font-medium">
            {tag}
            <button
              type="button"
              className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
         <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={value.length === 0 ? (placeholder || 'Add tags...') : ''}
            className="flex-1 border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent min-w-[80px]"
        />
      </div>
    </div>
  );
}
