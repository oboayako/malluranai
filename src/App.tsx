import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================
// Mystic Retail Oracle (Single-file demo)
// Tech: React + TypeScript + Tailwind + Framer Motion
// Pages: Landing -> Form -> Loading -> Result
// ============================

// ---- Types ----

type BizType = "飲食" | "小売" | "サービス" | "その他";

type AreaType =
  | "都心"
  | "郊外"
  | "駅前"
  | "ショッピングモール内"
  | "路面店"
  | "オフィスビルイン";

type Blood = "A" | "B" | "O" | "AB";

type FormData = {
  星座: string;
  血液型: Blood;
  希望業種: BizType;
  予算レンジ: number; // 万円/月の想定（家賃総額）
  希望エリア: AreaType;
  開店予定月: string; // "2025-10" のような YYYY-MM
};

type Fortune = {
  商業星座: string;
  導入部: string;
  今月の立地運: string;
  ラッキー立地: string;
  注意すべき方位: string;
  開店吉日: string;
  あるある: string[];
  今日の業界運勢?: string;
};

// ---- Static Data ----

const ZODIACS = [
  "牡羊座",
  "牡牛座",
  "双子座",
  "蟹座",
  "獅子座",
  "乙女座",
  "天秤座",
  "蠍座",
  "射手座",
  "山羊座",
  "水瓶座",
  "魚座",
];

const BLOODS: Blood[] = ["A", "B", "O", "AB"];
const BIZ_TYPES: BizType[] = ["飲食", "小売", "サービス", "その他"];
const AREAS: AreaType[] = [
  "都心",
  "郊外",
  "駅前",
  "ショッピングモール内",
  "路面店",
  "オフィスビルイン",
];

const LOADING_LINES = [
  "占星術的分析中...",
  "古代の商業神に問い合わせています...",
  "立地の波動を測定中...",
  "回遊動線の乱れを補正中...",
  "家賃総額の霊的バランスを調整中...",
  "キーテナントの気配を観測中...",
];

const 商業星座候補 = [
  "賃料交渉強気座",
  "キーテナント依存座",
  "2年退去予備軍座",
  "坪単価偏重座",
  "バックヤード拡張欲望座",
  "レイアウト迷子座",
  "視認性過信座",
  "初期投資ケチり座",
  "オペレーション過積載座",
  "回遊動線執着座",
  "家賃滞納恐怖座",
  "近隣競合ウォッチャー座",
];

const あるあるプール = [
  "隣テナント店長との相性△、でも売上情報共有は吉",
  "キーテナント様のご機嫌がラッキーアイテム",
  "内覧時の“たまたま空いてた”駐車場は幻",
  "休日の人流データ、平日昼間に当てはめるのは禁物",
  "共益費に“やけに強い”清掃費が潜みがち",
  "エスカレーター真横は凶方位（経験上素通りされがち）",
  "『角地』でも実は視認性×導線△のケースあり",
  "大型テナント改装後は人流回復により吉",
  "家賃は総額で比較（共益費・販促費込）",
];

const 方位ネタ = [
  "西側の壁面広告に惑わされる時期。指標はCVRで冷静に",
  "東口への執着が凶。南北動線をもう一度確認",
  "南面採光に過度な期待は禁物。日射よりも動線",
  "北側バックヤード拡張に福あり。荷捌き効率が上がる",
  "エスカレーター真横は凶方位（経験上素通りされがち）",
  "吹き抜け沿いは吉凶混在。バナー運用で吉化",
];

// ---- Utils ----

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string) {
  // Simple string to int hash
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

function formatMonthLabel(ym: string) {
  // "2025-10" -> "2025年10月"
  const [y, m] = ym.split("-");
  return `${y}年${Number(m)}月`;
}

// ---- Fortune Engine ----

function buildFortune(fd: FormData): Fortune {
  const seedStr = `${fd.星座}|${fd.血液型}|${fd.希望業種}|${fd.予算レンジ}|${fd.希望エリア}|${fd.開店予定月}`;
  const rng = mulberry32(hashSeed(seedStr));

  const isHighBudget = fd.予算レンジ >= 120;

  const 導入部 = `古代バビロニアの商人は、星々の運行と出店の機を重ね合わせました。${
    fd.星座
  }のあなたは、いま${fd.希望エリア}の波動と相性が強く、${
    fd.希望業種
  }領域で“現実的な追い風”を捉えやすい周期に入っています。`;

  // 今月の立地運（業種×エリア×予算の軽いルール）
  let 今月の立地運 = "";
  switch (fd.希望業種) {
    case "飲食":
      今月の立地運 = isHighBudget
        ? "高賃料ゾーンでも昼夜比を見極めれば吉。排気・給排水の仕様チェックを最優先に"
        : "居抜きの良縁あり。ダクト・グリス対策と席効率で利益率を作れる時期";
      break;
    case "小売":
      今月の立地運 =
        fd.希望エリア === "ショッピングモール内"
          ? "回遊動線の“起点から3テナント以内”が吉。催事カレンダー連動で客層補完を"
          : "駅前でも路面でも“視認性×導線”の掛け算が鍵。ガラス面の演出投資が回収しやすい";
      break;
    case "サービス":
      今月の立地運 =
        fd.希望エリア === "オフィスビルイン"
          ? "昼帯CVが主戦場。共用部掲示とエレベーターホール演出に伸び代あり"
          : "目的来店型の訴求が刺さる時期。口コミとウェブ予約導線を太く";
      break;
    default:
      今月の立地運 = "契約条件の最適化で運気底上げ。原状回復と解約予告条項は第三者チェック";
  }

  // ラッキー立地（エリアごとの“らしさ”）
  const luckyByArea: Record<AreaType, string[]> = {
    都心: [
      "角地ではないが横断歩道正面視認の区画",
      "サブ通り沿い“看板勝ち”できる区画",
      "昼夜の客層スイッチが効く二面性立地",
    ],
    郊外: [
      "駐車場動線の抜け道上にある棟端区画",
      "生活導線の帰宅側に位置する波動良好区画",
      "SC附帯のロードサイド“小規模でも回る”区画",
    ],
    駅前: [
      "改札から最初の分岐点直後の正面区画",
      "2階奥でもエスカレーター正面視認の区画",
      "バスロータリー側サブ導線の角抜け区画",
    ],
    ショッピングモール内: [
      "メインモール×サブモールの結節点手前",
      "吹き抜け沿いで上層からの視認が効く区画",
      "イベントステージ動線の戻り客を拾える区画",
    ],
    路面店: [
      "信号待ちの滞留が生じる横断歩道前",
      "緩やかなカーブ外側で視認距離が伸びる区画",
      "商店街のアーチ起点から3軒目",
    ],
    オフィスビルイン: [
      "EVホール正面で迷わせない区画",
      "共用部トイレ導線の手前で心理的安心感のある区画",
      "カフェ併設フロアの相乗効果区画",
    ],
  };

  const ラッキー立地 = pick(rng, luckyByArea[fd.希望エリア]);

  const 注意すべき方位 = pick(rng, 方位ネタ);

  // 開店吉日（開店予定月ベースで、縁起の良い数字をピック）
  const luckyDays = [3, 7, 8, 13, 23, 28];
  const [yStr, mStr] = fd.開店予定月.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  // 月末日を計算
  const last = new Date(y, m, 0).getDate();
  let d = pick(rng, luckyDays.filter((n) => n <= last));
  const 開店吉日 = `${y}年${m}月${d}日（${weekJP(new Date(y, m - 1, d).getDay())}）`;

  const 商業星座 = pick(rng, 商業星座候補);

  // あるある（3つ）
  const pool = shuffleWithRng(rng, あるあるプール.slice());
  const あるある = pool.slice(0, 3);

  const 今日の業界運勢候補 = [
    "決裁は午前中が吉。夕方は合意形成が鈍る日",
    "広告代理店からの提案に掘り出し物あり。一次情報の裏取りを",
    "相見積りの取り回しにツキ。仕様の粒度を合わせると成果大",
    "現調で“騒音源”の気づき。写真より耳を信じて",
  ];

  const 今日の業界運勢 = pick(rng, 今日の業界運勢候補);

  return {
    商業星座,
    導入部,
    今月の立地運,
    ラッキー立地,
    注意すべき方位,
    開店吉日,
    あるある,
    今日の業界運勢,
  };
}

function weekJP(dow: number) {
  return ["日", "月", "火", "水", "木", "金", "土"][dow];
}

function shuffleWithRng<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- UI Subcomponents ----

function Starfield() {
  // lightweight sparkles using absolutely positioned dots
  const dots = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: Math.random() * 2 + 0.6,
    d: 2 + Math.random() * 4,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: p.d, repeat: Infinity, delay: p.id * 0.07 }}
          className="absolute rounded-full bg-yellow-300/70 blur-[1px]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
        />
      ))}
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className=
        {"relative w-full max-w-2xl rounded-2xl border border-yellow-300/20 bg-gradient-to-b from-slate-900/60 to-indigo-950/60 p-6 shadow-2xl backdrop-blur " +
        className}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      {children}
    </div>
  );
}

// ---- Main Component ----

export default function MysticRetailOracle() {
  const [view, setView] = useState<"landing" | "form" | "loading" | "result">(
    "landing"
  );
  const [form, setForm] = useState<FormData>({
    星座: ZODIACS[0],
    血液型: "A",
    希望業種: "飲食",
    予算レンジ: 80, // 万円/月
    希望エリア: "駅前",
    開店予定月: defaultYYYYMM(),
  });
  const [fortune, setFortune] = useState<Fortune | null>(null);

  // Loading line rotation
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);

  useEffect(() => {
    if (view !== "loading") return;
    const tick = setInterval(() => {
      setLoadingLine(() => pick(Math.random, LOADING_LINES));
    }, 800);
    const wait = 3000 + Math.floor(Math.random() * 2000);
    const to = setTimeout(() => {
      const f = buildFortune(form);
      setFortune(f);
      setView("result");
      clearInterval(tick);
    }, wait);
    return () => {
      clear
