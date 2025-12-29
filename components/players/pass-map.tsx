"use client";

import { useCallback, useMemo } from "react";
import * as d3 from "d3";
import { FootballPitch } from "./football-pitch";
import type { PlayerMatchEvent } from "@/lib/types/players";
import {
  filterEventsByType,
  isSuccessfulEvent,
  isCross,
  isForwardPass,
  isBackwardPass,
  getEventColor,
  formatEventTooltip,
} from "@/lib/utils/football-pitch";

interface PassMapProps {
  events: PlayerMatchEvent[];
  period?: "1H" | "2H" | "all";
  filterType?: "all" | "forward" | "backward" | "cross";
  width?: number;
  height?: number;
}

export function PassMap({
  events,
  period: _period = "all",
  filterType = "all",
  width = 800,
  height = 400,
}: PassMapProps) {
  // Filter passes
  const passEvents = useMemo(() => {
    let filtered = filterEventsByType(events, "Pass");

    // Apply additional filters
    if (filterType === "forward") {
      filtered = filtered.filter(isForwardPass);
    } else if (filterType === "backward") {
      filtered = filtered.filter(isBackwardPass);
    } else if (filterType === "cross") {
      filtered = filtered.filter(isCross);
    }

    return filtered;
  }, [events, filterType]);

  const renderPasses = useCallback((
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    eventsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    // Clear previous events
    eventsGroup.selectAll(".pass-event").remove();
    
    // Remove existing tooltip if any
    d3.select("body").selectAll(".pass-tooltip").remove();

    if (passEvents.length === 0) return;

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "pass-tooltip absolute bg-black text-white text-xs p-2 rounded pointer-events-none opacity-0 z-50"
      )
      .style("font-size", "12px");

    passEvents.forEach((event) => {
      if (
        event.startX === null ||
        event.startY === null ||
        event.endX === null ||
        event.endY === null
      )
        return;

      const startX = xScale(event.startX);
      const startY = yScale(event.startY);
      const endX = xScale(event.endX);
      const endY = yScale(event.endY);
      const isSuccessful = isSuccessfulEvent(event);
      const isCrossPass = isCross(event);
      const color = getEventColor(event, "pass");

      // Calculate line width based on type
      const lineWidth = isCrossPass ? 2.5 : 1.5;

      // Draw pass line
      const line = eventsGroup
        .append("line")
        .attr("class", "pass-event")
        .attr("x1", startX)
        .attr("y1", startY)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", color)
        .attr("stroke-width", lineWidth)
        .attr("opacity", isSuccessful ? 0.8 : 0.4)
        .attr("stroke-dasharray", isSuccessful ? "none" : "5,5");

      // Draw start point
      eventsGroup
        .append("circle")
        .attr("class", "pass-event")
        .attr("cx", startX)
        .attr("cy", startY)
        .attr("r", 3)
        .attr("fill", color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);

      // Draw end point (smaller)
      eventsGroup
        .append("circle")
        .attr("class", "pass-event")
        .attr("cx", endX)
        .attr("cy", endY)
        .attr("r", 2)
        .attr("fill", color)
        .attr("opacity", 0.7);

      // Add hover interactions
      eventsGroup
        .append("circle")
        .attr("class", "pass-event")
        .attr("cx", startX)
        .attr("cy", startY)
        .attr("r", 6)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mouseover", function (d3Event) {
          d3.select(this).attr("r", 8).attr("fill", "rgba(255,255,255,0.2)");
          line.attr("stroke-width", lineWidth + 1);
          const tooltipText = formatEventTooltip(event);
          tooltip
            .style("opacity", 1)
            .html(tooltipText.replace(/\n/g, "<br/>"))
            .style("left", `${d3Event.pageX + 10}px`)
            .style("top", `${d3Event.pageY - 10}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 6).attr("fill", "transparent");
          line.attr("stroke-width", lineWidth);
          tooltip.style("opacity", 0);
        });
    });
  }, [passEvents]);

  return (
    <div className="relative">
      <FootballPitch
        width={width}
        height={height}
        onRender={renderPasses}
        className="w-full"
      />
      {passEvents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Передачи не найдены</p>
        </div>
      )}
    </div>
  );
}

