import { PlayerRankings } from "@/components/players/player-rankings";

export default function PlayersRankingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="py-12 lg:py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-2">
            Рейтинг игроков
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Ранжирование по рейтингу с фильтрами
          </p>
        </div>
      </section>

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <PlayerRankings />
        </div>
      </div>
    </div>
  );
}

