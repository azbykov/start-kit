/**
 * TypeScript types for Matches (Public and Admin)
 * Derived from API contracts - source of truth
 */

/**
 * Match status enum
 */
export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED";

/**
 * Match entity as returned from public API
 */
export interface Match {
  id: string;
  date: string; // ISO 8601 date
  time: string | null; // HH:MM format
  stadium: string | null;
  status: MatchStatus;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  tournamentId: string | null;
  tournamentName: string | null;
  // Extended match metadata
  roundId?: number | null;
  gameweek?: number | null;
  seasonId?: string | null;
  competitionId?: string | null;
  winnerId?: string | null;
  venue?: string | null;
  duration?: string | null; // "Regular", "ExtraTime", "Penalties"
  // Extended scores
  homeScoreHT?: number | null;
  awayScoreHT?: number | null;
  homeScoreET?: number | null;
  awayScoreET?: number | null;
  homeScoreP?: number | null;
  awayScoreP?: number | null;
  createdAt: string; // ISO 8601 date
  updatedAt: string; // ISO 8601 date
}

/**
 * Match profile for public display
 */
export interface MatchProfile {
  id: string;
  date: string; // ISO 8601 date
  time: string | null; // HH:MM format
  stadium: string | null;
  status: MatchStatus;
  homeTeam: {
    id: string;
    name: string;
    logo: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string | null;
  };
  homeScore: number | null;
  awayScore: number | null;
  tournament: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  // Extended fields
  roundId?: number | null;
  gameweek?: number | null;
  seasonId?: string | null;
  competitionId?: string | null;
  winnerId?: string | null;
  venue?: string | null;
  duration?: string | null;
  homeScoreHT?: number | null;
  awayScoreHT?: number | null;
  homeScoreET?: number | null;
  awayScoreET?: number | null;
  homeScoreP?: number | null;
  awayScoreP?: number | null;
}

/**
 * Match player statistics
 */
export interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  playerName: string;
  playerImage: string | null;
  playerPosition: string[]; // Array of Position enum values
  teamId: string;
  teamName: string;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  isStarter: boolean;
  positionInFormation?: number | null;
  substitutionMinute?: number | null;
  substitutedForId?: string | null;
}

/**
 * Match players grouped by team
 */
export interface MatchPlayersResponse {
  homeTeam: {
    teamId: string;
    teamName: string;
    players: MatchPlayer[];
  };
  awayTeam: {
    teamId: string;
    teamName: string;
    players: MatchPlayer[];
  };
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination input parameters
 */
export interface PaginationInput {
  page: number;
  pageSize: number;
}

/**
 * Response from GET /api/matches (public list)
 */
export interface MatchesListResponse {
  matches: Match[];
  pagination: Pagination;
}

/**
 * Request body for POST /api/admin/matches (create)
 */
export interface CreateMatchRequest {
  date: string; // ISO 8601 date string
  time?: string | null; // HH:MM format
  stadium?: string | null;
  status?: MatchStatus;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number | null;
  awayScore?: number | null;
  tournamentId?: string | null;
  // Extended fields
  roundId?: number | null;
  gameweek?: number | null;
  seasonId?: string | null;
  competitionId?: string | null;
  winnerId?: string | null;
  venue?: string | null;
  duration?: string | null;
  homeScoreHT?: number | null;
  awayScoreHT?: number | null;
  homeScoreET?: number | null;
  awayScoreET?: number | null;
  homeScoreP?: number | null;
  awayScoreP?: number | null;
}

/**
 * Request body for PATCH /api/admin/matches/[id] (update)
 */
export interface UpdateMatchRequest {
  date?: string; // ISO 8601 date string
  time?: string | null; // HH:MM format
  stadium?: string | null;
  status?: MatchStatus;
  homeTeamId?: string;
  awayTeamId?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  tournamentId?: string | null;
  // Extended fields
  roundId?: number | null;
  gameweek?: number | null;
  seasonId?: string | null;
  competitionId?: string | null;
  winnerId?: string | null;
  venue?: string | null;
  duration?: string | null;
  homeScoreHT?: number | null;
  awayScoreHT?: number | null;
  homeScoreET?: number | null;
  awayScoreET?: number | null;
  homeScoreP?: number | null;
  awayScoreP?: number | null;
}

/**
 * Request body for POST /api/admin/matches/[id]/players (add player)
 */
export interface AddMatchPlayerRequest {
  playerId: string;
  teamId: string;
  goals?: number;
  assists?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  isStarter?: boolean;
  positionInFormation?: number | null;
  substitutionMinute?: number | null;
  substitutedForId?: string | null;
}

/**
 * Request body for PATCH /api/admin/matches/[id]/players/[playerId] (update player stats)
 */
export interface UpdateMatchPlayerRequest {
  goals?: number;
  assists?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  isStarter?: boolean;
  positionInFormation?: number | null;
  substitutionMinute?: number | null;
  substitutedForId?: string | null;
}

/**
 * Response from DELETE /api/admin/matches/[id]
 */
export interface DeleteMatchResponse {
  success: boolean;
  message: string;
}

/**
 * API error response format
 */
export interface ApiError {
  error: string; // Russian error message
}

/**
 * Match referee information
 */
export interface MatchReferee {
  id: string;
  matchId: string;
  refereeId: string;
  role: string; // "referee", "firstAssistant", "secondAssistant", "fourthOfficial"
  createdAt: string;
}

/**
 * Match event position coordinates
 */
export interface EventPosition {
  x: number; // 0-100
  y: number; // 0-100
}

/**
 * Match event tag
 */
export interface MatchEventTag {
  id: string;
  eventId: string;
  tagId: number;
}

/**
 * Match event (pass, shot, foul, etc.)
 */
export interface MatchEvent {
  id: string;
  matchId: string;
  eventId: number; // тип события
  subEventId: number | null; // подтип события
  eventName: string;
  subEventName: string | null;
  player: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  matchPeriod: string; // "1H", "2H", "ET1", "ET2", "P"
  eventSec: number; // секунда события
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
  tags: MatchEventTag[];
  createdAt: string;
}

/**
 * Match formation structure
 */
export interface MatchFormation {
  id: string;
  matchId: string;
  teamId: string;
  formation: {
    lineup: Array<{
      playerId: string;
      assists: string;
      goals: string;
      ownGoals: string;
      redCards: string;
      yellowCards: string;
    }>;
    bench: Array<{
      playerId: string;
      assists: string;
      goals: string;
      ownGoals: string;
      redCards: string;
      yellowCards: string;
    }>;
    substitutions: Array<{
      playerIn: string;
      playerOut: string;
      minute: number;
      assists?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for POST /api/admin/matches/[id]/referees (add referee)
 */
export interface AddMatchRefereeRequest {
  refereeId: string;
  role: string;
}

/**
 * Request body for POST /api/admin/matches/[id]/events (add event)
 */
export interface AddMatchEventRequest {
  eventId: number;
  subEventId?: number | null;
  eventName: string;
  subEventName?: string | null;
  playerId?: string | null;
  teamId: string;
  matchPeriod: string;
  eventSec: number;
  startX?: number | null;
  startY?: number | null;
  endX?: number | null;
  endY?: number | null;
  tags?: Array<{ tagId: number }>;
}

/**
 * Request body for POST /api/admin/matches/[id]/formations (add/update formation)
 */
export interface AddMatchFormationRequest {
  teamId: string;
  formation: {
    lineup: Array<{
      playerId: string;
      assists?: string;
      goals?: string;
      ownGoals?: string;
      redCards?: string;
      yellowCards?: string;
    }>;
    bench: Array<{
      playerId: string;
      assists?: string;
      goals?: string;
      ownGoals?: string;
      redCards?: string;
      yellowCards?: string;
    }>;
    substitutions?: Array<{
      playerIn: string;
      playerOut: string;
      minute: number;
      assists?: string;
    }>;
  };
}

