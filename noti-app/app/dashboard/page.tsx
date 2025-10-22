import Link from 'next/link';
import NotesList from '@/components/NotesList';
import GitStatus from '@/components/GitStatus';

export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold transition-colors hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            Noti
          </Link>
          <Link
            href="/note/new"
            className="px-6 py-2.5 text-white font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--primary)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            + New Note
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Your Notes</h1>
            <NotesList />
          </div>

          <div className="space-y-6">
            <GitStatus />

            <div className="p-5 space-y-3" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/note/daily/today"
                  className="block px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--border-light)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  📅 Today's Note
                </Link>
                <Link
                  href="/dashboard?folder=projects"
                  className="block px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--border-light)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  📁 Projects
                </Link>
                <Link
                  href="/dashboard?folder=reference"
                  className="block px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--border-light)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  📚 Reference
                </Link>
              </div>
            </div>

            <div className="p-5 space-y-3" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>About Noti</h3>
              <p className="text-sm" style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                Take notes in Neovim or the web interface. All notes are stored as markdown files with Git version control.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
