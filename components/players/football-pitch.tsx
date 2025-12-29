"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { cn } from "@/lib/utils";

interface FootballPitchProps {
  width?: number;
  height?: number;
  flip?: boolean; // Flip field (for opponent team)
  className?: string;
  onRender?: (xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>, eventsGroup: d3.Selection<SVGGElement, unknown, null, undefined>) => void;
}

export function FootballPitch({
  width = 800,
  height = 400,
  flip = false,
  className,
  onRender,
}: FootballPitchProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Set up scales (0-100 coordinate system to pixels)
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([0, height]);

    // Field dimensions in 0-100 coordinate system
    const fieldWidth = 100;
    const fieldHeight = 100;
    const centerX = 50;
    const centerY = 50;

    // Penalty area dimensions (approximate)
    const penaltyAreaWidth = 16.5; // From goal line
    const penaltyAreaHeight = 40.3; // Width of penalty area
    const goalAreaWidth = 5.5; // From goal line
    const goalAreaHeight = 18.3; // Width of goal area
    const goalWidth = 7.32; // Goal width
    const centerCircleRadius = 9.15;

    // Apply flip transformation if needed
    const transform = flip
      ? `scale(-1, 1) translate(${-width}, 0)`
      : undefined;

    // Create group for field elements
    const fieldGroup = svg.append("g").attr("transform", transform || "");

    // Field background (green)
    fieldGroup
      .append("rect")
      .attr("x", xScale(0))
      .attr("y", yScale(0))
      .attr("width", xScale(fieldWidth) - xScale(0))
      .attr("height", yScale(fieldHeight) - yScale(0))
      .attr("fill", "#22c55e")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Center line
    fieldGroup
      .append("line")
      .attr("x1", xScale(centerX))
      .attr("y1", yScale(0))
      .attr("x2", xScale(centerX))
      .attr("y2", yScale(fieldHeight))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Center circle
    fieldGroup
      .append("circle")
      .attr("cx", xScale(centerX))
      .attr("cy", yScale(centerY))
      .attr("r", xScale(centerCircleRadius) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Center dot
    fieldGroup
      .append("circle")
      .attr("cx", xScale(centerX))
      .attr("cy", yScale(centerY))
      .attr("r", 2)
      .attr("fill", "#ffffff");

    // Left side (from perspective, will be flipped if needed)
    // Left penalty area
    fieldGroup
      .append("rect")
      .attr("x", xScale(0))
      .attr("y", yScale(centerY - penaltyAreaHeight / 2))
      .attr("width", xScale(penaltyAreaWidth) - xScale(0))
      .attr("height", xScale(penaltyAreaHeight) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Left goal area
    fieldGroup
      .append("rect")
      .attr("x", xScale(0))
      .attr("y", yScale(centerY - goalAreaHeight / 2))
      .attr("width", xScale(goalAreaWidth) - xScale(0))
      .attr("height", xScale(goalAreaHeight) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Left goal
    fieldGroup
      .append("rect")
      .attr("x", xScale(0))
      .attr("y", yScale(centerY - goalWidth / 2))
      .attr("width", 3)
      .attr("height", xScale(goalWidth) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3);

    // Left penalty arc
    fieldGroup
      .append("path")
      .attr(
        "d",
        `M ${xScale(penaltyAreaWidth)} ${yScale(centerY - penaltyAreaHeight / 2)} A ${xScale(centerCircleRadius) - xScale(0)} ${xScale(centerCircleRadius) - xScale(0)} 0 0 1 ${xScale(penaltyAreaWidth)} ${yScale(centerY + penaltyAreaHeight / 2)}`
      )
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Right side
    // Right penalty area
    fieldGroup
      .append("rect")
      .attr("x", xScale(100 - penaltyAreaWidth))
      .attr("y", yScale(centerY - penaltyAreaHeight / 2))
      .attr("width", xScale(100) - xScale(100 - penaltyAreaWidth))
      .attr("height", xScale(penaltyAreaHeight) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Right goal area
    fieldGroup
      .append("rect")
      .attr("x", xScale(100 - goalAreaWidth))
      .attr("y", yScale(centerY - goalAreaHeight / 2))
      .attr("width", xScale(100) - xScale(100 - goalAreaWidth))
      .attr("height", xScale(goalAreaHeight) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Right goal
    fieldGroup
      .append("rect")
      .attr("x", xScale(100) - 3)
      .attr("y", yScale(centerY - goalWidth / 2))
      .attr("width", 3)
      .attr("height", xScale(goalWidth) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3);

    // Right penalty arc
    fieldGroup
      .append("path")
      .attr(
        "d",
        `M ${xScale(100 - penaltyAreaWidth)} ${yScale(centerY - penaltyAreaHeight / 2)} A ${xScale(centerCircleRadius) - xScale(0)} ${xScale(centerCircleRadius) - xScale(0)} 0 0 0 ${xScale(100 - penaltyAreaWidth)} ${yScale(centerY + penaltyAreaHeight / 2)}`
      )
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Corner arcs (simplified)
    const cornerRadius = 1;
    // Top-left corner
    fieldGroup
      .append("path")
      .attr(
        "d",
        `M ${xScale(0)} ${yScale(cornerRadius)} A ${xScale(cornerRadius) - xScale(0)} ${xScale(cornerRadius) - xScale(0)} 0 0 1 ${xScale(cornerRadius)} ${yScale(0)}`
      )
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Top-right corner
    fieldGroup
      .append("path")
      .attr(
        "d",
        `M ${xScale(100 - cornerRadius)} ${yScale(0)} A ${xScale(cornerRadius) - xScale(0)} ${xScale(cornerRadius) - xScale(0)} 0 0 1 ${xScale(100)} ${yScale(cornerRadius)}`
      )
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Bottom-left corner
    fieldGroup
      .append("path")
      .attr(
        "d",
        `M ${xScale(0)} ${yScale(100 - cornerRadius)} A ${xScale(cornerRadius) - xScale(0)} ${xScale(cornerRadius) - xScale(0)} 0 0 0 ${xScale(cornerRadius)} ${yScale(100)}`
      )
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Bottom-right corner
    fieldGroup
      .append("path")
      .attr(
        "d",
        `M ${xScale(100 - cornerRadius)} ${yScale(100)} A ${xScale(cornerRadius) - xScale(0)} ${xScale(cornerRadius) - xScale(0)} 0 0 0 ${xScale(100)} ${yScale(100 - cornerRadius)}`
      )
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Create group for events with same transform
    const eventsGroup = svg.append("g").attr("transform", transform || "");
    eventsGroup.attr("class", "events-layer");

    // Call onRender callback if provided
    if (onRender) {
      onRender(xScale, yScale, eventsGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, flip]);

  return (
    <div className={cn("relative", className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Field and events are rendered via d3 in useEffect */}
      </svg>
    </div>
  );
}

