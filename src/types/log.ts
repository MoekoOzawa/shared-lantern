// Daily Log 1行分
export type DailyLogEntry = {
  date: string; // "2025-11-16" など
  tokens_of_light: number;
  shadows: number;
  ceasefire: "yes" | "no";
  permission_given: number;
  borders_crossed: number;
  acts_of_restoration: "yes" | "no";
  daily_points: number;
};

// Weekly Summary 1行分
export type WeeklySummaryEntry = {
  week: number;
  resolved_conflicts: number;
  unresolved_conflicts: number;
  lantern_elf: number;
  lantern_hobbit: number;
  morale_elf: number;
  morale_hobbit: number;
  worked_well: "yes" | "no";
  ceasefire_compliance: number; // 0〜1 or 0/100 等、あとで決める
  distance: number;
  story_notes: string;
  story_event: string;
};
