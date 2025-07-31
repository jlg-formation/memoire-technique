export interface PlanningTask {
  label: string;
  duration: number;
}

export default function parsePlanning(markdown: string): PlanningTask[] {
  const tasks: PlanningTask[] = [];
  const lines = markdown.split(/\n/);
  const tableLines = lines.filter((l) => /^\|/.test(l));
  if (tableLines.length > 2) {
    for (const line of tableLines.slice(2)) {
      const cells = line.split("|").map((c) => c.trim());
      if (cells.length >= 3) {
        const label = cells[1];
        const num = Number(cells[2].replace(/[^0-9]/g, ""));
        if (label && !Number.isNaN(num)) {
          tasks.push({ label, duration: num });
        }
      }
    }
  }
  if (!tasks.length) {
    for (const line of lines) {
      const match = line.match(/^(?:\d+\.|[-*])\s*(.+?)\s+(\d+)/);
      if (match) {
        tasks.push({ label: match[1].trim(), duration: Number(match[2]) });
      }
    }
  }
  return tasks;
}
