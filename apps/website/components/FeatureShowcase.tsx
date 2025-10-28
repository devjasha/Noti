"use client";

import { useEffect, useRef, useState } from "react";

interface Feature {
  title: string;
  description: string;
  image: string;
}

interface FeatureShowcaseProps {
  features: Feature[];
}

export default function FeatureShowcase({ features }: FeatureShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = featureRefs.current.indexOf(
            entry.target as HTMLDivElement
          );
          if (index !== -1) {
            setActiveIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Sticky Image Container - Left Side */}
          <div className="lg:w-1/2 lg:sticky lg:top-20 self-start">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scrolling Features - Right Side */}
          <div className="lg:w-1/2 space-y-32 py-20">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => {
                  featureRefs.current[index] = el;
                }}
                className={`transition-all duration-500 ${
                  activeIndex === index
                    ? "opacity-100 scale-100"
                    : "opacity-40 scale-95"
                }`}
              >
                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
