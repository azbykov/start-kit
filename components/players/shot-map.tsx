"use client";

import { useCallback } from "react";
import * as d3 from "d3";
import { FootballPitch } from "./football-pitch";
import type { PlayerMatchEvent } from "@/lib/types/players";
import {
  filterEventsByType,
  isShotOnTarget,
  getEventColor,
  formatEventTooltip,
} from "@/lib/utils/football-pitch";

interface ShotMapProps {
  events: PlayerMatchEvent[];
  period?: "1H" | "2H" | "all";
  width?: number;
  height?: number;
}

export function ShotMap({
  events,
  period = "all",
  width = 800,
  height = 400,
}: ShotMapProps) {
  // Filter shots and goals
  const shotEvents = filterEventsByType(events, ["Shot", "Goal"]);

  const renderShots = useCallback((
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    eventsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    // Clear previous events
    eventsGroup.selectAll(".shot-event").remove();
    
    // Remove existing tooltip if any
    d3.select("body").selectAll(".shot-tooltip").remove();

    if (shotEvents.length === 0) return;

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "shot-tooltip absolute bg-black text-white text-xs p-2 rounded pointer-events-none opacity-0 z-50")
      .style("font-size", "12px");

    shotEvents.forEach((event) => {
      if (event.startX === null || event.startY === null) return;

      const x = xScale(event.startX);
      const y = yScale(event.startY);
      const isGoal = event.eventName.toLowerCase().includes("goal");
      const isOnTarget = isShotOnTarget(event);
      const color = getEventColor(event, "shot");

      // Determine end point (goal center if no end coordinates)
      let endX = x;
      let endY = y;
      if (event.endX !== null && event.endY !== null) {
        endX = xScale(event.endX);
        endY = yScale(event.endY);
      } else {
        // Point towards goal (right side at Y=50)
        endX = xScale(100);
        endY = yScale(50);
      }

      // Draw arrow line for shot
      const line = eventsGroup
        .append("line")
        .attr("class", "shot-event")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", color)
        .attr("stroke-width", isGoal ? 3 : 2)
        .attr("opacity", 0.7)
        .attr("marker-end", "url(#arrowhead)");

      // Draw start point
      const pointRadius = isGoal ? 6 : 4;
      const point = eventsGroup
        .append("circle")
        .attr("class", "shot-event")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", pointRadius)
        .attr("fill", color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);

      // Add goal icon for goals
      if (isGoal) {
        eventsGroup
          .append("text")
          .attr("class", "shot-event")
          .attr("x", x)
          .attr("y", y - pointRadius - 5)
          .attr("text-anchor", "middle")
          .attr("fill", color)
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text("⚽");
      }

      // Add hover interactions
      const hoverCircle = eventsGroup
        .append("circle")
        .attr("class", "shot-event")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 8)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mouseover", function (d3Event) {
          d3.select(this).attr("r", 10).attr("fill", "rgba(255,255,255,0.2)");
          const tooltipText = formatEventTooltip(event);
          tooltip
            .style("opacity", 1)
            .html(tooltipText.replace(/\n/g, "<br/>"))
            .style("left", `${d3Event.pageX + 10}px`)
            .style("top", `${d3Event.pageY - 10}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 8).attr("fill", "transparent");
          tooltip.style("opacity", 0);
        });
    });

    // Create arrow marker definition
    const defs = eventsGroup.append("defs");
    const marker = defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("refX", 9)
      .attr("refY", 3)
      .attr("orient", "auto");
    marker
      .append("polygon")
      .attr("points", "0 0, 10 3, 0 6")
      .attr("fill", "#6b7280");
  }, [shotEvents]);

  return (
    <div className="relative">
      <FootballPitch
        width={width}
        height={height}
        onRender={renderShots}
        className="w-full"
      />
      {shotEvents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Удары не найдены</p>
        </div>
      )}
    </div>
  );
}

