'use client'

import { useState, useEffect, useRef } from 'react'
import { imagesAPI, isElectron } from '@/lib/electron-api'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  noteSlug: string
  onSubmit: (url: string, alt: string, relativePath?: string) => void
}

export default function ImageModal({ isOpen, onClose, noteSlug, onSubmit }: ImageModalProps) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [isLocalFile, setIsLocalFile] = useState(false)
  const [selectedFilePath, setSelectedFilePath] = useState('')
  const urlInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUrl('')
      setAlt('')
      setIsLocalFile(false)
      // Focus URL input when modal opens
      setTimeout(() => urlInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleFileSelect = async () => {
    if (isElectron) {
      // Use Electron dialog for file selection
      const result = await imagesAPI.selectFile()
      if (result.success && result.path) {
        setSelectedFilePath(result.path)
        const fileName = result.path.split(/[/\\]/).pop() || ''
        setUrl(fileName)
        if (!alt) {
          setAlt(fileName.replace(/\.[^/.]+$/, '')) // Remove extension
        }
      }
    } else {
      // Fallback to browser file input
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      // For browser, create a blob URL
      const fileUrl = URL.createObjectURL(file)
      setUrl(fileUrl)
      setIsLocalFile(true)
      if (!alt) {
        setAlt(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate noteSlug for local files
    if (isLocalFile && (!noteSlug || noteSlug === 'new')) {
      alert('Please save the note first before adding images')
      return
    }

    if (isLocalFile && selectedFilePath && isElectron) {
      console.log('Copying image:', { selectedFilePath, noteSlug })

      // Copy local file to .attachments folder
      const result = await imagesAPI.copyToAttachments(selectedFilePath, noteSlug)

      console.log('Copy result:', result)

      if (result.success && result.dataUrl && result.path) {
        // Use data URL for display, but pass relative path for saving
        onSubmit(result.dataUrl, alt.trim(), result.path)
        onClose()
      } else {
        console.error('Failed to copy image:', result)
        alert(`Failed to copy image: ${result.error || 'Unknown error'}`)
      }
    } else if (url.trim()) {
      // URL or blob - submit directly
      onSubmit(url.trim(), alt.trim())
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Insert Image
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 transition-all hover:scale-110 rounded"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* File picker or URL input */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Image Source
              </label>

              {/* Tabs */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setIsLocalFile(false)}
                  className="px-3 py-1 text-sm rounded transition-all"
                  style={{
                    background: !isLocalFile ? 'var(--primary)' : 'var(--background)',
                    color: !isLocalFile ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocalFile(true)}
                  className="px-3 py-1 text-sm rounded transition-all"
                  style={{
                    background: isLocalFile ? 'var(--primary)' : 'var(--background)',
                    color: isLocalFile ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Local File
                </button>
              </div>

              {/* URL Input or File Picker */}
              {!isLocalFile ? (
                <input
                  ref={urlInputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full px-3 py-2 rounded focus:outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    className="w-full px-3 py-2 rounded text-left transition-all"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: url ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {url ? url.split('/').pop() : 'Click to select image file...'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Alt Text (optional)
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Image description"
                className="w-full px-3 py-2 rounded focus:outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 p-4 border-t"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium transition-all hover:scale-105 rounded"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium transition-all hover:scale-105 rounded"
              style={{
                background: 'var(--primary)',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
            >
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
