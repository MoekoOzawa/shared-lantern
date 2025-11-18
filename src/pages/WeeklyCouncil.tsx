import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type YesNo = "yes" | "no";

type WeeklySummaryEntry = {
  week: number;
  resolved_conflicts: number;
  unresolved_conflicts: number;
  lantern_elf: number;
  lantern_hobbit: number;
  morale_elf: number;
  morale_hobbit: number;
  worked_well: YesNo;
  ceasefire_compliance: number; // 0–1
  distance: number;
  story_notes: string;
  story_event: string;
};

type DailyLogEntry = {
  date: string; // "YYYY-MM-DD"
  daily_points: number;
};

const WEEKLY_STORAGE_KEY = "shared-lantern-weekly-summary";
const DAILY_STORAGE_KEY = "shared-lantern-daily-log";

const TOTAL_DAYS = 90;
const START_DATE = new Date(2025, 10, 16); // 2025-11-16（月は0始まり）

/* ---------- Weekly / Daily 読み書き ---------- */

function loadAllWeekly(): WeeklySummaryEntry[] {
  try {
    const raw = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WeeklySummaryEntry[];
  } catch {
    return [];
  }
}

function upsertWeekly(entry: WeeklySummaryEntry) {
  const all = loadAllWeekly().filter((e) => e.week !== entry.week);
  all.push(entry);
  localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(all));
}

function loadAllDaily(): DailyLogEntry[] {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DailyLogEntry[];
  } catch {
    return [];
  }
}

function getWeekFromDateString(dateStr: string): number | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map((p) => Number(p));
  if (!y || !m || !d) return null;

  const date = new Date(y, m - 1, d);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor(
    (date.getTime() - START_DATE.getTime()) / msPerDay,
  );
  if (diffDays < 0 || diffDays >= TOTAL_DAYS) return null;

  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(12, Math.max(1, week));
}

function computeDistanceForWeek(week: number): number {
  const allDaily = loadAllDaily();
  return allDaily.reduce((sum, entry) => {
    const w = getWeekFromDateString(entry.date);
    if (w === week) {
      return sum + (entry.daily_points ?? 0);
    }
    return sum;
  }, 0);
}

/* ---------- ミニ分析テキスト用ヘルパー ---------- */

function describeLanternLevel(avg: number): string {
  if (avg >= 4.2) {
    return "The shared lantern burned bright and steady, with a strong sense of mutual safety.";
  }
  if (avg >= 3.4) {
    return "The shared lantern burned with a gentle, steady light; safety was mostly felt, though a few moments wavered.";
  }
  if (avg >= 2.6) {
    return "The shared lantern flickered between light and shadow; safety was sometimes felt, sometimes lost.";
  }
  return "The shared lantern burned low, and safety felt fragile and easily shaken.";
}

function describeMoraleLevel(avg: number): string {
  if (avg >= 4.2) {
    return "The mood of the journey was quietly hopeful, with spirits generally high.";
  }
  if (avg >= 3.4) {
    return "The mood of the journey was modestly hopeful, with some heaviness but more light than shadow.";
  }
  if (avg >= 2.6) {
    return "The overall mood of the journey was middling, neither bleak nor radiant, with hearts still weighing recent days.";
  }
  return "The mood of the journey was heavy, as doubts and weariness pressed close to their steps.";
}

function describeChange(current: number, prev: number): string {
  const diff = current - prev;
  const abs = Math.abs(diff);

  if (abs < 0.15) {
    return "is about the same as last week.";
  }
  if (diff > 0) {
    if (abs < 0.6) {
      return "has grown a little brighter than last week.";
    }
    return "is clearly brighter than last week.";
  }
  // diff < 0
  if (abs < 0.6) {
    return "has faded slightly compared with last week.";
  }
  return "is noticeably lower than last week.";
}

function buildWeeklySummary(
  week: number,
  lanternAvg: number,
  moraleAvg: number,
  prev?: WeeklySummaryEntry,
): string {
  const lanternLine = describeLanternLevel(lanternAvg);
  const moraleLine = describeMoraleLevel(moraleAvg);

  if (!prev || week === 1) {
    return `${lanternLine} ${moraleLine}`;
  }

  const prevLantern =
    (prev.lantern_elf + prev.lantern_hobbit) / 2;
  const prevMorale =
    (prev.morale_elf + prev.morale_hobbit) / 2;

  const lanternChange = describeChange(lanternAvg, prevLantern);
  const moraleChange = describeChange(moraleAvg, prevMorale);

  return `${lanternLine} ${moraleLine} This week, the shared lantern ${lanternChange} The journey morale ${moraleChange}`;
}

/* ---------- コンポーネント本体 ---------- */

export default function WeeklyCouncil() {
  const [week, setWeek] = useState<number>(1);
  const [resolved, setResolved] = useState<number>(0);
  const [unresolved, setUnresolved] = useState<number>(0);
  const [lanternElf, setLanternElf] = useState<number>(3);
  const [lanternHobbit, setLanternHobbit] = useState<number>(3);
  const [moraleElf, setMoraleElf] = useState<number>(3);
  const [moraleHobbit, setMoraleHobbit] = useState<number>(3);
  const [workedWell, setWorkedWell] = useState<YesNo>("yes");
  const [ceasefireCompliance, setCeasefireCompliance] =
    useState<number>(1);
  const [distance, setDistance] = useState<number>(0);
  const [storyNotes, setStoryNotes] = useState<string>("");
  const [storyEvent, setStoryEvent] = useState<string>(""); // いったん残しておく（UI からは消す）
  const [saved, setSaved] = useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>("");

  // 週変更時：既存データ＋distance 読み込み
  useEffect(() => {
    const all = loadAllWeekly();
    const existing = all.find((e) => e.week === week);
    if (existing) {
      setResolved(existing.resolved_conflicts);
      setUnresolved(existing.unresolved_conflicts);
      setLanternElf(existing.lantern_elf);
      setLanternHobbit(existing.lantern_hobbit);
      setMoraleElf(existing.morale_elf);
      setMoraleHobbit(existing.morale_hobbit);
      setWorkedWell(existing.worked_well);
      setCeasefireCompliance(existing.ceasefire_compliance);
      setStoryNotes(existing.story_notes);
      setStoryEvent(existing.story_event);
    } else {
      setResolved(0);
      setUnresolved(0);
      setLanternElf(3);
      setLanternHobbit(3);
      setMoraleElf(3);
      setMoraleHobbit(3);
      setWorkedWell("yes");
      setCeasefireCompliance(1);
      setStoryNotes("");
      setStoryEvent("");
    }

    const autoDistance = computeDistanceForWeek(week);
    setDistance(autoDistance);
  }, [week]);

  // ランタン / モラルからミニ分析テキストを作る
  useEffect(() => {
    const all = loadAllWeekly();
    const prev = all.find((e) => e.week === week - 1);

    const lanternAvgLocal = (lanternElf + lanternHobbit) / 2;
    const moraleAvgLocal = (moraleElf + moraleHobbit) / 2;

    const text = buildWeeklySummary(
      week,
      lanternAvgLocal,
      moraleAvgLocal,
      prev,
    );
    setSummaryText(text);
  }, [week, lanternElf, lanternHobbit, moraleElf, moraleHobbit]);

  const totalConflicts = resolved + unresolved;
  const resolveRatio =
    totalConflicts === 0 ? 0 : resolved / totalConflicts;

  const lanternAvg = (lanternElf + lanternHobbit) / 2;
  const moraleAvg = (moraleElf + moraleHobbit) / 2;

  const handleSave = () => {
    const entry: WeeklySummaryEntry = {
      week,
      resolved_conflicts: resolved,
      unresolved_conflicts: unresolved,
      lantern_elf: lanternElf,
      lantern_hobbit: lanternHobbit,
      morale_elf: moraleElf,
      morale_hobbit: moraleHobbit,
      worked_well: workedWell,
      ceasefire_compliance: ceasefireCompliance,
      distance,
      story_notes: storyNotes,
      story_event: storyEvent,
    };
    upsertWeekly(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const card =
    "mt-4 parchment-card px-4 py-3 shadow-sm";
  const label =
    "mb-1 font-cinzel text-base text-amber-800 leading-tight";
  const desc =
    "text-xs md:text-sm text-neutral-700 leading-snug mb-2";

  return (
    <div className="min-h-screen bg-parchment text-textdark">
      <div className="mx-auto max-w-xl px-4 pb-10 pt-6">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="mb-1 text-xs text-amber-700">
            <Link
  to="/"
  className="
    inline-flex items-center gap-2 rounded-full
    border border-amber-300 bg-parchment/95
    px-3 py-1 text-[11px] font-cinzel tracking-[0.15em]
    text-amber-800 shadow-sm
    hover:bg-amber-50/80 hover:border-elvenGold
    transition
  "
>
  <span className="text-xs">←</span>
  <span>Back to the Elven Path</span>
</Link>
          </div>
          <h1 className="font-cinzel text-2xl text-amber-800">
            Weekly Council
          </h1>
          <p className="mt-1 text-sm text-neutral-700">
            Once every seven days, review the journey of the Elf and the
            Hobbit.
          </p>
        </header>

        {/* Week 選択 */}
        <div className={card}>
          <div className={label}>Week</div>
          <p className={desc}>Choose the week on the 90-day journey.</p>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="mt-1 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
        </div>

        {/* Treaties Restored */}
        <div className={card}>
          <div className={label}>Treaties Restored</div>
          <p className={desc}>
            Conflicts resolved calmly vs. those left unresolved.
          </p>
          <div className="flex gap-3">
            <div>
              <div className="mb-1 text-xs text-neutral-700">
                Resolved
              </div>
              <input
                type="number"
                min={0}
                value={resolved}
                onChange={(e) =>
                  setResolved(Number(e.target.value) || 0)
                }
                className="w-20 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-700">
                Unresolved
              </div>
              <input
                type="number"
                min={0}
                value={unresolved}
                onChange={(e) =>
                  setUnresolved(Number(e.target.value) || 0)
                }
                className="w-20 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-700">
            Resolve ratio:{" "}
            <span className="font-medium">
              {totalConflicts === 0
                ? "–"
                : `${(resolveRatio * 100).toFixed(0)} %`}
            </span>
          </div>
        </div>

        {/* Lantern Brightness */}
        <div className={card}>
          <div className={label}>Lantern Brightness</div>
          <p className={desc}>
            Weekly emotional safety (1–5) for Elf and Hobbit.
          </p>
          <div className="flex gap-3">
            <div>
              <div className="mb-1 text-xs text-neutral-700">Elf</div>
              <input
                type="number"
                min={1}
                max={5}
                value={lanternElf}
                onChange={(e) =>
                  setLanternElf(
                    Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className="w-16 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-700">
                Hobbit
              </div>
              <input
                type="number"
                min={1}
                max={5}
                value={lanternHobbit}
                onChange={(e) =>
                  setLanternHobbit(
                    Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className="w-16 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-700">
            Average:{" "}
            <span className="font-medium">
              {lanternAvg.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Journey Morale */}
        <div className={card}>
          <div className={label}>Journey Morale</div>
          <p className={desc}>Overall relationship tone (1–5).</p>
          <div className="flex gap-3">
            <div>
              <div className="mb-1 text-xs text-neutral-700">Elf</div>
              <input
                type="number"
                min={1}
                max={5}
                value={moraleElf}
                onChange={(e) =>
                  setMoraleElf(
                    Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className="w-16 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-700">
                Hobbit
              </div>
              <input
                type="number"
                min={1}
                max={5}
                value={moraleHobbit}
                onChange={(e) =>
                  setMoraleHobbit(
                    Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className="w-16 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-700">
            Average:{" "}
            <span className="font-medium">
              {moraleAvg.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Wise Council / Ceasefire */}
        <div className={card}>
          <div className={label}>Wise Council Decisions</div>
          <p className={desc}>
            Did you focus on the right matters in this week&apos;s council?
          </p>
          <div className="mb-3 flex gap-2">
            {(["yes", "no"] as YesNo[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setWorkedWell(v)}
                className={`flex-1 rounded-full border px-2 py-1 text-sm capitalize ${
                  workedWell === v
                    ? "border-amber-500 bg-amber-100 text-amber-900"
                    : "border-amber-200 bg-parchment/60 text-neutral-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className={label}>Ceasefire Compliance</div>
          <p className={desc}>
            Estimate how consistently cool-downs were honored (0–1).
          </p>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={ceasefireCompliance}
            onChange={(e) =>
              setCeasefireCompliance(
                Math.min(1, Math.max(0, Number(e.target.value) || 0)),
              )
            }
            className="mt-1 w-24 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          />
        </div>

        {/* Distance */}
        <div className={card}>
          <div className={label}>Distance This Week</div>
          <p className={desc}>
            Sum of daily points for this week, calculated from the Daily Log.
          </p>
          <div className="mt-1 text-lg font-cinzel text-amber-900">
            {distance}
          </div>
          <div className="mt-1 text-xs text-neutral-700">
            Edit the Daily Log to change this value.
          </div>
        </div>

        {/* Story Notes */}
        <div className={card}>
          <div className={label}>Story Notes</div>
          <p className={desc}>
            A single line that captures the essence of this week&apos;s
            journey. This text will be woven into the story prompt.
          </p>
          <textarea
            value={storyNotes}
            onChange={(e) => setStoryNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          />
        </div>

        {/* Elven Scribe’s Note */}
        <div className={card}>
          <div className={label}>Elven Scribe&apos;s Note</div>
          <p className={desc}>
            A brief reading of this week, based on lantern brightness and
            journey morale compared with the previous council.
          </p>
          <p className="mt-1 text-sm text-neutral-800">
            {summaryText ||
              "The scribe will have more to say once this and at least one previous week are saved."}
          </p>
        </div>

        {/* 保存 */}
        <div className="mt-6 rounded-xl border border-amber-300 bg-parchment/80 px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-full border border-amber-500 bg-amber-100 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            Save weekly council
          </button>
          {saved && (
            <p className="mt-2 text-center text-xs text-emerald-700">
              Saved. This week&apos;s council has been recorded.
            </p>
          )}
        </div>
        <div className="mt-10 flex justify-center">
  <Link
    to="/"
    className="
      inline-flex items-center gap-2 rounded-full
      border border-amber-300 bg-parchment/95
      px-4 py-1.5 text-[11px] font-cinzel tracking-[0.15em]
      text-amber-800 shadow-sm
      hover:bg-amber-50/80 hover:border-elvenGold
      transition
    "
  >
    <span className="text-sm">↩</span>
    <span>Return to the Elven Path</span>
  </Link>
</div>
      </div>
    </div>
  );
}
