"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MatchVideosProps {
  videoLinks?: string[];
}

export function MatchVideos({ videoLinks = [] }: MatchVideosProps) {
  if (videoLinks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Видео</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Видео матча отсутствуют
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Видео</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoLinks.map((link, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
            >
              {link.includes("youtube.com") || link.includes("youtu.be") ? (
                <iframe
                  src={link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={link}
                  controls
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


