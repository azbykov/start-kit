"use client";

import type { MatchPlayersResponse } from "@/lib/types/matches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MatchStatsProps {
  players: MatchPlayersResponse;
}

const StatBar = ({
  label,
  home,
  away,
}: {
  label: string;
  home: number;
  away: number;
}) => {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{home}</span>
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{away}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        <div
          className="bg-primary transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-secondary-foreground/30 transition-all duration-500"
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  );
};

export function MatchStats({ players }: MatchStatsProps) {
  const homeStats = {
    goals: players.homeTeam.players.reduce((sum, p) => sum + p.goals, 0),
    assists: players.homeTeam.players.reduce((sum, p) => sum + p.assists, 0),
    yellowCards: players.homeTeam.players.reduce((sum, p) => sum + p.yellowCards, 0),
    redCards: players.homeTeam.players.reduce((sum, p) => sum + p.redCards, 0),
    passes: players.homeTeam.players.reduce((sum, p) => sum + p.minutesPlayed, 0), // Mock
    possession: 55, // Mock
    shots: 12, // Mock
    shotsOnTarget: 6, // Mock
    corners: 5, // Mock
    fouls: 8, // Mock
    offsides: 2, // Mock
  };

  const awayStats = {
    goals: players.awayTeam.players.reduce((sum, p) => sum + p.goals, 0),
    assists: players.awayTeam.players.reduce((sum, p) => sum + p.assists, 0),
    yellowCards: players.awayTeam.players.reduce((sum, p) => sum + p.yellowCards, 0),
    redCards: players.awayTeam.players.reduce((sum, p) => sum + p.redCards, 0),
    passes: players.awayTeam.players.reduce((sum, p) => sum + p.minutesPlayed, 0), // Mock
    possession: 45, // Mock
    shots: 8, // Mock
    shotsOnTarget: 3, // Mock
    corners: 3, // Mock
    fouls: 12, // Mock
    offsides: 1, // Mock
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {players.homeTeam.teamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold">{players.homeTeam.teamName}</span>
          </div>
          <CardTitle>Статистика</CardTitle>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{players.awayTeam.teamName}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {players.awayTeam.teamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatBar
          label="Владение мячом %"
          home={homeStats.possession}
          away={awayStats.possession}
        />
        <StatBar label="Удары" home={homeStats.shots} away={awayStats.shots} />
        <StatBar
          label="Удары в створ"
          home={homeStats.shotsOnTarget}
          away={awayStats.shotsOnTarget}
        />
        <StatBar label="Угловые" home={homeStats.corners} away={awayStats.corners} />
        <StatBar label="Фолы" home={homeStats.fouls} away={awayStats.fouls} />
        <StatBar label="Офсайды" home={homeStats.offsides} away={awayStats.offsides} />
        <StatBar
          label="Жёлтые карточки"
          home={homeStats.yellowCards}
          away={awayStats.yellowCards}
        />
        <StatBar
          label="Красные карточки"
          home={homeStats.redCards}
          away={awayStats.redCards}
        />
        <StatBar label="Передачи" home={homeStats.passes} away={awayStats.passes} />
      </CardContent>
    </Card>
  );
}


