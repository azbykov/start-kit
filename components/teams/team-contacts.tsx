"use client";

import type { TeamProfile } from "@/lib/types/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TeamContactsProps {
  team: TeamProfile;
}

export function TeamContacts({ team }: TeamContactsProps) {
  const items: Array<{ label: string; value?: string | null; isLink?: boolean }> =
    [
      { label: "Телефон", value: team.contactPhone },
      { label: "Email", value: team.contactEmail },
      { label: "Сайт", value: team.contactWebsite, isLink: true },
      { label: "Telegram", value: team.contactTelegram },
      { label: "VK", value: team.contactVk, isLink: true },
      { label: "Адрес", value: team.contactAddress },
    ];

  const visible = items.filter((i) => i.value && i.value.trim().length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Контакты</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Контактная информация не указана
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {visible.map((item) => (
              <div key={item.label}>
                <div className="text-muted-foreground">{item.label}</div>
                <div className="font-medium break-words">
                  {item.isLink ? (
                    <a
                      href={item.value!}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

