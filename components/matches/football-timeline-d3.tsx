"use client";

import { useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import type { MatchEvent } from "@/lib/types/matches";
import type { PlayerMatchEvent } from "@/lib/types/players";

interface FootballTimelineD3Props {
  events: MatchEvent[] | PlayerMatchEvent[];
  homeTeamId: string;
  awayTeamId: string;
  width?: number;
  height?: number;
  className?: string;
  filterByPlayerId?: string;
  playerTeamId?: string; // Team ID for player events (when using PlayerMatchEvent)
}

/**
 * Unified event type for timeline
 */
type TimelineEvent = (MatchEvent | PlayerMatchEvent) & {
  teamId?: string;
  isHome?: boolean;
  totalSeconds?: number;
  yOffset?: number;
};

/**
 * Event type statistics
 */
interface EventTypeStats {
  name: string;
  count: number;
  color: string;
}

/**
 * Convert event time to total seconds in match
 */
function eventToSeconds(event: TimelineEvent): number {
  const periodMap: Record<string, number> = {
    "1H": 0,
    "2H": 2700, // 45 minutes * 60 seconds
    ET1: 5400, // 90 minutes
    ET2: 6300, // 105 minutes
    P: 7200, // 120 minutes (penalties start)
  };

  const periodOffset = periodMap[event.matchPeriod] || 0;
  return periodOffset + event.eventSec;
}

/**
 * Format time for display (e.g., "45'", "90+3'")
 */
function formatTime(seconds: number): string {
  if (seconds <= 2700) {
    // First half
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  } else if (seconds <= 5400) {
    // Second half
    const minutes = Math.floor((seconds - 2700) / 60);
    return `${45 + minutes}'`;
  } else {
    // Extra time
    const minutes = Math.floor((seconds - 5400) / 60);
    return `${90 + minutes}'`;
  }
}

/**
 * Get event color based on type
 */
function getEventColor(
  eventName: string,
  teamId: string | undefined,
  homeTeamId: string
): string {
  const isHome = teamId === homeTeamId;
  const eventNameLower = eventName.toLowerCase();

  if (eventNameLower.includes("goal") || eventNameLower.includes("гол")) {
    return isHome ? "#22c55e" : "#3b82f6"; // Green for home, blue for away
  }
  if (eventNameLower.includes("shot") || eventNameLower.includes("удар")) {
    return "#3b82f6"; // Blue
  }
  if (eventNameLower.includes("pass") || eventNameLower.includes("передача")) {
    return "#8b5cf6"; // Purple
  }
  if (eventNameLower.includes("foul") || eventNameLower.includes("фол")) {
    return "#ef4444"; // Red
  }
  if (eventNameLower.includes("card") || eventNameLower.includes("карточк")) {
    return "#f59e0b"; // Orange/Yellow
  }
  if (eventNameLower.includes("dribble") || eventNameLower.includes("дриблинг")) {
    return "#10b981"; // Green
  }
  if (eventNameLower.includes("tackle") || eventNameLower.includes("отбор")) {
    return "#6366f1"; // Indigo
  }

  return "#6b7280"; // Default gray
}

/**
 * Get event display name (with subEventName if available)
 */
function getEventDisplayName(event: TimelineEvent): string {
  if (event.subEventName) {
    return `${event.eventName} (${event.subEventName})`;
  }
  return event.eventName;
}

/**
 * Get event tooltip text
 */
function getEventTooltipText(event: TimelineEvent): string {
  const time = formatTime(event.totalSeconds || eventToSeconds(event));
  const eventType = getEventDisplayName(event);

  if ("player" in event && event.player) {
    return `${time}\n${eventType}\n${event.player.name}`;
  }
  if ("team" in event && event.team) {
    return `${time}\n${eventType}\n${event.team.name}`;
  }

  return `${time}\n${eventType}`;
}

/**
 * Group events by type and calculate statistics
 */
function getEventTypeStats(events: TimelineEvent[]): EventTypeStats[] {
  const statsMap = new Map<string, { count: number; color: string }>();

  events.forEach((event) => {
    const displayName = getEventDisplayName(event);
    const color = getEventColor(event.eventName, event.teamId, "");

    const existing = statsMap.get(displayName);
    if (existing) {
      existing.count += 1;
    } else {
      statsMap.set(displayName, { count: 1, color });
    }
  });

  return Array.from(statsMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color,
    }))
    .sort((a, b) => b.count - a.count);
}

export function FootballTimelineD3({
  events,
  homeTeamId,
  awayTeamId,
  width = 1200,
  height = 300,
  className = "",
  filterByPlayerId,
  playerTeamId,
}: FootballTimelineD3Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Process and normalize events
  const { timelineData, eventStats } = useMemo(() => {
    let processedEvents: TimelineEvent[] = events.map((event) => {
      // Determine teamId based on event type
      let eventTeamId: string | undefined;
      if ("team" in event && event.team) {
        // MatchEvent has team object
        eventTeamId = event.team.id;
      } else if (playerTeamId) {
        // PlayerMatchEvent - use provided playerTeamId
        eventTeamId = playerTeamId;
      } else if ("teamId" in event) {
        // Fallback if teamId is directly in event
        eventTeamId = (event as any).teamId;
      }

      const normalized: TimelineEvent = {
        ...event,
        teamId: eventTeamId,
        isHome: eventTeamId === homeTeamId,
      };
      return normalized;
    });

    // Filter by player if needed
    if (filterByPlayerId) {
      processedEvents = processedEvents.filter(
        (e) => "player" in e && e.player?.id === filterByPlayerId
      );
    }

    // Convert to timeline format and sort
    const timeline = processedEvents
      .map((event) => ({
        ...event,
        totalSeconds: eventToSeconds(event),
      }))
      .sort((a, b) => a.totalSeconds - b.totalSeconds);

    // Calculate event type statistics
    const stats = getEventTypeStats(timeline);

    return { timelineData: timeline, eventStats: stats };
  }, [events, homeTeamId, filterByPlayerId, playerTeamId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    d3.select(container).selectAll("*").remove();

    if (timelineData.length === 0) {
      d3.select(container)
        .append("div")
        .attr(
          "class",
          "flex items-center justify-center h-full text-sm text-muted-foreground"
        )
        .text("События не найдены");
      return;
    }

    // Layout dimensions
    const legendWidth = 200;
    const chartWidth = width - legendWidth - 200; // 200 for right histogram
    const chartHeight = height - 60; // Space for top activity bar

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background", "transparent");

    // Margins for main timeline
    const margin = { top: 50, right: 20, bottom: 50, left: legendWidth + 20 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    // Create main group for timeline
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Time scale (0 to max time)
    const maxTime = Math.max(
      ...timelineData.map((d) => d.totalSeconds || 0),
      5400 // Default to 90 minutes if no events
    );
    const xScale = d3
      .scaleLinear()
      .domain([0, maxTime])
      .range([0, innerWidth]);

    // Calculate activity density (events per minute)
    const activityData: Array<{ time: number; count: number }> = [];
    const binSize = 300; // 5 minutes in seconds
    for (let t = 0; t <= maxTime; t += binSize) {
      const count = timelineData.filter(
        (e) =>
          (e.totalSeconds || 0) >= t &&
          (e.totalSeconds || 0) < t + binSize
      ).length;
      activityData.push({ time: t + binSize / 2, count });
    }

    const maxActivity = Math.max(...activityData.map((d) => d.count), 1);
    const activityHeight = 20;

    // Draw activity bar
    const activityScale = d3
      .scaleLinear()
      .domain([0, maxActivity])
      .range([0, activityHeight]);

    activityData.forEach((d) => {
      const x = xScale(d.time) - binSize / 2;
      const barWidth = xScale(binSize) - xScale(0);
      const barHeight = activityScale(d.count);

      g.append("rect")
        .attr("x", x)
        .attr("y", -margin.top + activityHeight - barHeight)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", "#86efac")
        .attr("opacity", 0.6)
        .attr("rx", 2);
    });

    // Draw timeline axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => {
        const seconds = typeof d === "number" ? d : Number(d);
        return formatTime(seconds);
      })
      .ticks(10);

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight / 2})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "hsl(var(--muted-foreground))");

    // Style axis line and ticks
    g.selectAll(".axis line, .axis path")
      .style("stroke", "hsl(var(--border))")
      .style("stroke-width", 1);

    // Draw central timeline line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", innerHeight / 2)
      .attr("x2", innerWidth)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 2);

    // Draw period dividers
    const periods = [
      { name: "1-й тайм", end: 2700 },
      { name: "2-й тайм", end: 5400 },
    ];

    periods.forEach((period) => {
      const x = xScale(period.end);
      if (x > 0 && x < innerWidth) {
        g.append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", innerHeight)
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4");

        g.append("text")
          .attr("x", x)
          .attr("y", innerHeight / 2 - 15)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "hsl(var(--muted-foreground))")
          .text(period.name);
      }
    });

    // Group events by time to avoid overlap
    const eventGroups: Array<{
      time: number;
      events: typeof timelineData;
    }> = [];

    timelineData.forEach((event) => {
      const totalSeconds = event.totalSeconds || 0;
      // Find if there's a group at this time (within 60 seconds)
      const existingGroup = eventGroups.find(
        (g) => Math.abs(g.time - totalSeconds) < 60
      );

      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        eventGroups.push({
          time: totalSeconds,
          events: [event],
        });
      }
    });

    // Calculate y offsets for overlapping events
    eventGroups.forEach((group) => {
      if (group.events.length > 1) {
        group.events.forEach((event, j) => {
          const offset = (j - (group.events.length - 1) / 2) * 25;
          event.yOffset = offset;
        });
      }
    });

    // Create tooltip container
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "football-timeline-tooltip absolute bg-popover text-popover-foreground text-xs p-2 rounded-md border shadow-md pointer-events-none opacity-0 z-50"
      )
      .style("font-size", "11px")
      .style("max-width", "200px")
      .style("line-height", "1.4");

    // Draw events
    timelineData.forEach((event) => {
      const totalSeconds = event.totalSeconds || 0;
      const x = xScale(totalSeconds);
      let y = innerHeight / 2;

      // For match events: home team events above, away team events below
      // For player events: all events on the line
      if (event.isHome !== undefined && !filterByPlayerId) {
        y = event.isHome
          ? innerHeight / 2 - 30 - (event.yOffset || 0)
          : innerHeight / 2 + 30 + (event.yOffset || 0);
      } else {
        // For player stats: all events on line with vertical offset if overlapping
        y = innerHeight / 2 + (event.yOffset || 0);
      }

      const color = getEventColor(
        event.eventName,
        event.teamId,
        homeTeamId
      );

      // Draw line to timeline (if offset)
      if (event.yOffset) {
        g.append("line")
          .attr("x1", x)
          .attr("y1", innerHeight / 2)
          .attr("x2", x)
          .attr("y2", y)
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("opacity", 0.3);
      }

      // Draw event marker
      const marker = g
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .style("transition", "r 0.2s")
        .style("opacity", 0.8);

      // Add hover interactions
      marker
        .on("mouseover", function (d3Event) {
          d3.select(this).attr("r", 7).style("opacity", 1);
          const tooltipText = getEventTooltipText(event);
          tooltip
            .style("opacity", 1)
            .html(tooltipText.replace(/\n/g, "<br/>"))
            .style("left", `${(d3Event as MouseEvent).pageX + 10}px`)
            .style("top", `${(d3Event as MouseEvent).pageY - 10}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 5).style("opacity", 0.8);
          tooltip.style("opacity", 0);
        });
    });

    // Draw legend on the left
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(10, ${margin.top})`);

    legendGroup
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "hsl(var(--foreground))")
      .text("Типы событий");

    const legendItemHeight = 20;
    const maxLegendItems = Math.min(eventStats.length, 10);

    eventStats.slice(0, maxLegendItems).forEach((stat, i) => {
      const y = i * legendItemHeight;

      // Color indicator
      legendGroup
        .append("circle")
        .attr("cx", 5)
        .attr("cy", y + 5)
        .attr("r", 4)
        .attr("fill", stat.color)
        .attr("opacity", 0.8);

      // Event name and count
      legendGroup
        .append("text")
        .attr("x", 15)
        .attr("y", y + 9)
        .style("font-size", "10px")
        .style("fill", "hsl(var(--foreground))")
        .text(`${stat.name} (${stat.count})`);
    });

    // Draw histogram on the right
    const histogramGroup = svg
      .append("g")
      .attr("transform", `translate(${width - 180}, ${margin.top})`);

    histogramGroup
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "hsl(var(--foreground))")
      .text("Частота");

    const maxCount = Math.max(...eventStats.map((s) => s.count), 1);
    const histogramWidth = 150;
    const histogramBarHeight = 12;
    const histogramSpacing = 2;

    eventStats.slice(0, maxLegendItems).forEach((stat, i) => {
      const y = i * (histogramBarHeight + histogramSpacing);
      const barWidth = (stat.count / maxCount) * histogramWidth;

      // Bar
      histogramGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", barWidth)
        .attr("height", histogramBarHeight)
        .attr("fill", stat.color)
        .attr("opacity", 0.7)
        .attr("rx", 2);

      // Count label
      histogramGroup
        .append("text")
        .attr("x", barWidth + 5)
        .attr("y", y + histogramBarHeight - 2)
        .style("font-size", "10px")
        .style("fill", "hsl(var(--muted-foreground))")
        .text(stat.count.toString());
    });

    // Cleanup function
    return () => {
      d3.select("body").selectAll(".football-timeline-tooltip").remove();
    };
  }, [timelineData, eventStats, width, height, homeTeamId, filterByPlayerId]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="w-full"
        style={{ minHeight: `${height}px` }}
      />
    </div>
  );
}





