"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const newsItems = [
  {
    id: 1,
    title: "Добро пожаловать на платформу Start Statistics",
    excerpt: "Новая платформа для аналитики молодёжного футбола. Статистика, расписание, результаты.",
    date: new Date().toLocaleDateString("ru-RU"),
    category: "Новости",
    featured: true,
  },
  {
    id: 2,
    title: "Открыта регистрация на турниры",
    excerpt: "Приглашаем команды к участию в турнирах сезона 2025 года.",
    date: new Date(Date.now() - 86400000).toLocaleDateString("ru-RU"),
    category: "Анонсы",
    featured: false,
  },
  {
    id: 3,
    title: "Обновление статистики",
    excerpt: "Теперь доступна детальная статистика по игрокам и командам.",
    date: new Date(Date.now() - 172800000).toLocaleDateString("ru-RU"),
    category: "Обновления",
    featured: false,
  },
];

export function NewsSection() {
  const featuredNews = newsItems.find((n) => n.featured);
  const regularNews = newsItems.filter((n) => !n.featured);

  return (
    <section className="py-8 lg:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">Новости</h2>
            <p className="text-muted-foreground mt-2">Последние события платформы</p>
          </div>
          <Button variant="outline" className="hidden sm:flex gap-2" asChild>
            <Link href="#">
              Все новости
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured News */}
          {featuredNews && (
            <Link href="#" className="group block lg:row-span-2">
              <article className="h-full bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover">
                <div className="aspect-video lg:aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl">⚽</span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      {featuredNews.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl lg:text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {featuredNews.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 line-clamp-2">{featuredNews.excerpt}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <Clock className="w-4 h-4" />
                    <span>{featuredNews.date}</span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Regular News */}
          <div className="space-y-4">
            {regularNews.map((news, index) => (
              <Link
                key={news.id}
                href="#"
                className="group block animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <article className="bg-card rounded-xl shadow-card p-5 transition-all duration-300 hover:shadow-hover hover:translate-x-1">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 shrink-0 bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📰</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded">
                          {news.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{news.date}</span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full mt-6 sm:hidden gap-2" asChild>
          <Link href="#">
            Все новости
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}



