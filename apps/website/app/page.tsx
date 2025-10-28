import DownloadButton from "@/components/DownloadButton";
import FeatureShowcase from "@/components/FeatureShowcase";

export default function Home() {
  const showcaseFeatures = [
    {
      title: "📝 Rich Markdown Editor",
      description: "Write with TipTap editor supporting tables, code blocks, task lists, and more with syntax highlighting. Format your notes beautifully with real-time preview and intuitive controls.",
      image: "https://placehold.co/1200x800/1e293b/e2e8f0?text=Markdown+Editor",
    },
    {
      title: "🔄 Git Integration",
      description: "Full Git support with automatic commits, history tracking, and version control built right in. Never lose your work with comprehensive version control and sync capabilities.",
      image: "https://placehold.co/1200x800/1e293b/e2e8f0?text=Git+Integration",
    },
    {
      title: "📂 Folder Organization",
      description: "Organize your notes with a flexible folder structure and easy navigation. Create nested folders, move notes around, and keep everything perfectly organized.",
      image: "https://placehold.co/1200x800/1e293b/e2e8f0?text=Folder+Organization",
    },
    {
      title: "🏷️ Tags & Search",
      description: "Tag your notes and search through them quickly to find what you need. Powerful search functionality helps you locate any note in seconds.",
      image: "https://placehold.co/1200x800/1e293b/e2e8f0?text=Tags+%26+Search",
    },
    {
      title: "🎨 Custom Themes",
      description: "Choose from multiple beautiful themes including Dracula, Nord, Kanagawa, and more. Customize your workspace to match your style and reduce eye strain.",
      image: "https://placehold.co/1200x800/1e293b/e2e8f0?text=Custom+Themes",
    },
    {
      title: "💾 Local-First & Private",
      description: "All your data stays on your machine. Full control and privacy guaranteed. No cloud sync required unless you want it through Git.",
      image: "https://placehold.co/1200x800/1e293b/e2e8f0?text=Local-First",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Noti
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
          Personal Note-Taking with Git Integration
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          A powerful, local-first note-taking application with built-in version control,
          markdown support, and beautiful themes.
        </p>
        <DownloadButton />
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-transparent via-gray-50 to-transparent dark:via-gray-900">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
          Powerful Features
        </h2>
        <FeatureShowcase features={showcaseFeatures} />
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Download Noti now and take control of your notes.
        </p>
        <DownloadButton />
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p className="mb-2">
          Open Source •{" "}
          <a
            href="https://github.com/devjasha/Noti"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
        <p className="text-sm">
          Made with ❤️ by devjasha
        </p>
      </footer>
    </div>
  );
}
