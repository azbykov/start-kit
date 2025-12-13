"use client";

import { useCallback, useMemo } from "react";
import * as d3 from "d3";
import { FootballPitch } from "./football-pitch";
import type { PlayerMatchEvent } from "@/lib/types/players";
import { filterEventsByPeriod } from "@/lib/utils/football-pitch";

interface ActionHeatmapProps {
  events: PlayerMatchEvent[];
  period?: "1H" | "2H" | "all";
  eventTypes?: string[];
  width?: number;
  height?: number;
}

export function ActionHeatmap({
  events,
  period = "all",
  eventTypes,
  width = 800,
  height = 400,
}: ActionHeatmapProps) {
  // Filter events
  const eventsWithCoords = useMemo(() => {
    let filtered = filterEventsByPeriod(events, period);
    if (eventTypes && eventTypes.length > 0) {
      filtered = filtered.filter((e) =>
        eventTypes.some((type) =>
          e.eventName.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Filter events with coordinates
    return filtered.filter((e) => e.startX !== null && e.startY !== null);
  }, [events, period, eventTypes]);

  const renderHeatmap = useCallback((
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    eventsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    // Clear previous events
    eventsGroup.selectAll(".heatmap-event").remove();

    if (eventsWithCoords.length === 0) return;

    // Create density data points
    const dataPoints = eventsWithCoords.map((event) => [
      xScale(event.startX!),
      yScale(event.startY!),
    ]);

    // Create color scale (from transparent blue to red/yellow)
    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(Array.from({ length: eventsWithCoords.length })) || 1]);

    // Simple approach: draw circles with opacity based on density
    // Group nearby events
    const radius = 15;
    const intensityMap = new Map<string, number>();

    eventsWithCoords.forEach((event) => {
      if (event.startX === null || event.startY === null) return;
      const x = Math.floor(event.startX / 5) * 5; // Round to grid
      const y = Math.floor(event.startY / 5) * 5;
      const key = `${x},${y}`;
      intensityMap.set(key, (intensityMap.get(key) || 0) + 1);
    });

    // Find max intensity for normalization
    const maxIntensity = Math.max(...Array.from(intensityMap.values()));

    // Draw heatmap circles
    intensityMap.forEach((intensity, key) => {
      const [x, y] = key.split(",").map(Number);
      const normalizedIntensity = intensity / maxIntensity;
      const opacity = Math.min(0.7, 0.3 + normalizedIntensity * 0.4);
      const circleRadius = 10 + normalizedIntensity * 15;

      eventsGroup
        .append("circle")
        .attr("class", "heatmap-event")
        .attr("cx", xScale(x))
        .attr("cy", yScale(y))
        .attr("r", circleRadius)
        .attr("fill", colorScale(normalizedIntensity))
        .attr("opacity", opacity);
    });

    // Alternative: draw individual points with low opacity for better granularity
    eventsWithCoords.forEach((event) => {
      if (event.startX === null || event.startY === null) return;
      const x = xScale(event.startX);
      const y = yScale(event.startY);

      eventsGroup
        .append("circle")
        .attr("class", "heatmap-event")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3);
    });
  }, [eventsWithCoords]);

  return (
    <div className="relative">
      <FootballPitch
        width={width}
        height={height}
        onRender={renderHeatmap}
        className="w-full"
      />
      {eventsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">События не найдены</p>
        </div>
      )}
    </div>
  );
}

