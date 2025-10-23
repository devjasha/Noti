'use client';

import { useState, useEffect } from 'react';
import { Theme, themeToCSSVariables } from '@/lib/themes-client';

export default function ThemeSelector() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
    loadSavedTheme();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedTheme = () => {
    const saved = localStorage.getItem('selected-theme');
    if (saved) {
      setCurrentTheme(saved);
      applyThemeByName(saved);
    } else {
      setCurrentTheme('Inkdrop Light');
    }
  };

  const applyThemeByName = async (themeName: string) => {
    try {
      const fileName = themeName.toLowerCase().replace(/\s+/g, '-');
      const response = await fetch(`/api/themes/${fileName}`);
      if (response.ok) {
        const theme = await response.json();
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  const applyTheme = (theme: Theme) => {
    const cssVars = themeToCSSVariables(theme);
    const root = document.documentElement;

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    setCurrentTheme(theme.name);
    localStorage.setItem('selected-theme', theme.name);
  };

  const handleThemeSelect = (theme: Theme) => {
    applyTheme(theme);
    setShowSelector(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="px-3 py-2 text-sm font-medium rounded transition-all flex items-center gap-2"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <span>{currentTheme || 'Theme'}</span>
        <span className="text-xs">{showSelector ? '▲' : '▼'}</span>
      </button>

      {showSelector && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSelector(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 mt-2 z-50 rounded overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '250px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {loading ? (
              <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
                Loading themes...
              </div>
            ) : themes.length === 0 ? (
              <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No themes available
              </div>
            ) : (
              themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeSelect(theme)}
                  className="w-full text-left px-4 py-3 transition-all"
                  style={{
                    background: currentTheme === theme.name ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                    borderBottom: '1px solid var(--border-light)',
                    color: currentTheme === theme.name ? 'var(--primary)' : 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentTheme !== theme.name) {
                      e.currentTarget.style.background = 'var(--background)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTheme !== theme.name) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{theme.name}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        by {theme.author}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="w-5 h-5 rounded"
                        style={{ background: theme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-5 h-5 rounded"
                        style={{ background: theme.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-5 h-5 rounded"
                        style={{ background: theme.colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
