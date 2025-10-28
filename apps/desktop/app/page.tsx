import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Noti</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your personal note-taking system - accessible from anywhere
        </p>

        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Open Dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">📝 Daily Notes</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Quick daily journals and entries
            </p>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">🚀 Projects</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Project documentation and planning
            </p>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">📚 Reference</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Knowledge base and references
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 border rounded-lg dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Features</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✓ Edit notes in Neovim or web browser</li>
            <li>✓ Markdown format with YAML frontmatter</li>
            <li>✓ Git-based version control and sync</li>
            <li>✓ Tag and folder organization</li>
            <li>✓ Full-text search</li>
            <li>✓ Docker-based deployment</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
