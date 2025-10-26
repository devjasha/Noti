'use client';

interface NavigationBreadcrumbProps {
  mode: 'folders' | 'tags';
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigateHome: () => void;
}

export default function NavigationBreadcrumb({ mode, currentPath, onNavigate, onNavigateHome }: NavigationBreadcrumbProps) {
  const pathSegments = currentPath ? currentPath.split('/') : [];

  const buildPath = (index: number): string => {
    return pathSegments.slice(0, index + 1).join('/');
  };

  return (
    <div className="flex items-center gap-1 px-2 py-2 text-sm overflow-x-auto">
      {/* Home/Root button */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-opacity-80 flex-shrink-0"
        style={{
          background: mode === 'folders' && currentPath === '' ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
          color: mode === 'folders' && currentPath === '' ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: mode === 'folders' && currentPath === '' ? 600 : 400,
        }}
        onMouseEnter={(e) => {
          if (!(mode === 'folders' && currentPath === '')) {
            e.currentTarget.style.background = 'var(--background)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(mode === 'folders' && currentPath === '')) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Home</span>
      </button>

      {/* Tag mode breadcrumb */}
      {mode === 'tags' && (
        <>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <button
            onClick={onNavigateHome}
            className="px-2 py-1 rounded transition-all hover:bg-opacity-80 flex-shrink-0"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 400,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🏷️ Tags
          </button>

          {currentPath && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <div
                className="px-2 py-1 rounded flex-shrink-0"
                style={{
                  background: 'rgba(61, 122, 237, 0.1)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}
              >
                {currentPath}
              </div>
            </>
          )}
        </>
      )}

      {/* Folder mode breadcrumb */}
      {mode === 'folders' && pathSegments.map((segment, index) => {
        const segmentPath = buildPath(index);
        const isLast = index === pathSegments.length - 1;

        return (
          <div key={segmentPath} className="flex items-center gap-1 flex-shrink-0">
            {/* Separator */}
            <span style={{ color: 'var(--text-muted)' }}>/</span>

            {/* Segment button */}
            <button
              onClick={() => onNavigate(segmentPath)}
              className="px-2 py-1 rounded transition-all hover:bg-opacity-80"
              style={{
                background: isLast ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                color: isLast ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isLast ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isLast) {
                  e.currentTarget.style.background = 'var(--background)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLast) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {segment}
            </button>
          </div>
        );
      })}
    </div>
  );
}
