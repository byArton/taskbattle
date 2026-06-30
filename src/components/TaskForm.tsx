'use client';

// タスク追加フォーム。タスク名とダメージ量を入力して追加する
import type { TaskDamage } from '@/types';

// 選択肢として表示するダメージ量とラベルの対応
const DAMAGE_OPTIONS: { label: string; value: TaskDamage }[] = [
  { label: '小', value: 10 },
  { label: '中', value: 20 },
  { label: '大', value: 30 },
];

// TaskForm が親から受け取るプロパティ（入力状態は親で管理する）
type TaskFormProps = {
  title: string;
  damage: TaskDamage;
  onChangeTitle: (title: string) => void;
  onChangeDamage: (damage: TaskDamage) => void;
  onSubmit: () => void;
};

/**
 * 役割: タスク名・ダメージ量の入力UIを描画し、追加操作を親に伝える
 * 入力: TaskFormProps（入力値と変更/送信ハンドラ）
 * 出力: JSX.Element（タスク追加フォーム）
 */
export function TaskForm({
  title,
  damage,
  onChangeTitle,
  onChangeDamage,
  onSubmit,
}: TaskFormProps) {
  const isEmpty = title.trim().length === 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        新しいタスク
      </label>
      <input
        type="text"
        value={title}
        onChange={(event) => onChangeTitle(event.target.value)}
        placeholder="例: 請求書を送る"
        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/30"
      />

      {/* ダメージ量選択 */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-slate-300">ダメージ量</p>
        <div className="grid grid-cols-3 gap-2">
          {DAMAGE_OPTIONS.map((option) => {
            const isSelected = option.value === damage;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChangeDamage(option.value)}
                className={`rounded-xl px-3 py-2.5 text-sm font-bold transition active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-900/60 text-slate-300 ring-1 ring-white/10 hover:bg-slate-800/60'
                }`}
              >
                {option.label}（{option.value}）
              </button>
            );
          })}
        </div>
      </div>

      {/* 追加ボタン（空文字では押せない） */}
      <button
        type="submit"
        disabled={isEmpty}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition active:scale-95 hover:from-emerald-400 hover:to-green-400 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-60 disabled:shadow-none"
      >
        タスクを追加
      </button>
    </form>
  );
}
