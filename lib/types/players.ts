/**
 * TypeScript types for Players (Public and Admin)
 * Derived from API contracts - source of truth
 */

import { Position } from "@prisma/client";

/**
 * Player entity as returned from public API
 */
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: Position[]; // Array of positions
  dateOfBirth: string; // ISO 8601 date
  teamId: string | null;
  teamName: string | null; // Team name for display
  image: string | null;
  marketValue: number | null;
  contractExpires: string | null; // ISO 8601 date
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  videoLinks: string[];
}

/**
 * Player profile for public display (with statistics grouped)
 */
export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  position: Position[]; // Array of Position enum values
  dateOfBirth: string; // ISO 8601 date
  teamId: string | null;
  team: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  image: string | null;
  statistics: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalMinutes: number;
  };
  videoLinks: string[];
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
 * Response from GET /api/players (public list)
 */
export interface PlayersListResponse {
  players: Player[];
  pagination: Pagination;
}

/**
 * Request body for POST /api/admin/players (create)
 */
export interface CreatePlayerRequest {
  firstName: string;
  lastName: string;
  position: Position[]; // Array of positions
  dateOfBirth: string; // ISO 8601 date string
  teamId?: string | null;
  image?: string | null;
  marketValue?: number | null;
  contractExpires?: string | null; // ISO 8601 date string
  totalMatches?: number;
  totalGoals?: number;
  totalAssists?: number;
  totalMinutes?: number;
  videoLinks?: string[];
}

/**
 * Request body for PATCH /api/admin/players/[id] (update)
 */
export interface UpdatePlayerRequest {
  firstName?: string;
  lastName?: string;
  position?: Position[]; // Array of positions
  dateOfBirth?: string; // ISO 8601 date string
  teamId?: string | null;
  image?: string | null;
  marketValue?: number | null;
  contractExpires?: string | null; // ISO 8601 date string
  totalMatches?: number;
  totalGoals?: number;
  totalAssists?: number;
  totalMinutes?: number;
  videoLinks?: string[];
}

/**
 * Response from DELETE /api/admin/players/[id]
 */
export interface DeletePlayerResponse {
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
 * Player match with statistics
 */
export interface PlayerMatch {
  match: {
    id: string;
    date: string; // ISO 8601 date
    time: string | null;
    stadium: string | null;
    status: string;
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
  };
  playerStats: {
    goals: number;
    assists: number;
    ownGoals: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    isStarter: boolean;
  };
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
}

/**
 * Response from GET /api/players/[id]/matches
 */
export interface PlayerMatchesResponse {
  upcoming: PlayerMatch[];
  past: PlayerMatch[];
}

/**
 * Player event with match info
 */
export interface PlayerEvent {
  id: string;
  matchId: string;
  match: {
    id: string;
    date: string; // ISO 8601 date
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
    tournament: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
  };
  eventId: number;
  subEventId: number | null;
  eventName: string;
  subEventName: string | null;
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  matchPeriod: string;
  eventSec: number;
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
  tags: Array<{
    id: string;
    tagId: number;
  }>;
  createdAt: string;
}

/**
 * Response from GET /api/players/[id]/events
 */
export interface PlayerEventsResponse {
  events: PlayerEvent[];
  statistics: Array<{
    eventName: string;
    subEventName: string | null;
    count: number;
    events: PlayerEvent[];
  }>;
}

/**
 * Player event in match (without match info, used in match stats)
 */
export interface PlayerMatchEvent {
  id: string;
  eventId: number;
  subEventId: number | null;
  eventName: string;
  subEventName: string | null;
  matchPeriod: string;
  eventSec: number;
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
  tags: Array<{
    id: string;
    tagId: number;
  }>;
}

/**
 * Statistics for a match period
 */
export interface MatchPeriodStats {
  totalEvents: number;
  shots: number;
  shotsOnTarget: number;
  shotsFromBox: number;
  shotsFromOutside: number;
  passes: number;
  successfulPasses: number;
  crosses: number;
  forwardPasses: number;
  backwardPasses: number;
  goals: number;
  assists: number;
  fouls: number;
  foulsSuffered: number;
  duels: number;
  successfulDuels: number;
  aerialDuels: number;
  groundDuels: number;
  tackles: number;
  dribbles: number;
  successfulDribbles: number;
  interceptions: number;
  recoveries: number;
}

/**
 * Events grouped by match period
 */
export interface PlayerMatchEventsByPeriod {
  "1H": PlayerMatchEvent[];
  "2H": PlayerMatchEvent[];
  ET1: PlayerMatchEvent[];
  ET2: PlayerMatchEvent[];
  P: PlayerMatchEvent[];
}

/**
 * Response from GET /api/players/[id]/matches/[matchId]/stats
 */
export interface PlayerMatchStatsResponse {
  match: {
    id: string;
    date: string; // ISO 8601 date
    time: string | null;
    stadium: string | null;
    status: string;
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
  };
  playerStats: {
    goals: number;
    assists: number;
    ownGoals: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    isStarter: boolean;
  };
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  events: PlayerMatchEvent[];
  eventsByPeriod: PlayerMatchEventsByPeriod;
  statisticsByPeriod: {
    "1H": MatchPeriodStats;
    "2H": MatchPeriodStats;
    total: MatchPeriodStats;
  };
}



