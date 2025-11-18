// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ElvenPathMap from "../components/ElvenPathMap";

// 90日プロジェクト設定
const TOTAL_DAYS = 90;
// スタート日: 2025-11-19
const START_DATE = new Date(2025, 10, 19); // 月は 0 始まりで 10 = 11月

// Weekly Council 用の保存キー
const WEEKLY_STORAGE_KEY = "shared-lantern-weekly-summary";

// Weekly summary の型（必要な列だけ）
type WeeklySummaryEntry = {
  week: number;
  resolved_conflicts: number;
  unresolved_conflicts: number;
  lantern_elf: number;
  lantern_hobbit: number;
  morale_elf: number;
  morale_hobbit: number;
  worked_well: "yes" | "no";
  ceasefire_compliance: number;
  distance: number;
  story_notes: string;
  story_event: string;
};

type JourneyInfo = {
  daysElapsed: number;
  progress: number; // 0〜1
};

function getJourneyInfo(): JourneyInfo {
  const today = new Date();

  if (today < START_DATE) {
    return { daysElapsed: 0, progress: 0 };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor(
    (today.getTime() - START_DATE.getTime()) / msPerDay
  );

  const daysElapsed = Math.min(TOTAL_DAYS, diffDays + 1); // day1 始まり
  const progress = daysElapsed / TOTAL_DAYS;

  return { daysElapsed, progress };
}

// Weekly summary を localStorage から読み込む
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

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [daysElapsed, setDaysElapsed] = useState(0); // Day X of 90 表示用
  const [currentWeek, setCurrentWeek] = useState(0); // 1〜12
  const [lanternAvg, setLanternAvg] = useState(0);
  const [moraleAvg, setMoraleAvg] = useState(0);

  useEffect(() => {
    // 日数と進行度
    const { daysElapsed, progress: target } = getJourneyInfo();
    setDaysElapsed(daysElapsed);

    // 週番号（1〜12）を計算してマップに渡す
    let week = 0;
    if (daysElapsed > 0) {
      week = Math.min(12, Math.ceil(daysElapsed / 7));
    }
    setCurrentWeek(week);

    // Weekly summary から Shared Lantern / Realms Harmony を計算
    const weekly = loadAllWeekly();
    if (weekly.length > 0) {
      // 最大の week を最新として扱う
      const latest = weekly.reduce((acc, cur) =>
        cur.week > acc.week ? cur : acc
      );
      const lanternAverage =
        (latest.lantern_elf + latest.lantern_hobbit) / 2;
      const moraleAverage =
        (latest.morale_elf + latest.morale_hobbit) / 2;
      setLanternAvg(lanternAverage);
      setMoraleAvg(moraleAverage);
    } else {
      setLanternAvg(0);
      setMoraleAvg(0);
    }

    // 0 → target までアニメーション
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const value = startValue + (target - startValue) * t;
      setProgress(value);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="min-h-screen bg-parchment text-textdark">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 pt-6">
        {/* 地図 */}
        <div className="mb-6 w-full">
          <ElvenPathMap
            progress={progress}
            dayNumber={Math.max(1, daysElapsed)}
            currentWeek={currentWeek || undefined}
          />
        </div>

        {/* Shared Lantern / Realms Harmony セクション */}
        <section className="mt-4 mb-8 grid w-full gap-4 md:grid-cols-2">
          {/* Shared Lantern */}
          <div className="parchment-card">
            <div className="text-[11px] font-cinzel tracking-[0.18em] uppercase text-amber-700">
              Shared Lantern
            </div>
            <div className="mt-1 font-cinzel text-xl text-elvenGold">
              {lanternAvg.toFixed(1)} / 5
            </div>
            <p className="mt-1 text-xs text-neutral-700">
              Average sense of safety this week.
            </p>
          </div>

          {/* Realms Harmony */}
          <div className="parchment-card">
            <div className="text-[11px] font-cinzel tracking-[0.18em] uppercase text-amber-700">
              Realms Harmony
            </div>
            <div className="mt-1 font-cinzel text-xl text-elvenGold">
              {moraleAvg.toFixed(1)} / 5
            </div>
            <p className="mt-1 text-xs text-neutral-700">
              Overall journey morale between Elf and Hobbit.
            </p>
          </div>
        </section>

        {/* ナビゲーション：巻物カード風のボタン */}
        <nav className="mb-10 w-full space-y-3">
          <Link
            to="/daily-log"
            className="nav-scroll-link nav-scroll-link--hobbit"
          >
            <div className="font-cinzel text-sm">Daily Log</div>
            <div className="mt-1 text-xs">
              Record today&apos;s tokens of light and shadows.
            </div>
          </Link>

          <Link
            to="/weekly-council"
            className="nav-scroll-link nav-scroll-link--elf"
          >
            <div className="font-cinzel text-sm">Weekly Council</div>
            <div className="mt-1 text-xs">
              Review treaties, lantern brightness, and journey morale.
            </div>
          </Link>

          <Link
            to="/story-log"
            className="nav-scroll-link nav-scroll-link--chronicle"
          >
            <div className="font-cinzel text-sm">Story Chronicle</div>
            <div className="mt-1 text-xs">
              Read the weekly chronicles of your path to the Grey Havens.
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
}
