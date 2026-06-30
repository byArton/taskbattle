'use client';

// タスク管理 × ポケモンバトルのメイン画面。全状態をここで管理する
import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { PokemonArena } from '@/components/PokemonArena';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { createDynamicHp, fetchPokemon } from '@/lib/pokemon';
import type { DamageEffect, PokemonData, TaskDamage, TaskItem } from '@/types';

/**
 * 役割: 簡易的なユニークIDを生成する（タスク・演出の識別に使用）
 * 入力: なし
 * 出力: string（ユニークなID文字列）
 */
function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 役割: アプリのトップページ。状態管理と各コンポーネントの結線を行う
 * 入力: なし
 * 出力: JSX.Element（アプリ全体）
 */
export default function Page() {
  // タスク関連の状態
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [selectedDamage, setSelectedDamage] = useState<TaskDamage>(10);

  // 敵ポケモン・HP関連の状態
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [maxHp, setMaxHp] = useState<number>(0);
  const [currentHp, setCurrentHp] = useState<number>(0);

  // 演出・通信関連の状態
  const [damageEffects, setDamageEffects] = useState<DamageEffect[]>([]);
  const [hitCount, setHitCount] = useState<number>(0);
  const [isDefeated, setIsDefeated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * 役割: 新しいポケモンを取得し、HPや演出状態をリセットする
   * 入力: なし
   * 出力: Promise<void>
   */
  const loadNextPokemon = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsDefeated(false);
    setDamageEffects([]);
    try {
      const next = await fetchPokemon();
      const newMaxHp = createDynamicHp(next.id);
      setPokemon(next);
      setMaxHp(newMaxHp);
      setCurrentHp(newMaxHp); // currentHp は maxHp から開始する
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'ポケモンの取得に失敗しました';
      setErrorMessage(message);
      setPokemon(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時にランダムなポケモンを取得する（外部APIとの同期なので effect が適切）
  useEffect(() => {
    // ローディング状態の更新を伴うデータ取得。意図的な setState のため抑制する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNextPokemon();
  }, [loadNextPokemon]);

  /**
   * 役割: 入力されたタスクを未完了タスク一覧に追加する
   * 入力: なし（入力欄の状態から読み取る）
   * 出力: void
   */
  function addTask(): void {
    const title = taskTitle.trim();
    if (title.length === 0) return; // 空文字では追加しない

    const newTask: TaskItem = {
      id: createId(),
      title,
      damage: selectedDamage,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskTitle(''); // 追加後に入力欄を空にする
  }

  /**
   * 役割: タスクを完了し、敵ポケモンにダメージを与える
   * 入力: task: TaskItem（完了したタスク）
   * 出力: void
   */
  function completeTask(task: TaskItem): void {
    // 倒した後やローディング/エラー中は攻撃させない
    if (isDefeated || isLoading || errorMessage) return;

    // HPは0未満にならないようにする
    setCurrentHp((prev) => {
      const next = Math.max(prev - task.damage, 0);
      if (next === 0) setIsDefeated(true);
      return next;
    });

    // ダメージ数値演出を追加（一定時間後に取り除く）
    const effectId = createId();
    setDamageEffects((prev) => [...prev, { id: effectId, amount: task.damage }]);
    window.setTimeout(() => {
      setDamageEffects((prev) => prev.filter((effect) => effect.id !== effectId));
    }, 900);

    // 画像の揺れアニメーションを再実行するためのトリガー
    setHitCount((prev) => prev + 1);

    // 完了したタスクは一覧から取り除く
    setTasks((prev) => prev.filter((item) => item.id !== task.id));
  }

  /**
   * 役割: 指定されたタスクをダメージなしで削除する
   * 入力: taskId: string（削除対象タスクのID）
   * 出力: void
   */
  function deleteTask(taskId: string): void {
    setTasks((prev) => prev.filter((item) => item.id !== taskId));
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:py-10">
      <Header />

      <PokemonArena
        pokemon={pokemon}
        maxHp={maxHp}
        currentHp={currentHp}
        damageEffects={damageEffects}
        isDefeated={isDefeated}
        isLoading={isLoading}
        errorMessage={errorMessage}
        hitCount={hitCount}
        onNext={() => void loadNextPokemon()}
        onReload={() => void loadNextPokemon()}
      />

      <TaskForm
        title={taskTitle}
        damage={selectedDamage}
        onChangeTitle={setTaskTitle}
        onChangeDamage={setSelectedDamage}
        onSubmit={addTask}
      />

      <TaskList tasks={tasks} onComplete={completeTask} onDelete={deleteTask} />

      <footer className="pt-2 pb-6 text-center text-xs text-slate-500">
        Powered by PokeAPI
      </footer>
    </main>
  );
}
