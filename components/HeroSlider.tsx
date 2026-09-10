"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  defaultHeroSlides,
  getSettings,
  type HeroSlide,
} from "@/lib/admin";

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(
    defaultHeroSlides
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      const settings = getSettings();

      if (
        Array.isArray(settings.heroSlides) &&
        settings.heroSlides.length > 0
      ) {
        setSlides(settings.heroSlides);
      }
    };

    loadSettings();

    window.addEventListener(
      "wallora-settings-updated",
      loadSettings
    );

    window.addEventListener("storage", loadSettings);

    return () => {
      window.removeEventListener(
        "wallora-settings-updated",
        loadSettings
      );

      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [slides.length, activeSlide]);

  const nextSlide = () => {
    setActiveSlide(
      (current) => (current + 1) % slides.length
    );
  };

  const previousSlide = () => {
    setActiveSlide(
      (current) =>
        (current - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const slide = slides[activeSlide];

  if (!slide) return null;

  return (
    <section
      className="px-3 pb-10 pt-6 sm:px-5 sm:pb-16 sm:pt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="page-container">
        <div className="neu-surface relative min-h-[600px] overflow-hidden p-3 sm:min-h-[650px] sm:p-4">

          {/* Background Image */}
          <div className="absolute inset-3 overflow-hidden rounded-[24px] sm:inset-4 sm:rounded-[28px]">
            <img
              key={`${slide.id}-${slide.image}`}
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover transition-opacity duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#2d3026]/85 via-[#414637]/55 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#252820]/65 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex min-h-[570px] items-center px-5 py-16 sm:min-h-[615px] sm:px-10 lg:px-16">
            <div className="max-w-3xl text-[#fffdf5]">

              {/* Eyebrow */}
              {slide.eyebrow && (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e9e4d5]/15 px-4 py-2 backdrop-blur-md">
                  <Sparkles size={16} />

                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    {slide.eyebrow}
                  </span>
                </div>
              )}

              {/* Heading */}
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#fffdf5]/85 sm:text-base sm:leading-8">
                {slide.description}
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">

                {slide.primaryButtonText && (
                  <Link
                    href={slide.primaryButtonLink || "/services"}
                    className="neu-button bg-[#687052] text-[#fffdf5] shadow-[7px_7px_14px_rgba(25,27,21,0.35),-5px_-5px_12px_rgba(255,252,242,0.15)] hover:bg-[#414637]"
                  >
                    {slide.primaryButtonText}
                    <ArrowRight size={18} />
                  </Link>
                )}

                {slide.secondaryButtonText && (
                  <Link
                    href={slide.secondaryButtonLink || "/order"}
                    className="neu-button bg-[#e9e4d5]/90 text-[#414637] backdrop-blur-md"
                  >
                    {slide.secondaryButtonText}
                  </Link>
                )}

              </div>
            </div>
          </div>

          {/* Previous */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous slide"
              className="absolute bottom-7 right-[122px] z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e4d5]/90 text-[#414637] shadow-[5px_5px_10px_rgba(25,27,21,0.3),-4px_-4px_8px_rgba(255,252,242,0.3)] backdrop-blur-md transition hover:scale-105 sm:bottom-9 sm:right-[135px]"
            >
              <ChevronLeft size={19} />
            </button>
          )}

          {/* Next */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute bottom-7 right-[70px] z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e4d5]/90 text-[#414637] shadow-[5px_5px_10px_rgba(25,27,21,0.3),-4px_-4px_8px_rgba(255,252,242,0.3)] backdrop-blur-md transition hover:scale-105 sm:bottom-9 sm:right-[80px]"
            >
              <ChevronRight size={19} />
            </button>
          )}

          {/* Indicators */}
          <div className="absolute bottom-7 left-7 z-20 flex items-center gap-2 sm:bottom-10 sm:left-10">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-9 bg-[#fffdf5]"
                    : "w-2 bg-[#fffdf5]/50"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          {slides.length > 1 && (
            <div className="absolute bottom-7 right-7 z-20 hidden text-xs font-bold tracking-[0.15em] text-[#fffdf5]/80 sm:bottom-10 sm:right-10 sm:block">
              0{activeSlide + 1} / 0{slides.length}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}