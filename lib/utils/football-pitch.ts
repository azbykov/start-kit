import type { PlayerMatchEvent } from "@/lib/types/players";

/**
 * Filter events by event type name
 */
export function filterEventsByType(
  events: PlayerMatchEvent[],
  type: string | string[]
): PlayerMatchEvent[] {
  const types = Array.isArray(type) ? type : [type];
  return events.filter((event) =>
    types.some((t) =>
      event.eventName.toLowerCase().includes(t.toLowerCase())
    )
  );
}

/**
 * Check if event is successful (has tagId 1801)
 */
export function isSuccessfulEvent(event: PlayerMatchEvent): boolean {
  return event.tags.some((tag) => tag.tagId === 1801);
}

/**
 * Check if shot is on target (has tagId 101 or is successful)
 */
export function isShotOnTarget(event: PlayerMatchEvent): boolean {
  return (
    event.tags.some((tag) => tag.tagId === 101) || isSuccessfulEvent(event)
  );
}

/**
 * Check if pass is a cross (has tagId 2 or eventName contains "cross")
 */
export function isCross(event: PlayerMatchEvent): boolean {
  return (
    event.tags.some((tag) => tag.tagId === 2) ||
    event.eventName.toLowerCase().includes("cross") ||
    event.subEventName?.toLowerCase().includes("cross") ||
    false
  );
}

/**
 * Check if pass is forward (endX > startX)
 */
export function isForwardPass(event: PlayerMatchEvent): boolean {
  if (event.startX === null || event.endX === null) return false;
  return event.endX > event.startX;
}

/**
 * Check if pass is backward (endX < startX)
 */
export function isBackwardPass(event: PlayerMatchEvent): boolean {
  if (event.startX === null || event.endX === null) return false;
  return event.endX < event.startX;
}

/**
 * Get color for event based on type and success
 */
export function getEventColor(
  event: PlayerMatchEvent,
  type: "shot" | "pass" | "dribble" | "duel" | "tackle"
): string {
  const isSuccessful = isSuccessfulEvent(event);

  switch (type) {
    case "shot":
      if (event.eventName.toLowerCase().includes("goal")) {
        return "#22c55e"; // Green for goals
      }
      return isShotOnTarget(event) ? "#22c55e" : "#ef4444"; // Green/Red
    case "pass":
      return isSuccessful ? "#22c55e" : "#ef4444"; // Green/Red
    case "dribble":
      return isSuccessful ? "#22c55e" : "#ef4444"; // Green/Red
    case "duel":
      return isSuccessful ? "#22c55e" : "#ef4444"; // Green/Red
    case "tackle":
      return isSuccessful ? "#22c55e" : "#ef4444"; // Green/Red
    default:
      return "#6b7280"; // Gray
  }
}

/**
 * Format event tooltip text
 */
export function formatEventTooltip(event: PlayerMatchEvent): string {
  const minutes = Math.floor(event.eventSec / 60);
  const periodMap: Record<string, string> = {
    "1H": "1-й тайм",
    "2H": "2-й тайм",
    ET1: "Доп. время 1",
    ET2: "Доп. время 2",
    P: "Пенальти",
  };
  const period = periodMap[event.matchPeriod] || event.matchPeriod;
  const isSuccessful = isSuccessfulEvent(event);
  const successText = isSuccessful ? "Успешно" : "Неуспешно";

  return `${event.eventName}${event.subEventName ? ` (${event.subEventName})` : ""}\n${period} ${minutes}'\n${successText}`;
}

/**
 * Filter events by period
 */
export function filterEventsByPeriod(
  events: PlayerMatchEvent[],
  period: "1H" | "2H" | "all"
): PlayerMatchEvent[] {
  if (period === "all") return events;
  return events.filter((e) => e.matchPeriod === period);
}

