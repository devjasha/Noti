"use client";

import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  Action,
} from "kbar";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            {item}
          </div>
        ) : (
          <div
            className={`px-4 py-3 cursor-pointer ${
              active
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                : "bg-transparent text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{item.name}</div>
                {item.subtitle && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </div>
                )}
              </div>
              {item.shortcut?.length && (
                <div className="flex gap-1">
                  {item.shortcut.map((sc) => (
                    <kbd
                      key={sc}
                      className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
                    >
                      {sc}
                    </kbd>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }
    />
  );
}

export default function KBarProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const actions: Action[] = [
    {
      id: "home",
      name: "Home",
      shortcut: ["h"],
      keywords: "home main landing",
      section: "Navigation",
      perform: () => router.push("/"),
    },
    {
      id: "docs",
      name: "Documentation",
      shortcut: ["d"],
      keywords: "documentation docs guides",
      section: "Navigation",
      perform: () => router.push("/docs"),
    },
    {
      id: "features",
      name: "Features",
      shortcut: ["f"],
      keywords: "features functionality",
      section: "Navigation",
      perform: () => {
        const element = document.getElementById("features");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
    {
      id: "download",
      name: "Download",
      shortcut: ["⌘", "d"],
      keywords: "download install get",
      section: "Navigation",
      perform: () => {
        const element = document.getElementById("download");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
    // Documentation sections
    {
      id: "docs-intro",
      name: "Introduction",
      keywords: "introduction getting started welcome",
      section: "Documentation",
      perform: () => router.push("/docs"),
    },
    {
      id: "docs-getting-started",
      name: "Getting Started",
      keywords: "getting started setup install begin",
      section: "Documentation",
      perform: () => router.push("/docs/getting-started"),
    },
    {
      id: "docs-markdown",
      name: "Markdown Features",
      keywords: "markdown editor formatting syntax",
      section: "Documentation",
      perform: () => router.push("/docs/markdown"),
    },
    {
      id: "docs-git",
      name: "Git Integration",
      keywords: "git version control commit push pull",
      section: "Documentation",
      perform: () => router.push("/docs/git"),
    },
    {
      id: "docs-noti-vim",
      name: "noti-vim Plugin",
      keywords: "vim neovim plugin editor integration",
      section: "Documentation",
      perform: () => router.push("/docs/noti-vim"),
    },
    // External links
    {
      id: "github",
      name: "GitHub Repository",
      keywords: "github code source repository",
      section: "Links",
      perform: () => window.open("https://github.com/devjasha/Noti", "_blank"),
    },
    {
      id: "github-noti-vim",
      name: "noti-vim Repository",
      keywords: "noti-vim github vim plugin",
      section: "Links",
      perform: () =>
        window.open("https://github.com/devjasha/noti-vim", "_blank"),
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm">
          <KBarAnimator className="max-w-2xl w-full mx-auto mt-32 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <KBarSearch className="w-full px-4 py-4 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
            <div className="border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <RenderResults />
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 rounded">↑</kbd>
              {" "}or{" "}
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 rounded">↓</kbd>
              {" "}to navigate,{" "}
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 rounded">Enter</kbd>
              {" "}to select,{" "}
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 rounded">Esc</kbd>
              {" "}to close
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}
