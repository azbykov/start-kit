"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Image from "next/image";

const footerLinks = {
  main: [
    { label: "Игроки", href: "/players" },
    { label: "Турниры", href: "/tournaments" },
    { label: "Команды", href: "/teams" },
    { label: "Матчи", href: "/matches" },
  ],
  info: [
    { label: "О платформе", href: "#about" },
    { label: "Документы", href: "#documents" },
    { label: "Контакты", href: "#contacts" },
    { label: "Партнёры", href: "#partners" },
  ],
  resources: [
    { label: "Статистика", href: "#stats" },
    { label: "Рейтинги", href: "#ratings" },
    { label: "Архив", href: "#archive" },
    { label: "FAQ", href: "#faq" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Image
                  src="/images/start-logo-icon.svg"
                  alt="Start Statistics Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </div>
              <div>
                <span className="font-display font-bold text-background">
                  <span className="text-[#016ADB]">Start</span>{" "}
                  <span className="text-[#02A962]">Statistics</span>
                </span>
              </div>
            </Link>
            <p className="text-background/60 text-sm max-w-xs">
              Платформа для аналитики молодёжного футбола. Статистика, расписание, результаты.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Основное</h4>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-background/60 hover:text-background text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-background/60 hover:text-background text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ресурсы</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-background/60 hover:text-background text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+78121234567"
                  className="flex items-center gap-2 text-background/60 hover:text-background text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +7 (812) 123-45-67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@start-statistics.org"
                  className="flex items-center gap-2 text-background/60 hover:text-background text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  info@start-statistics.org
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-background/60 text-sm">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  Санкт-Петербург
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/40 text-sm">
            © 2025 Start Statistics. Все права защищены.
          </p>
          <a
            href="#"
            className="flex items-center gap-1 text-background/40 hover:text-background text-sm transition-colors"
          >
            Создано на платформе Start Kit
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}



