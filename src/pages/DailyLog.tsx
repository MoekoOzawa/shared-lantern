// src/pages/DailyLog.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type YesNo = "yes" | "no";

type DailyLogEntry = {
  date: string; // "2025-11-16"
  tokens_of_light: number;
  shadows: number;
  ceasefire: YesNo;
  permission_given: number;
  borders_crossed: number;
  acts_of_restoration: YesNo;
  daily_points: number;
};

const STORAGE_KEY = "shared-lantern-daily-log";

function getTodayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadAllDailyLogs(): DailyLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function upsertDailyLog(entry: DailyLogEntry) {
  const all = loadAllDailyLogs().filter((e) => e.date !== entry.date);
  all.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function DailyLog() {
  const [date, setDate] = useState<string>(getTodayISO());
  const [tokensOfLight, setTokensOfLight] = useState<number>(0);
  const [shadows, setShadows] = useState<number>(0);
  const [ceasefire, setCeasefire] = useState<YesNo>("no");
  const [permissionGiven, setPermissionGiven] = useState<number>(0);
  const [bordersCrossed, setBordersCrossed] = useState<number>(0);
  const [actsOfRestoration, setActsOfRestoration] = useState<YesNo>("no");
  const [saved, setSaved] = useState<boolean>(false);

  // 今日の記録を localStorage から読み込む
  useEffect(() => {
    const all = loadAllDailyLogs();
    const existing = all.find((e) => e.date === date);
    if (existing) {
      setTokensOfLight(existing.tokens_of_light);
      setShadows(existing.shadows);
      setCeasefire(existing.ceasefire);
      setPermissionGiven(existing.permission_given);
      setBordersCrossed(existing.borders_crossed);
      setActsOfRestoration(existing.acts_of_restoration);
    } else {
      // その日の記録がなければデフォルト値に戻す
      setTokensOfLight(0);
      setShadows(0);
      setCeasefire("no");
      setPermissionGiven(0);
      setBordersCrossed(0);
      setActsOfRestoration("no");
    }
  }, [date]);

  // ★ここが毎回再計算されるポイント（必ずコンポーネント関数の中に置く）
    const dailyPoints =
    tokensOfLight +
    (actsOfRestoration === "yes" ? 2 : 0) +
    (ceasefire === "yes" ? 1 : 0) +
    permissionGiven -
    bordersCrossed -
    shadows;

  const handleSave = () => {
    const entry: DailyLogEntry = {
      date,
      tokens_of_light: tokensOfLight,
      shadows,
      ceasefire,
      permission_given: permissionGiven,
      borders_crossed: bordersCrossed,
      acts_of_restoration: actsOfRestoration,
      daily_points: dailyPoints,
    };
    upsertDailyLog(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const cardClass =
    "mt-4 parchment-card px-4 py-3 shadow-sm";
  const labelClass =
    "mb-1 font-cinzel text-base text-lg text-amber-800 leading-tight";
  const descClass = "text-xs md:text-sm text-neutral-700 leading-snug mb-2";

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
            Daily Log · Shared Lantern
          </h1>
          <p className="mt-1 text-sm text-neutral-700">
            A quiet record of today&apos;s steps toward the Grey Havens.
          </p>
        </header>

        {/* 日付 */}
        <div className={cardClass}>
          <div className={labelClass}>Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          />
        </div>

        {/* Tokens of Light */}
        <div className={cardClass}>
          <div className={labelClass}>Tokens of Light</div>
          <p className={descClass}>
            Genuine thank-you or appreciation moments shared today.
          </p>
          <div className="flex gap-2">
            {[0, 1, 2].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTokensOfLight(v)}
                className={`flex-1 rounded-full border px-2 py-1 text-sm ${
                  tokensOfLight === v
                    ? "border-amber-500 bg-amber-100 text-amber-900"
                    : "border-amber-200 bg-parchment/60 text-neutral-700"
                }`}
              >
                {v === 2 ? "2+" : v}
              </button>
            ))}
          </div>
        </div>

        {/* Shadows Encountered */}
        <div className={cardClass}>
          <div className={labelClass}>Shadows Encountered</div>
          <p className={descClass}>
            Moments when either of you felt attacked, misunderstood, or tense.
          </p>
          <input
            type="number"
            min={0}
            max={3}
            value={shadows}
            onChange={(e) => {
              const value = Number(e.target.value);
              setShadows(Number.isNaN(value) ? 0 : value);
            }}
            className="mt-1 w-20 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          />
        </div>

        {/* Ceasefire Respected */}
        <div className={cardClass}>
          <div className={labelClass}>Ceasefire Respected?</div>
          <p className={descClass}>
            Did both of you pause when tension rose and avoid escalating
            further?
          </p>
          <div className="flex gap-2">
            {(["yes", "no"] as YesNo[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCeasefire(v)}
                className={`flex-1 rounded-full border px-2 py-1 text-sm capitalize ${
                  ceasefire === v
                    ? "border-amber-500 bg-amber-100 text-amber-900"
                    : "border-amber-200 bg-parchment/60 text-neutral-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Permission Given */}
        <div className={cardClass}>
          <div className={labelClass}>Permission Given</div>
          <p className={descClass}>
            How many times did you check in before entering sensitive topics or
            emotional space?
          </p>
          <input
            type="number"
            min={0}
            max={2}
            value={permissionGiven}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPermissionGiven(Number.isNaN(value) ? 0 : value);
            }}
            className="mt-1 w-20 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          />
        </div>

        {/* Borders Crossed */}
        <div className={cardClass}>
          <div className={labelClass}>Borders Crossed</div>
          <p className={descClass}>
            Moments when one of you felt personal limits were crossed.
          </p>
          <input
            type="number"
            min={0}
            max={2}
            value={bordersCrossed}
            onChange={(e) => {
              const value = Number(e.target.value);
              setBordersCrossed(Number.isNaN(value) ? 0 : value);
            }}
            className="mt-1 w-20 rounded-md border border-amber-200 bg-parchment px-2 py-1 text-sm"
          />
        </div>

        {/* Acts of Restoration */}
        <div className={cardClass}>
          <div className={labelClass}>Acts of Restoration</div>
          <p className={descClass}>
            Did either of you actively soften tension or try to repair a
            difficult moment today?
          </p>
          <div className="flex gap-2">
            {(["yes", "no"] as YesNo[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setActsOfRestoration(v)}
                className={`flex-1 rounded-full border px-2 py-1 text-sm capitalize ${
                  actsOfRestoration === v
                    ? "border-amber-500 bg-amber-100 text-amber-900"
                    : "border-amber-200 bg-parchment/60 text-neutral-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* サマリーと保存ボタン */}
        <div className="mt-6 rounded-xl border border-amber-300 bg-parchment/80 px-4 py-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-cinzel text-sm text-amber-800">
              Today&apos;s Points
            </span>
            {/* ★ここで dailyPoints を表示 */}
            <span className="font-cinzel text-xl text-amber-900">
              {dailyPoints}
            </span>
          </div>
          <p className="mb-3 text-xs text-neutral-700">
            These points will be woven into your journey toward the Grey
            Havens.
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-full border border-amber-500 bg-amber-100 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            Save today&apos;s log
          </button>
          {saved && (
            <p className="mt-2 text-center text-xs text-emerald-700">
              Saved. Your lantern has recorded today&apos;s steps.
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
