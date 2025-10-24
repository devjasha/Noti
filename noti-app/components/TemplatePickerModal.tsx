'use client';

import { useState, useEffect } from 'react';

interface Template {
  slug: string;
  title: string;
  description?: string;
  created: string;
}

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateSlug: string) => void;
}

export default function TemplatePickerModal({ isOpen, onClose, onSelect }: TemplatePickerModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      setSelectedTemplate(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Choose Template
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Select a template to create a new note
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-muted)' }}>No templates found.</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Save a note as a template to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.slug}
                  onClick={() => setSelectedTemplate(template.slug)}
                  className="w-full text-left p-4 rounded transition-all"
                  style={{
                    background: selectedTemplate === template.slug ? 'rgba(61, 122, 237, 0.1)' : 'var(--background)',
                    border: selectedTemplate === template.slug ? '2px solid var(--primary)' : '2px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTemplate !== template.slug) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTemplate !== template.slug) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {template.title}
                      </h3>
                      {template.description && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {template.description}
                        </p>
                      )}
                    </div>
                    {selectedTemplate === template.slug && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--primary)' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded transition-all"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="px-4 py-2 text-sm font-semibold text-white rounded transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => !selectedTemplate && (e.currentTarget.style.background = 'var(--primary-hover)')}
            onMouseLeave={(e) => !selectedTemplate && (e.currentTarget.style.background = 'var(--primary)')}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
