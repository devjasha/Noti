import DownloadButton from "@/components/DownloadButton";
import FeatureShowcase from "@/components/FeatureShowcase";
import Navigation from "@/components/Navigation";
import Image from "next/image";

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
      <Navigation />
      <section id="hero" className="py-24 md:py-32 pt-32 md:pt-40 px-6 md:px-4 text-center relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent" />
        <div className="flex justify-center mb-8">
          <Image
            src="/logo/logo-schlechta-bildmarke.svg"
            alt="Noti Logo"
            width={120}
            height={120}
            className="w-24 h-24 md:w-32 md:h-32 animate-float"
            priority
          />
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
          Noti
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-4">
          Personal Note-Taking with Git Integration
        </p>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto px-4">
          A powerful, local-first note-taking application with built-in version control,
          markdown support, and beautiful themes.
        </p>
        <DownloadButton />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 md:px-4 relative">
        <div className="absolute inset-0" />
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 md:mb-20 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent relative">
          Powerful Features
        </h2>
        <div className="relative">
          <FeatureShowcase features={showcaseFeatures} />
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="mx-auto px-6 md:px-4 py-24 md:py-32 text-center relative">
        <div className="absolute inset-0 -z-10  to-transparent dark:from-blue-950/20 dark:via-purple-950/10 dark:to-transparent" />
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ready to get started?
        </h2>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto">
          Download Noti now and take control of your notes with powerful features and beautiful design.
        </p>
        <DownloadButton />
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-4 text-center text-muted-foreground">
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
