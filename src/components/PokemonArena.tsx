'use client';

// 敵ポケモンの表示・HPバー・各種演出を担当するコンポーネント
import { useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from 'framer-motion';
import type { DamageEffect, PokemonData } from '@/types';
import { formatPokemonName } from '@/lib/pokemon';

// PokemonArena が親から受け取るプロパティ
type PokemonArenaProps = {
  pokemon: PokemonData | null;
  maxHp: number;
  currentHp: number;
  damageEffects: DamageEffect[];
  isDefeated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  hitCount: number; // 攻撃が当たるたびに増える値。揺れアニメの再実行トリガーに使う
  onNext: () => void;
  onReload: () => void;
};

/**
 * 役割: 現在HPの割合からHPバーの色（緑→黄→赤）を決める
 * 入力: ratio: number（0〜1のHP割合）
 * 出力: string（Tailwindのグラデーションクラス）
 */
function getHpBarColor(ratio: number): string {
  if (ratio > 0.5) return 'from-emerald-400 to-green-500';
  if (ratio > 0.2) return 'from-amber-400 to-yellow-500';
  return 'from-rose-500 to-red-600';
}

/**
 * 役割: 敵ポケモン・HP・ダメージ演出・やっつけた演出をまとめて描画する
 * 入力: PokemonArenaProps（表示に必要な状態と操作ハンドラ）
 * 出力: JSX.Element（バトルエリア）
 */
export function PokemonArena({
  pokemon,
  maxHp,
  currentHp,
  damageEffects,
  isDefeated,
  isLoading,
  errorMessage,
  hitCount,
  onNext,
  onReload,
}: PokemonArenaProps) {
  // ポケモン画像の揺れアニメーションを命令的に制御するためのコントローラ
  const controls = useAnimationControls();

  // hitCount が変わるたびに被ダメージの揺れアニメーションを再生する
  useEffect(() => {
    if (hitCount === 0) return;
    controls.start({
      x: [0, -12, 12, -8, 8, 0],
      rotate: [0, -5, 5, -3, 3, 0],
      scale: [1, 0.92, 1.02, 0.97, 1],
      transition: { duration: 0.45, ease: 'easeInOut' },
    });
  }, [hitCount, controls]);

  const hpRatio = maxHp > 0 ? currentHp / maxHp : 0;
  const isLowHp = hpRatio <= 0.2 && currentHp > 0;

  // ローディング中の表示
  if (isLoading) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
        <p className="mt-4 text-sm text-slate-300">ポケモンを呼び出し中...</p>
      </section>
    );
  }

  // 取得失敗時の表示（再読み込みボタン付き）
  if (errorMessage) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-center backdrop-blur">
        <p className="text-2xl">⚠️</p>
        <p className="text-sm text-rose-200">{errorMessage}</p>
        <button
          type="button"
          onClick={onReload}
          className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition active:scale-95 hover:bg-rose-400"
        >
          再読み込み
        </button>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
      {/* やっつけた時の背景リング/フラッシュ演出 */}
      <AnimatePresence>
        {isDefeated && (
          <motion.div
            key="defeat-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute h-40 w-40 rounded-full border-4 border-amber-300"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="z-20 text-center"
            >
              <p className="text-4xl font-black text-amber-300 drop-shadow-[0_2px_12px_rgba(250,204,21,0.6)] sm:text-5xl">
                やっつけた！
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ポケモン名 */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {pokemon ? formatPokemonName(pokemon.name) : '???'}
        </h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
          No.{pokemon ? pokemon.id : '--'}
        </span>
      </div>

      {/* HP表示 */}
      <div className="mt-3">
        <div className="mb-1 flex items-end justify-between text-xs font-semibold text-slate-300">
          <span>HP</span>
          <span
            className={
              isLowHp
                ? 'animate-danger-pulse text-rose-300'
                : 'text-slate-200'
            }
          >
            {currentHp} / {maxHp}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-900/70 ring-1 ring-white/10">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getHpBarColor(hpRatio)}`}
            initial={false}
            animate={{ width: `${Math.max(hpRatio, 0) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ポケモン画像エリア */}
      <div className="relative mt-4 flex min-h-[240px] items-center justify-center">
        {/* ダメージ数値演出（上に浮かびながら消える） */}
        <AnimatePresence>
          {damageEffects.map((effect, index) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: -70, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              // 複数同時表示でも重ならないよう少し横にずらす
              style={{ left: `${46 + index * 6}%` }}
              className="pointer-events-none absolute top-6 z-20 -translate-x-1/2 text-3xl font-black text-rose-400 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-4xl"
            >
              -{effect.amount}
            </motion.div>
          ))}
        </AnimatePresence>

        {pokemon && pokemon.imageUrl ? (
          // 外側: 倒れた時の沈み込み・透明化・グレースケールを担当
          <motion.div
            animate={{
              opacity: isDefeated ? 0.35 : 1,
              y: isDefeated ? 16 : 0,
              filter: isDefeated ? 'grayscale(0.8)' : 'grayscale(0)',
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* 内側: 被ダメージ時の揺れ（x/rotate/scale）を担当 */}
            <motion.img
              src={pokemon.imageUrl}
              alt={formatPokemonName(pokemon.name)}
              animate={controls}
              className="h-52 w-52 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:h-60 sm:w-60"
              draggable={false}
            />
          </motion.div>
        ) : (
          <p className="text-sm text-slate-400">画像を取得できませんでした</p>
        )}
      </div>

      {/* 次のポケモンボタン */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition active:scale-95 hover:from-indigo-400 hover:to-violet-400"
        >
          {isDefeated ? '次のポケモンへ進む →' : '次のポケモン'}
        </button>
      </div>
    </section>
  );
}
