"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import SearchButton from "./SearchButton";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/60 backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("hero")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("features")}
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/docs">Docs</Link>
            </Button>
            <SearchButton />
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href="https://github.com/devjasha/Noti"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button
              size="sm"
              onClick={() => scrollToSection("download")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
