import { useEffect, useRef } from "react";
import parsePlanning from "../lib/parsePlanning";

interface PlanningChartProps {
  markdown: string;
}

function PlanningChart({ markdown }: PlanningChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const tasks = parsePlanning(markdown);
    const svg = ref.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (!tasks.length) return;

    const width = 600;
    const barHeight = 24;
    const margin = { top: 20, right: 20, bottom: 30, left: 120 };
    const total = tasks.reduce((sum, t) => sum + t.duration, 0);
    const height = tasks.length * barHeight + margin.top + margin.bottom;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const scale = (value: number): number => {
      return (
        margin.left + ((width - margin.left - margin.right) * value) / total
      );
    };

    let start = 0;
    tasks.forEach((task, i) => {
      const y = margin.top + i * barHeight;
      const end = start + task.duration;
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", scale(start).toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", (scale(end) - scale(start)).toString());
      rect.setAttribute("height", (barHeight - 4).toString());
      rect.setAttribute("fill", "#4ade80");
      svg.appendChild(rect);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", (scale(start) + 4).toString());
      text.setAttribute("y", (y + (barHeight - 4) / 2).toString());
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = task.label;
      svg.appendChild(text);

      start = end;
    });

    const axis = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const ticks = total;
    for (let i = 0; i <= ticks; i++) {
      const x = scale(i);
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", x.toString());
      line.setAttribute("x2", x.toString());
      line.setAttribute(
        "y1",
        (margin.top + tasks.length * barHeight).toString(),
      );
      line.setAttribute(
        "y2",
        (margin.top + tasks.length * barHeight + 6).toString(),
      );
      line.setAttribute("stroke", "black");
      axis.appendChild(line);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.setAttribute("x", x.toString());
      label.setAttribute(
        "y",
        (margin.top + tasks.length * barHeight + 20).toString(),
      );
      label.setAttribute("text-anchor", "middle");
      label.textContent = i.toString();
      axis.appendChild(label);
    }
    svg.appendChild(axis);
  }, [markdown]);

  return <svg ref={ref} className="w-full" />;
}

export default PlanningChart;
