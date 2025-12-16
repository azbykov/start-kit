"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllTournaments } from "@/lib/hooks/use-tournaments";
import { useMatchesList } from "@/lib/hooks/use-matches";

export function HeroSection() {
  const { data: tournaments } = useAllTournaments();
  const { data: matchesData } = useMatchesList({ page: 1, pageSize: 10 });

  const activeTournament = Array.isArray(tournaments) ? tournaments[0] : tournaments;
  const upcomingMatch = matchesData?.matches?.find((m) => m.status === "SCHEDULED");

  const slides = [
    {
      badge: "Активный турнир",
      title: activeTournament?.name || "Турнир",
      highlight: "Молодёжный футбол",
      description:
        activeTournament?.description ||
        "Платформа для аналитики молодёжного футбола. Статистика, расписание, результаты.",
      stats: [
        {
          icon: Users,
          label: `${
            Array.isArray(tournaments) ? tournaments.length : tournaments ? 1 : 0
          } турниров`,
        },
        { icon: Calendar, label: "2025 сезон" },
        { icon: Trophy, label: "Активные соревнования" },
      ],
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    },
    []
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-primary-foreground space-y-6">
            <div
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur rounded-full text-sm animate-fade-up"
            >
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              {slide.badge}
            </div>

            <h1
              key={`title-${currentSlide}`}
              className="text-4xl lg:text-6xl font-display font-extrabold leading-tight animate-slide-in"
            >
              {slide.title}
              <br />
              <span className="text-accent">{slide.highlight}</span>
            </h1>

            <p
              key={`desc-${currentSlide}`}
              className="text-lg text-primary-foreground/80 max-w-md animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              {slide.description}
            </p>

            <div
              key={`stats-${currentSlide}`}
              className="flex flex-wrap gap-6 text-sm text-primary-foreground/70 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {slide.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4" />
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/tournaments">
                <Button size="lg" variant="accent" className="gap-2 group">
                  Турниры
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/matches">
                <Button size="lg" variant="hero" className="gap-2">
                  Матчи
                </Button>
              </Link>
            </div>

            {/* Carousel Controls */}
            {slides.length > 1 && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-8 bg-accent"
                          : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                      }`}
                      aria-label={`Перейти к слайду ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="w-8 h-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="w-8 h-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Featured Match Card */}
          {upcomingMatch && (
            <div key={`match-${currentSlide}`} className="relative animate-fade-up">
              <div className="bg-card/95 backdrop-blur rounded-2xl shadow-hover p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-muted-foreground font-medium">Ближайший матч</span>
                  {upcomingMatch.date && (
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {new Date(upcomingMatch.date).toLocaleDateString("ru-RU", {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{upcomingMatch.homeTeamName[0]}</span>
                    </div>
                    <span className="font-semibold text-foreground text-sm">
                      {upcomingMatch.homeTeamName}
                    </span>
                  </div>

                  <div className="text-center px-4">
                    <span className="text-3xl lg:text-4xl font-extrabold text-foreground">VS</span>
                  </div>

                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{upcomingMatch.awayTeamName[0]}</span>
                    </div>
                    <span className="font-semibold text-foreground text-sm">
                      {upcomingMatch.awayTeamName}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                  {(upcomingMatch.venue || upcomingMatch.stadium) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{upcomingMatch.venue || upcomingMatch.stadium}</span>
                    </div>
                  )}
                  <Link href={`/matches/${upcomingMatch.id}`}>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Подробнее →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


