'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { tagsAPI } from '../lib/electron-api';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

interface TagInfo {
  tag: string;
  count: number;
}

export default function TagInput({ tags, onAddTag, onRemoveTag }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<TagInfo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all tags when component mounts
  useEffect(() => {
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    try {
      const allTags = await tagsAPI.getAll();
      setAvailableTags(allTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Fuzzy matching function
  const fuzzyMatch = (text: string, query: string): boolean => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let queryIndex = 0;
    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === lowerQuery.length;
  };

  // Filter tags based on input with fuzzy matching
  const filteredTags = inputValue.trim()
    ? availableTags.filter(({ tag }) =>
        !tags.includes(tag) && fuzzyMatch(tag, inputValue)
      )
    : [];

  // Show dropdown when there are filtered results
  useEffect(() => {
    setShowDropdown(filteredTags.length > 0 && inputValue.trim().length > 0);
    setSelectedIndex(0);
  }, [filteredTags.length, inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setInputValue('');
      setShowDropdown(false);
      fetchAllTags(); // Refresh tags list after adding
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (showDropdown && filteredTags.length > 0) {
        // Select from dropdown
        handleAddTag(filteredTags[selectedIndex].tag);
      } else if (inputValue.trim()) {
        // Add new tag
        handleAddTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredTags.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTags.length) % filteredTags.length);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: { text: string; matched: boolean }[] = [];

    let queryIndex = 0;
    let currentPart = '';
    let isMatched = false;

    for (let i = 0; i < text.length; i++) {
      if (queryIndex < lowerQuery.length && lowerText[i] === lowerQuery[queryIndex]) {
        if (!isMatched) {
          if (currentPart) parts.push({ text: currentPart, matched: false });
          currentPart = '';
          isMatched = true;
        }
        currentPart += text[i];
        queryIndex++;
      } else {
        if (isMatched) {
          if (currentPart) parts.push({ text: currentPart, matched: true });
          currentPart = '';
          isMatched = false;
        }
        currentPart += text[i];
      }
    }

    if (currentPart) {
      parts.push({ text: currentPart, matched: isMatched });
    }

    return (
      <>
        {parts.map((part, idx) => (
          <span
            key={idx}
            style={{
              fontWeight: part.matched ? 700 : 400,
              color: part.matched ? 'var(--primary)' : 'inherit',
            }}
          >
            {part.text}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 items-center relative">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2.5 py-1 text-xs font-medium flex items-center gap-1.5"
          style={{
            background: 'rgba(61, 122, 237, 0.1)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="hover:opacity-70 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            ×
          </button>
        </span>
      ))}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add tag..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-2.5 py-1 text-xs rounded focus:outline-none transition-all"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            minWidth: '120px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)';
            if (filteredTags.length > 0) setShowDropdown(true);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {showDropdown && filteredTags.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 py-1 z-50 rounded shadow-lg"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '200px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {filteredTags.slice(0, 10).map(({ tag, count }, index) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between"
                style={{
                  background: index === selectedIndex ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span>{highlightMatch(tag, inputValue)}</span>
                <span
                  className="text-xs ml-2"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'rgba(61, 122, 237, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {inputValue.trim() && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Press Enter or comma to add
        </span>
      )}
    </div>
  );
}
