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

            <div className="border rounded-lg p-4 space-y-3 dark:border-gray-700">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/note/daily/today"
                  className="block px-3 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Today's Note
                </Link>
                <Link
                  href="/dashboard?folder=projects"
                  className="block px-3 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard?folder=reference"
                  className="block px-3 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Reference
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3 dark:border-gray-700">
              <h3 className="font-semibold">About Noti</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take notes in Neovim or the web interface. All notes are stored as markdown files with Git version control.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
