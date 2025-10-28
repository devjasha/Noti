"use client";

import { useEffect, useState } from "react";

type OS = "Windows" | "macOS" | "Linux" | "Unknown";

interface DownloadLink {
  os: OS;
  url: string;
  label: string;
}

export default function DownloadButton() {
  const [detectedOS, setDetectedOS] = useState<OS>("Unknown");
  const [isClient, setIsClient] = useState(false);
  const [releaseExists, setReleaseExists] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();

    if (platform.includes("win") || userAgent.includes("windows")) {
      setDetectedOS("Windows");
    } else if (platform.includes("mac") || userAgent.includes("mac")) {
      setDetectedOS("macOS");
    } else if (platform.includes("linux") || userAgent.includes("linux")) {
      setDetectedOS("Linux");
    }

    // Check if releases exist
    fetch('https://api.github.com/repos/devjasha/Noti/releases/latest')
      .then(res => {
        if (res.status === 404) {
          setReleaseExists(false);
        }
      })
      .catch(() => {
        // If fetch fails, assume releases exist to avoid blocking downloads
        setReleaseExists(true);
      });
  }, []);

  const downloadLinks: DownloadLink[] = [
    {
      os: "Windows",
      url: "https://github.com/devjasha/Noti/releases/latest/download/Noti-Setup.exe",
      label: "Download for Windows",
    },
    {
      os: "macOS",
      url: "https://github.com/devjasha/Noti/releases/latest/download/Noti.dmg",
      label: "Download for macOS",
    },
    {
      os: "Linux",
      url: "https://github.com/devjasha/Noti/releases/latest/download/Noti.AppImage",
      label: "Download for Linux",
    },
  ];

  const primaryDownload = downloadLinks.find((link) => link.os === detectedOS);
  const otherDownloads = downloadLinks.filter((link) => link.os !== detectedOS);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center gap-4">
        <a
          href="https://github.com/devjasha/Noti/releases/latest"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors inline-block"
        >
          Download Noti
        </a>
      </div>
    );
  }

  if (!releaseExists) {
    return (
      <div className="flex flex-col items-center gap-4">
        <a
          href="https://github.com/devjasha/Noti"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors inline-block shadow-lg"
        >
          View on GitHub
        </a>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Releases coming soon! Star the repo to get notified.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {primaryDownload ? (
        <>
          <a
            href={primaryDownload.url}
            download
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors inline-block shadow-lg"
          >
            {primaryDownload.label}
          </a>
          <div className="flex gap-3 text-sm">
            {otherDownloads.map((link) => (
              <a
                key={link.os}
                href={link.url}
                download
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {link.os}
              </a>
            ))}
          </div>
        </>
      ) : (
        <a
          href="https://github.com/devjasha/Noti/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors inline-block"
        >
          Download Noti
        </a>
      )}
    </div>
  );
}
