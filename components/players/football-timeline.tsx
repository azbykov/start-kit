"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PlayerMatchEvent } from "@/lib/types/players";

interface FootballTimelineProps {
  events: PlayerMatchEvent[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Convert event time to total seconds in match
 */
function eventToSeconds(event: PlayerMatchEvent): number {
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

export function FootballTimeline({
  events,
  width = 800,
  height = 200,
  className,
}: FootballTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Process events: convert to timeline format
  const timelineData = useMemo(() => {
    return events
      .map((event) => ({
        ...event,
        totalSeconds: eventToSeconds(event),
      }))
      .sort((a, b) => a.totalSeconds - b.totalSeconds);
  }, [events]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

      // Clear previous content
      d3.select(container).selectAll("*").remove();

      if (timelineData.length === 0) {
        d3.select(container)
          .append("div")
          .attr("class", "flex items-center justify-center h-full text-sm text-muted-foreground")
          .text("События не найдены");
        return;
      }

      // Create SVG
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // Margins
      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create main group
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Time scale (0 to max time)
      const maxTime = Math.max(
        ...timelineData.map((d) => d.totalSeconds),
        5400 // Default to 90 minutes if no events
      );
      const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, innerWidth]);

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
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", "#6b7280");

      // Draw timeline line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", innerHeight / 2)
        .attr("x2", innerWidth)
        .attr("y2", innerHeight / 2)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 2);

      // Draw period dividers
      const periods = [
        { name: "1-й тайм", end: 2700 },
        { name: "2-й тайм", end: 5400 },
      ];

      periods.forEach((period) => {
        const x = xScale(period.end);
        g.append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", innerHeight)
          .attr("stroke", "#d1d5db")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4");

        g.append("text")
          .attr("x", x)
          .attr("y", innerHeight + 25)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "#9ca3af")
          .text(period.name);
      });

      // Group events by time to avoid overlap
      const eventGroups: Array<{
        time: number;
        events: typeof timelineData;
        yOffset: number;
      }> = [];

      timelineData.forEach((event) => {
        // Find if there's a group at this time (within 30 seconds)
        const existingGroup = eventGroups.find(
          (g) => Math.abs(g.time - event.totalSeconds) < 30
        );

        if (existingGroup) {
          existingGroup.events.push(event);
        } else {
          eventGroups.push({
            time: event.totalSeconds,
            events: [event],
            yOffset: 0,
          });
        }
      });

      // Calculate y offsets for overlapping events
      eventGroups.forEach((group, i) => {
        if (group.events.length > 1) {
          group.events.forEach((event, j) => {
            const offset = (j - (group.events.length - 1) / 2) * 20;
            (event as any).yOffset = offset;
          });
        }
      });

      // Draw events
      timelineData.forEach((event) => {
        const x = xScale(event.totalSeconds);
        const y = innerHeight / 2 + ((event as any).yOffset || 0);

        // Determine color based on event type
        let color = "#6b7280"; // Default gray
        if (event.eventName.toLowerCase().includes("goal")) {
          color = "#22c55e"; // Green for goals
        } else if (event.eventName.toLowerCase().includes("shot")) {
          color = "#3b82f6"; // Blue for shots
        } else if (event.eventName.toLowerCase().includes("pass")) {
          color = "#8b5cf6"; // Purple for passes
        } else if (event.eventName.toLowerCase().includes("foul")) {
          color = "#ef4444"; // Red for fouls
        } else if (event.eventName.toLowerCase().includes("card")) {
          color = "#f59e0b"; // Orange for cards
        }

        // Draw event marker
        const marker = g
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 6)
          .attr("fill", color)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2)
          .style("cursor", "pointer");

        // Draw line to timeline
        if ((event as any).yOffset) {
          g.append("line")
            .attr("x1", x)
            .attr("y1", innerHeight / 2)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", color)
            .attr("stroke-width", 1)
            .attr("opacity", 0.3);
        }

        // Create tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "football-timeline-tooltip absolute bg-black text-white text-xs p-2 rounded pointer-events-none opacity-0 z-50")
          .style("font-size", "11px");

        // Add hover interactions
        marker
          .on("mouseover", function (d3Event) {
            d3.select(this).attr("r", 8);
            const tooltipText = `${event.eventName}${event.subEventName ? ` (${event.subEventName})` : ""}\n${formatTime(event.totalSeconds)}`;
            tooltip
              .style("opacity", 1)
              .html(tooltipText.replace(/\n/g, "<br/>"))
              .style("left", `${d3Event.pageX + 10}px`)
              .style("top", `${d3Event.pageY - 10}px`);
          })
          .on("mouseout", function () {
            d3.select(this).attr("r", 6);
            tooltip.style("opacity", 0);
          });
      });

      // Cleanup function
      return () => {
        d3.select("body").selectAll(".football-timeline-tooltip").remove();
      };
    },
    [timelineData, width, height]
  );

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

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Margins
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Time scale (0 to max time)
    const maxTime = Math.max(
      ...timelineData.map((d) => d.totalSeconds),
      5400 // Default to 90 minutes if no events
    );
    const xScale = d3
      .scaleLinear()
      .domain([0, maxTime])
      .range([0, innerWidth]);

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
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#6b7280");

    // Draw timeline line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", innerHeight / 2)
      .attr("x2", innerWidth)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 2);

    // Draw period dividers
    const periods = [
      { name: "1-й тайм", end: 2700 },
      { name: "2-й тайм", end: 5400 },
    ];

    periods.forEach((period) => {
      const x = xScale(period.end);
      g.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", innerHeight)
        .attr("stroke", "#d1d5db")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

      g.append("text")
        .attr("x", x)
        .attr("y", innerHeight + 25)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#9ca3af")
        .text(period.name);
    });

    // Group events by time to avoid overlap
    const eventGroups: Array<{
      time: number;
      events: typeof timelineData;
      yOffset: number;
    }> = [];

    timelineData.forEach((event) => {
      // Find if there's a group at this time (within 30 seconds)
      const existingGroup = eventGroups.find(
        (g) => Math.abs(g.time - event.totalSeconds) < 30
      );

      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        eventGroups.push({
          time: event.totalSeconds,
          events: [event],
          yOffset: 0,
        });
      }
    });

    // Calculate y offsets for overlapping events
    eventGroups.forEach((group) => {
      if (group.events.length > 1) {
        group.events.forEach((event, j) => {
          const offset = (j - (group.events.length - 1) / 2) * 20;
          (event as any).yOffset = offset;
        });
      }
    });

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "football-timeline-tooltip absolute bg-black text-white text-xs p-2 rounded pointer-events-none opacity-0 z-50"
      )
      .style("font-size", "11px");

    // Draw events
    timelineData.forEach((event) => {
      const x = xScale(event.totalSeconds);
      const y = innerHeight / 2 + ((event as any).yOffset || 0);

      // Determine color based on event type
      let color = "#6b7280"; // Default gray
      if (event.eventName.toLowerCase().includes("goal")) {
        color = "#22c55e"; // Green for goals
      } else if (event.eventName.toLowerCase().includes("shot")) {
        color = "#3b82f6"; // Blue for shots
      } else if (event.eventName.toLowerCase().includes("pass")) {
        color = "#8b5cf6"; // Purple for passes
      } else if (event.eventName.toLowerCase().includes("foul")) {
        color = "#ef4444"; // Red for fouls
      } else if (event.eventName.toLowerCase().includes("card")) {
        color = "#f59e0b"; // Orange for cards
      }

      // Draw event marker
      const marker = g
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 6)
        .attr("fill", color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer");

      // Draw line to timeline
      if ((event as any).yOffset) {
        g.append("line")
          .attr("x1", x)
          .attr("y1", innerHeight / 2)
          .attr("x2", x)
          .attr("y2", y)
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("opacity", 0.3);
      }

      // Add hover interactions
      marker
        .on("mouseover", function (d3Event) {
          d3.select(this).attr("r", 8);
          const tooltipText = `${event.eventName}${event.subEventName ? ` (${event.subEventName})` : ""}\n${formatTime(event.totalSeconds)}`;
          tooltip
            .style("opacity", 1)
            .html(tooltipText.replace(/\n/g, "<br/>"))
            .style("left", `${d3Event.pageX + 10}px`)
            .style("top", `${d3Event.pageY - 10}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 6);
          tooltip.style("opacity", 0);
        });
    });

    // Cleanup function
    return () => {
      d3.select("body").selectAll(".football-timeline-tooltip").remove();
    };
  }, [timelineData, width, height]);

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
