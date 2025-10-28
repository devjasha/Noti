import DownloadButton from "@/components/DownloadButton";

export default function Home() {
  const features = [
    {
      title: "📝 Rich Markdown Editor",
      description: "Write with TipTap editor supporting tables, code blocks, task lists, and more with syntax highlighting.",
    },
    {
      title: "🔄 Git Integration",
      description: "Full Git support with automatic commits, history tracking, and version control built right in.",
    },
    {
      title: "📂 Folder Organization",
      description: "Organize your notes with a flexible folder structure and easy navigation.",
    },
    {
      title: "🏷️ Tags & Search",
      description: "Tag your notes and search through them quickly to find what you need.",
    },
    {
      title: "📋 Templates",
      description: "Create and use templates to speed up note creation for recurring formats.",
    },
    {
      title: "🎨 Custom Themes",
      description: "Choose from multiple beautiful themes including Dracula, Nord, Kanagawa, and more.",
    },
    {
      title: "⚡ Slash Commands",
      description: "Quick access to formatting, images, links, and more with intuitive slash commands.",
    },
    {
      title: "🖼️ Image Support",
      description: "Embed images directly in your notes with drag-and-drop support.",
    },
    {
      title: "🔗 Link Management",
      description: "Create and manage internal and external links within your notes.",
    },
    {
      title: "⌨️ Keyboard Shortcuts",
      description: "Boost productivity with comprehensive keyboard shortcuts for all actions.",
    },
    {
      title: "💾 Local-First",
      description: "All your data stays on your machine. Full control and privacy.",
    },
    {
      title: "🚀 Cross-Platform",
      description: "Available for Windows, macOS, and Linux with native performance.",
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
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
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
