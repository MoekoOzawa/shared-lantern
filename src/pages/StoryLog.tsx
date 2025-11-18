// src/pages/StoryLog.tsx
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type SectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function SectionCard({ title, subtitle, children }: SectionProps) {
  return (
    <section className="parchment-card mb-6 border border-amber-200/80 px-5 py-4">
      <div className="font-cinzel text-sm text-amber-900 tracking-[0.18em] uppercase">
        {title}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-neutral-700">{subtitle}</p>
      )}
      <div className="mt-3 text-sm text-neutral-800">{children}</div>
    </section>
  );
}

export default function StoryLog() {
  return (
    <div className="min-h-screen bg-parchment text-textdark">
      <div className="mx-auto flex max-w-3xl flex-col px-4 pb-10 pt-5">
        {/* 戻るリンク（上部） */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-cinzel tracking-[0.18em] uppercase text-amber-800 hover:text-amber-900"
          >
            <span className="mr-2 text-lg leading-none">←</span>
            Back to the Elven Path
          </Link>
        </div>

        {/* タイトルブロック */}
        <header className="mb-6">
          <h1 className="font-cinzel text-2xl text-amber-900">
            Chronicles of the Journey
          </h1>
          <p className="mt-2 text-sm text-neutral-800">
            Weekly fragments of the Elf and the Hobbit on their quiet road toward
            the Grey Havens.
          </p>
        </header>

        {/* 日次リズム（ダミーの説明。あとでグラフを入れられるようにしておく） */}
        <SectionCard
          title="Daily Journey Rhythm"
          subtitle="Daily points over the last 30 days."
        >
          <p className="text-xs text-neutral-700">
            Graphs will appear here as your daily log grows over time.
          </p>
          <div className="mt-3 h-24 rounded-md border border-dashed border-amber-200/70 bg-amber-50/40" />
        </SectionCard>

        {/* 週次距離（ダミーの棒グラフ枠） */}
        <SectionCard
          title="Weekly Distance"
          subtitle="Distance covered each week on the road to the Grey Havens."
        >
          <p className="text-xs text-neutral-700">
            A weekly overview of how steadily the journey has moved.
          </p>
          <div className="mt-3 h-28 rounded-md border border-dashed border-amber-200/70 bg-amber-50/40" />
        </SectionCard>

        {/* 今週のミニ要約（テキストログ） */}
        <SectionCard title="This Week&apos;s Chronicle">
          <div className="space-y-2 text-sm leading-relaxed">
            <p className="italic text-neutral-700">
              No story has been written for this week yet.
            </p>
          </div>

          {/* リフレクションガイドボタン */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="reflection-button">
              Show reflection guide for this week
            </button>
            <p className="text-[11px] text-neutral-600">
              Use this guide with your own notes to turn the week into a small tale.
            </p>
          </div>
        </SectionCard>

        {/* 下部にも戻る導線 */}
        <div className="mt-4 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-amber-300 bg-parchment/90 px-4 py-1.5 text-[11px] font-cinzel uppercase tracking-[0.18em] text-amber-800 hover:bg-amber-50/80"
          >
            Return to the Elven Path
          </Link>
        </div>
      </div>
    </div>
  );
}
