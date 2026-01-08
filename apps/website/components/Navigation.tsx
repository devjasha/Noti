"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Github, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchButton from "./SearchButton";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Prevent scrolling when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div
        className={`max-w-5xl mx-auto rounded-2xl transition-all duration-300 ${
          isScrolled
            ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-black/20"
            : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30"
        }`}
      >
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={() => scrollToSection("hero")}
            >
              <Image
                src="/logo/logo-schlechta-bildmarke.svg"
                alt="Noti Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Noti
              </span>
            </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("features")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Link href="/docs">Docs</Link>
            </Button>
            <SearchButton />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <a
                href="https://github.com/devjasha/Noti"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button
              size="sm"
              onClick={() => scrollToSection("download")}
              className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Download
            </Button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] bg-background/95 backdrop-blur-lg z-40">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-lg py-6"
                onClick={() => scrollToSection("hero")}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg py-6"
                onClick={() => scrollToSection("features")}
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg py-6"
                asChild
              >
                <Link href="/docs" onClick={() => setIsMobileMenuOpen(false)}>Docs</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg py-6"
                asChild
              >
                <a
                  href="https://github.com/devjasha/Noti"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => scrollToSection("download")}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
