import DownloadButton from "@/components/DownloadButton";
import Navigation from "@/components/Navigation";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      icon: "📝",
      title: "Rich Markdown Editor",
      description: "Write with powerful TipTap editor supporting tables, code blocks, task lists, and syntax highlighting.",
    },
    {
      icon: "🔄",
      title: "Git Integration",
      description: "Built-in version control with automatic commits, history tracking, and seamless remote sync.",
    },
    {
      icon: "📂",
      title: "Folder Organization",
      description: "Organize notes with flexible folder structures and intuitive drag-and-drop navigation.",
    },
    {
      icon: "🏷️",
      title: "Tags & Search",
      description: "Tag your notes and find them instantly with powerful full-text search capabilities.",
    },
    {
      icon: "🎨",
      title: "Custom Themes",
      description: "Choose from beautiful themes like Dracula, Nord, Kanagawa, or create your own.",
    },
    {
      icon: "💾",
      title: "Local-First & Private",
      description: "Your data stays on your machine. Full control and privacy guaranteed.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo/logo-schlechta-bildmarke.svg"
                alt="Noti Logo"
                width={80}
                height={80}
                className="w-20 h-20 animate-float"
                priority
              />
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Noti
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A powerful, local-first note-taking app with built-in Git version control, 
              markdown support, and beautiful themes.
            </p>
            
            <div className="pt-4">
              <DownloadButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for developers and note-taking enthusiasts
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Download Noti and take control of your notes with powerful features and beautiful design.
            </p>
            <DownloadButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-6 mb-4 text-gray-600 dark:text-gray-400">
            <a
              href="https://github.com/devjasha/Noti"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="/docs"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Documentation
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Made with ❤️ by devjasha • Open Source
          </p>
        </div>
      </footer>
    </div>
  );
}
