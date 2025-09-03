import React, { useMemo, useState, useEffect } from "react";
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
      className={
        "relative w-full max-w-2xl rounded-2xl border border-yellow-300/20 bg-gradient-to-b from-slate-900/60 to-indigo-950/60 p-6 shadow-2xl backdrop-blur " +
        className
      }
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
    const start = Date.now();
    const tick = setInterval(() => {
      setLoadingLine((p) => pick(Math.random, LOADING_LINES));
    }, 800);
    const wait = 3000 + Math.floor(Math.random() * 2000);
    const to = setTimeout(() => {
      const f = buildFortune(form);
      setFortune(f);
      setView("result");
      clearInterval(tick);
    }, wait);
    return () => {
      clearTimeout(to);
      clearInterval(tick);
    };
  }, [view]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-slate-100">
      <Starfield />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center"
            >
              <Panel className="items-center text-center">
                <h1 className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                  あなたの運命の立地を占います
                </h1>
                <p className="mt-3 text-sm text-slate-300 md:text-base">
                  古来より伝わる商業立地の神秘
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setView("form")}
                    className="group relative inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-300/10 px-6 py-3 text-sm font-semibold text-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.25)] transition hover:bg-yellow-300/20 md:text-base"
                  >
                    <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-yellow-300/10 to-yellow-500/10 blur-2xl"></span>
                    <span className="h-2 w-2 animate-ping rounded-full bg-yellow-300" />
                    <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
  占いを始める
</span>

                  </button>
                </div>
              </Panel>
              <p className="mt-6 text-center text-xs text-slate-400">
                ※本サイトはエンタメです。最終判断は現地調査と収支でどうぞ。
              </p>
            </motion.div>
          )}

          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Panel>
                <h2 className="text-xl font-semibold text-yellow-200 md:text-2xl">
                  神聖な情報をお預かりします
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  ※入力は結果生成のためだけに使用されます（多分）。
                </p>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* 星座 */}
                  <Field label="星座" hint="宇宙商圏におけるあなたの基礎属性">
                    <select
                      className="w-full rounded-lg bg-slate-900/60 p-3 outline-none ring-1 ring-white/10"
                      value={form.星座}
                      onChange={(e) => setForm({ ...form, 星座: e.target.value })}
                    >
                      {ZODIACS.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* 血液型 */}
                  <Field label="血液型" hint="交渉時の霊的スタミナに影響">
                    <select
                      className="w-full rounded-lg bg-slate-900/60 p-3 outline-none ring-1 ring-white/10"
                      value={form.血液型}
                      onChange={(e) =>
                        setForm({ ...form, 血液型: e.target.value as Blood })
                      }
                    >
                      {BLOODS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* 希望業種 */}
                  <Field label="希望業種" hint="波動の周波数を合わせます">
                    <select
                      className="w-full rounded-lg bg-slate-900/60 p-3 outline-none ring-1 ring-white/10"
                      value={form.希望業種}
                      onChange={(e) =>
                        setForm({ ...form, 希望業種: e.target.value as BizType })
                      }
                    >
                      {BIZ_TYPES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* 予算レンジ */}
                  <Field
                    label={`予算レンジ（月額家賃総額）: ${form.予算レンジ}万円`}
                    hint="神託は財布にも配慮します"
                  >
                    <input
                      type="range"
                      min={30}
                      max={300}
                      step={5}
                      value={form.予算レンジ}
                      onChange={(e) =>
                        setForm({ ...form, 予算レンジ: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </Field>

                  {/* 希望エリア */}
                  <Field label="希望エリア" hint="方位の相性を鑑みます">
                    <select
                      className="w-full rounded-lg bg-slate-900/60 p-3 outline-none ring-1 ring-white/10"
                      value={form.希望エリア}
                      onChange={(e) =>
                        setForm({ ...form, 希望エリア: e.target.value as AreaType })
                      }
                    >
                      {AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* 開店予定時期 */}
                  <Field label="開店予定月" hint="暦注の巡りを参照します">
                    <input
                      type="month"
                      className="w-full rounded-lg bg-slate-900/60 p-3 outline-none ring-1 ring-white/10"
                      value={form.開店予定月}
                      onChange={(e) =>
                        setForm({ ...form, 開店予定月: e.target.value })
                      }
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      選択中: {formatMonthLabel(form.開店予定月)}
                    </p>
                  </Field>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setView("landing")}
                    className="rounded-lg px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10 hover:bg-white/5"
                  >
                    ← 戻る
                  </button>

                  <button
                    onClick={() => setView("loading")}
                    className="group relative inline-flex items-center gap-2 rounded-lg bg-yellow-400/90 px-5 py-2 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-yellow-300"
                  >
                    <span className="absolute inset-0 -z-10 rounded-lg bg-yellow-200/60 blur-xl group-hover:bg-yellow-300/60" />
                    神託を受ける
                  </button>
                </div>
              </Panel>
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Panel className="flex flex-col items-center text-center">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full w-1/3 bg-yellow-300"
                    animate={{ x: ["-50%", "120%"] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  />
                </div>
                <p className="mt-4 text-sm text-slate-300">{loadingLine}</p>
                <p className="mt-1 text-xs text-slate-400">
                  ※3〜5秒ほどで結果が出ます（神様の都合により変動）
                </p>
              </Panel>
            </motion.div>
          )}

          {view === "result" && fortune && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Panel>
                <h2 className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                  神託の結果
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <KV label="あなたの属性" value={`${form.星座} / ${form.血液型} / ${form.希望業種}`} />
                  <KV label="志望条件" value={`${form.希望エリア} / ${form.予算レンジ}万円 / ${formatMonthLabel(form.開店予定月)}`} />
                </div>

                <hr className="my-6 border-white/10" />

                <Section title="導入部">{fortune.導入部}</Section>
                <Section title="あなたの商業星座">
                  <span className="font-semibold text-yellow-300">{fortune.商業星座}</span>
                </Section>
                <Section title="今月の立地運">{fortune.今月の立地運}</Section>
                <Section title="ラッキー立地">{fortune.ラッキー立地}</Section>
                <Section title="注意すべき方位">{fortune.注意すべき方位}</Section>
                <Section title="開店吉日">{fortune.開店吉日}</Section>

                <Section title="業界あるある">
                  <ul className="list-disc space-y-1 pl-6 text-sm text-slate-200">
                    {fortune.あるある.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </Section>

                {fortune.今日の業界運勢 && (
                  <Section title="今日の業界運勢">
                    {fortune.今日の業界運勢}
                  </Section>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setView("form")}
                    className="rounded-lg px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10 hover:bg-white/5"
                  >
                    もう一度占う
                  </button>

                  <div className="flex items-center gap-3">
                    <a
                      href={shareUrl(fortune)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-[#FFF8E1] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#FFF3C4]"
                    >
                      結果をシェア（X）
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(renderPlainTextResult(form, fortune))}
                      className="rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-200"
                    >
                      結果をコピー
                    </button>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                  ※エンターテインメントです。最終判断は現調・試算・契約書で。
                </p>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-yellow-200">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-3 text-sm ring-1 ring-white/10">
      <div className="text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-yellow-200">{title}</h3>
      <div className="mt-1 text-sm leading-relaxed text-slate-100">{children}</div>
    </div>
  );
}

function defaultYYYYMM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function shareUrl(f: Fortune) {
  const text = encodeURIComponent(
    `#業界あるある出店占い\n商業星座: ${f.商業星座}\n今月の立地運: ${f.今月の立地運}\nラッキー立地: ${f.ラッキー立地}\n開店吉日: ${f.開店吉日}`
  );
  const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

function renderPlainTextResult(fd: FormData, f: Fortune) {
  return [
    "【業界あるある出店占い 結果】",
    `属性: ${fd.星座} / ${fd.血液型} / ${fd.希望業種}`,
    `条件: ${fd.希望エリア} / ${fd.予算レンジ}万円 / ${formatMonthLabel(fd.開店予定月)}`,
    `導入部: ${f.導入部}`,
    `商業星座: ${f.商業星座}`,
    `今月の立地運: ${f.今月の立地運}`,
    `ラッキー立地: ${f.ラッキー立地}`,
    `注意すべき方位: ${f.注意すべき方位}`,
    `開店吉日: ${f.開店吉日}`,
    `あるある: ${f.あるある.join(" / ")}`,
    f.今日の業界運勢 ? `今日の業界運勢: ${f.今日の業界運勢}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
