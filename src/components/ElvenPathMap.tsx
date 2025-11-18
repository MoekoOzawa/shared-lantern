import { useEffect, useRef, useState } from "react";
import LanternIcon from "./LanternIcon";

type Props = {
  progress: number; // 0〜1
  dayNumber: number; // 1〜90
  currentWeek?: number; // 1〜12 / 0 or undefined のときはハイライト無し
  daysElapsed?: number; // Day X of 90 表示用
};

type Point = { x: number; y: number };

// チェックポイント名用アンカー（パス上）
const LABEL_ANCHORS = [
  { name: "Rivendell Departure", at: 0.02 },
  { name: "Whispering Grove", at: 0.16 },
  { name: "Moonlit Hill", at: 0.3 },
  { name: "Starwatch Ridge", at: 0.44 },
  { name: "Ancient Runes' Pass", at: 0.58 },
  { name: "Silverwood Crossing", at: 0.72 },
  { name: "Shimmering Coast", at: 0.86 },
  { name: "Grey Havens", at: 1.0 },
];

export default function ElvenPathMap({
  progress,
  dayNumber,
  currentWeek,
  daysElapsed,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [lanternPos, setLanternPos] = useState<Point>({ x: 40, y: 180 });
  const [checkpointPos, setCheckpointPos] = useState<Record<string, Point>>({});
  const [labelPos, setLabelPos] = useState<Record<string, Point>>({});
  const [weekDotsPos, setWeekDotsPos] = useState<Point[]>([]);
  const [reached, setReached] = useState<Record<string, boolean>>({});

  const safeDay =
    daysElapsed === undefined
      ? 0
      : Math.max(0, Math.min(90, daysElapsed));

  // ランタンとは別の「光るポイント」用
  const checkpoints = [
    { id: "leaf", at: 0.1 },
    { id: "star", at: 0.35 },
    { id: "rune", at: 0.7 },
    { id: "goal", at: 1.0 },
  ];

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const path = svg.querySelector("#journey-path") as SVGPathElement | null;
    if (!path) return;

    const totalLength = path.getTotalLength();

    // ランタン位置
    const p = Math.min(1, Math.max(0, progress));
    const pt = path.getPointAtLength(totalLength * p);
    setLanternPos({ x: pt.x, y: pt.y });

    // チェックポイント位置
    const cpPos: Record<string, Point> = {};
    checkpoints.forEach((cp) => {
      const cpt = path.getPointAtLength(totalLength * cp.at);
      cpPos[cp.id] = { x: cpt.x, y: cpt.y };
    });
    setCheckpointPos(cpPos);

    // ラベル位置
    const lp: Record<string, Point> = {};
    LABEL_ANCHORS.forEach((item) => {
      const t = Math.min(1, Math.max(0, item.at));
      const ptLabel = path.getPointAtLength(totalLength * t);
      lp[item.name] = { x: ptLabel.x, y: ptLabel.y };
    });
    setLabelPos(lp);

    // 週マーカー用ドット位置（12分割）
    const dots: Point[] = [];
    for (let i = 1; i <= 12; i += 1) {
      const t = i / 12;
      const ptDot = path.getPointAtLength(totalLength * t);
      dots.push({ x: ptDot.x, y: ptDot.y });
    }
    setWeekDotsPos(dots);

    // 到達フラグ更新
    checkpoints.forEach((cp) => {
      if (!reached[cp.id] && progress >= cp.at) {
        setReached((prev) => ({ ...prev, [cp.id]: true }));
      }
    });
  }, [progress, reached]);

  const isGoal = progress >= 1;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 390,
          height: 570,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          transform: "rotate(-1.5deg)",
          transformOrigin: "center",
        }}
      >
        {/* ====================== SVG 本体 ====================== */}
        <svg
          ref={svgRef}
          viewBox="0 0 390 570"
          width={390}
          height={570}
          style={{
            display: "absolute",
            left: 0,
            top: 0,
          }}
        >
          <defs>
            {/* 羊皮紙背景 */}
            <linearGradient id="parchmentBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f3ebd8" />
              <stop offset="100%" stopColor="#efe3c8" />
            </linearGradient>

            {/* ごく弱い紙テクスチャ */}
            <filter id="paperTexture">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="2"
                stitchTiles="noStitch"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="
                  0 0 0 0 0.9
                  0 0 0 0 0.85
                  0 0 0 0 0.75
                  0 0 0 -0.9 1.4
                "
                result="paper"
              />
              <feBlend in="SourceGraphic" in2="paper" mode="soft-light" />
            </filter>

            {/* 道の銀緑グラデ */}
            <linearGradient
              id="elvenGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#C9DCCB" />
              <stop offset="100%" stopColor="#C6A667" />
            </linearGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景 */}
          <rect
            width="100%"
            height="100%"
            fill="url(#parchmentBg)"
            filter="url(#paperTexture)"
          />

          {/* ごく控えめな内枠 */}
          <rect
            x={14}
            y={14}
            width={362}
            height={542}
            fill="none"
            stroke="#d3c19b"
            strokeWidth={0.8}
          />

{/* タイトル */}
<text
  x="50%"
  y="50"
  textAnchor="middle"
  fontFamily="Cinzel"
  fontSize="20"          // 22 → 20 にして横幅に余裕を持たせる
  fill="#b48835"
>
  The Elven Path to the Grey Havens
</text>

{/* タイトル下のルーン帯（少し下げる） */}
<text
  x="50%"
  y="64"                 // ルーンを少し下へ
  textAnchor="middle"
  fontFamily="'Times New Roman', serif"
  fontSize="8"
  letterSpacing="0.3em"
  fill="#8b6a2b"
>
  ᛚᛟᚱᛞ · ᛟᚠ · ᛏᚺᛖ
</text>

{/* タイトル下の細いアーチ */}
<path
  d="M 80 76 Q 195 90 310 76"
  fill="none"
  stroke="url(#elvenGradient)"
  strokeWidth={1.1}
  strokeLinecap="round"
  opacity={0.9}
/>

{/* Day X of 90 のステータス行 */}
<text
  x="50%"
  y="98"
  textAnchor="middle"
  fontFamily="Cinzel"
  fontSize="10"
  fill="#C6A667"
>
  {`Day ${Math.min(90, Math.max(1, dayNumber))} of 90`}
</text>

          {/* ステータス行の左に小さな mallorn leaf */}
          <g transform="translate(120, 70)">
            <path
              d="M 0 6 C -2 3 -2 0 0 -3 C 2 0 2 3 0 6 Z"
              fill="none"
              stroke="#C6A667"
              strokeWidth={0.6}
            />
            <line
              x1={0}
              y1={6}
              x2={0}
              y2={-3}
              stroke="#C6A667"
              strokeWidth={0.5}
            />
          </g>

          {/* メインの道：ゆるいS字カーブ 2回 */}
{/* 下側：太めのぼかしレイヤー */}
<path
  d="
    M 40 180
    C 120 140, 190 220, 250 180
    S 360 260, 300 320
    S 180 390, 260 460
    S 360 510, 200 500
  "
  stroke="#d6c29a"
  strokeWidth={4.2}
  fill="none"
  strokeLinecap="round"
  opacity={0.7}
  filter="url(#pathSoftShadow)"
/>

{/* 上側：細めのエルフグラデーションライン */}
<path
  id="journey-path"
  d="
    M 40 180
    C 120 140, 190 220, 250 180
    S 360 260, 300 320
    S 180 390, 260 460
    S 360 510, 200 500
  "
  stroke="url(#elvenGradient)"
  strokeWidth={2.4}
  fill="none"
  strokeLinecap="round"
/>

          {/* 左端：The Shire（丸いドア + つた）※地名テキストは出さない */}
          <g transform="translate(28, 172)">
            <circle
              cx={0}
              cy={10}
              r={8}
              fill="none"
              stroke="#7A5E3A"
              strokeWidth={0.8}
            />
            <circle
              cx={0}
              cy={10}
              r={3}
              fill="none"
              stroke="#7A5E3A"
              strokeWidth={0.6}
            />
            <path
              d="M -6 4 C -10 0 -10 -4 -6 -6"
              stroke="#7A5E3A"
              strokeWidth={0.6}
              fill="none"
            />
          </g>

          {/* スタートチェックポイント名：Rivendell Departure（大きめラベル） */}
          <text
            x={90}
            y={162}
            textAnchor="middle"
            fontFamily="Cinzel"
            fontSize={13}
            fill="#b48835"
          >
            Rivendell Departure
          </text>

          {/* 中央：Rivendell（小さなアーチ） */}
          <g transform="translate(190, 230)">
            <path
              d="M -10 12 Q 0 -4 10 12"
              fill="none"
              stroke="#C9DCCB"
              strokeWidth={0.8}
            />
            <path
              d="M -6 10 Q 0 0 6 10"
              fill="none"
              stroke="#C6A667"
              strokeWidth={0.6}
            />
          </g>
          <text
            x={190}
            y={246}
            textAnchor="middle"
            fontFamily="Cinzel"
            fontSize={10}
            fill="#8b6a2b"
          >
            Rivendell
          </text>

          {/* 右端：Grey Havens（塔 + 抽象的な船） */}
          <g transform="translate(230, 470)">
            <rect
              x={-5}
              y={-10}
              width={10}
              height={16}
              fill="none"
              stroke="#C9DCCB"
              strokeWidth={0.8}
            />
            <path
              d="M -5 -10 L 0 -16 L 5 -10"
              fill="none"
              stroke="#C9DCCB"
              strokeWidth={0.8}
            />
          </g>
          <g transform="translate(255, 488)">
            <path
              d="M -8 6 L 8 6 L 4 9 L -4 9 Z"
              fill="none"
              stroke="#9db7c5"
              strokeWidth={0.8}
            />
            <path d="M 0 6 L 0 -4" stroke="#9db7c5" strokeWidth={0.7} />
            <path
              d="M 0 -4 Q -5 0 0 2 Z"
              fill="none"
              stroke="#9db7c5"
              strokeWidth={0.7}
            />
          </g>
          <text
            x={200}
            y={520}
            textAnchor="middle"
            fontFamily="Cinzel"
            fontSize={16}
            fill="#b48835"
          >
            Grey Havens
          </text>

          {/* mallorn leaf ×2（線画のみ） */}
          <g transform="translate(165, 210)">
            <path
              d="M 0 8 C -3 4 -3 0 0 -4 C 3 0 3 4 0 8 Z"
              fill="none"
              stroke="#C6A667"
              strokeWidth={0.6}
            />
            <line
              x1={0}
              y1={8}
              x2={0}
              y2={-4}
              stroke="#C6A667"
              strokeWidth={0.5}
            />
          </g>
          <g transform="translate(240, 440)">
            <path
              d="M 0 8 C -3 4 -3 0 0 -4 C 3 0 3 4 0 8 Z"
              fill="none"
              stroke="#C6A667"
              strokeWidth={0.6}
            />
            <line
              x1={0}
              y1={8}
              x2={0}
              y2={-4}
              stroke="#C6A667"
              strokeWidth={0.5}
            />
          </g>

          {/* 星の光 ×2 */}
          <circle cx={160} cy={165} r={1.7} fill="#F6E9A8" filter="url(#softGlow)" />
          <circle cx={235} cy={350} r={1.7} fill="#F6E9A8" filter="url(#softGlow)" />

          {/* 飾りルーン ×1 */}
          <text
            x={70}
            y={260}
            textAnchor="middle"
            fontFamily="'Times New Roman', serif"
            fontSize={10}
            fill="#C9DCCB"
          >
            ᛋᛟᚢᛚ
          </text>
        </svg>

        {/* ================ 週マーカー 12個 ================ */}
        {weekDotsPos.map((pos, idx) => {
          const weekNumber = idx + 1;
          const isCurrent = currentWeek && currentWeek === weekNumber;

          return (
            <div
              key={`week-dot-${weekNumber}`}
              className={isCurrent ? "current-week-dot" : undefined}
              style={{
                position: "absolute",
                left: pos.x - 2,
                top: pos.y - 2,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: isCurrent
                  ? "rgba(201, 220, 203, 0.95)"
                  : "rgba(201, 220, 203, 0.5)",
                boxShadow: isCurrent
                  ? "0 0 8px rgba(201, 220, 203, 0.95)"
                  : "0 0 2px rgba(201, 220, 203, 0.6)",
                pointerEvents: "none",
                transition: "box-shadow 0.6s ease, background 0.6s ease",
              }}
            />
          );
        })}

        {/* ================ チェックポイントの光（4つ） ================ */}
        {checkpoints.map((cp) => {
          const pos = checkpointPos[cp.id];
          if (!pos) return null;

          const size = cp.id === "goal" ? 10 : 8;

          return (
            <div
              key={cp.id}
              style={{
                position: "absolute",
                left: pos.x - size / 2,
                top: pos.y - size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                background: reached[cp.id]
                  ? "rgba(255, 255, 210, 0.95)"
                  : "rgba(220, 190, 140, 0.55)",
                boxShadow: reached[cp.id]
                  ? "0 0 14px 4px rgba(255, 255, 200, 0.95)"
                  : "0 0 6px 2px rgba(230, 205, 160, 0.7)",
                transition: "all 0.7s ease",
                pointerEvents: "none",
              }}
            />
          );
        })}

       {/* ========== チェックポイント名のラベル（Departure / Grey は除外） ========== */}
{LABEL_ANCHORS.map((item) => {
  if (
    item.name === "Grey Havens" ||
    item.name === "Rivendell Departure"
  ) {
    return null;
  }

  const pos = labelPos[item.name];
  if (!pos) return null;

  const isRightEdgeLabel =
    item.name === "Starwatch Ridge" ||
    item.name === "Shimmering Coast";

  // 右側2つ用に、個別オフセットを決める
  let left = pos.x + 10;
  let width: number | "auto" = "auto";
  let textAlign: "left" | "right" = "left";
  let whiteSpace: "nowrap" | "normal" = "nowrap";

  if (item.name === "Starwatch Ridge") {
    left = pos.x - 80;   // しっかり内側へ
    width = 80;
    textAlign = "right";
    whiteSpace = "normal";
  } else if (item.name === "Shimmering Coast") {
    left = pos.x - 20;   // Starwatch より右寄せ
    width = 70;
    textAlign = "right";
    whiteSpace = "normal";
  }

  return (
    <div
      key={`label-${item.name}`}
      style={{
        position: "absolute",
        left,
        top: pos.y - 16,
        width,
        textAlign,
        pointerEvents: "none",
        fontFamily: "Cinzel, serif",
        fontSize: 9,
        color: "#7b6030",
        whiteSpace,
        lineHeight: 1.2,
      }}
    >
      {item.name}
    </div>
  );
})}

        {/* ======================= ゴール演出 ======================= */}
        {isGoal && checkpointPos["goal"] && (
          <div
            style={{
              position: "absolute",
              left: checkpointPos["goal"].x - 28,
              top: checkpointPos["goal"].y - 28,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,210,0.25)",
              animation: "goalPulse 2s infinite ease-out",
              pointerEvents: "none",
            }}
          />
        )}

        {/* ======================== ランタン ========================= */}
        <div
          className="lantern-wrapper"
          style={{
            position: "absolute",
            left: lanternPos.x - 11,
            top: lanternPos.y - 40,
            transition: "left 0.35s ease, top 0.35s ease",
          }}
        >
          <LanternIcon width={22} />
        </div>
      </div>
    </div>
  );
}
