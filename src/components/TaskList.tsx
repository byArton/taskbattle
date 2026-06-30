'use client';

// 未完了タスクの一覧。完了で敵に攻撃、削除はダメージなしで除去する
import { AnimatePresence, motion } from 'framer-motion';
import type { TaskItem } from '@/types';

// TaskList が親から受け取るプロパティ
type TaskListProps = {
  tasks: TaskItem[];
  onComplete: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
};

/**
 * 役割: 未完了タスクを一覧表示し、完了/削除の操作を親に伝える
 * 入力: TaskListProps（タスク配列と完了/削除ハンドラ）
 * 出力: JSX.Element（タスクリスト）
 */
export function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">タスク一覧</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
          残り {tasks.length} 件
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          タスクがありません。追加して攻撃しよう！
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {task.title}
                  </p>
                  <span className="mt-1 inline-block rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                    {task.damage} ダメージ
                  </span>
                </div>

                {/* 完了ボタン: 敵にダメージを与える */}
                <button
                  type="button"
                  onClick={() => onComplete(task)}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition active:scale-95 hover:from-rose-400 hover:to-red-400"
                >
                  完了して攻撃
                </button>

                {/* 削除ボタン: ダメージなしで除去 */}
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  aria-label="タスクを削除"
                  className="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 ring-1 ring-white/10 transition active:scale-95 hover:bg-white/10"
                >
                  削除
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
