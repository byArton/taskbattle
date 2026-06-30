// アプリ名とサブコピーを表示するヘッダーコンポーネント

/**
 * 役割: 画面上部にアプリ名とサブコピーを表示する
 * 入力: なし
 * 出力: JSX.Element（ヘッダー要素）
 */
export function Header() {
  return (
    <header className="text-center">
      <h1 className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_2px_8px_rgba(250,204,21,0.35)] sm:text-5xl">
        Task Battle
      </h1>
      <p className="mt-2 text-sm text-slate-300 sm:text-base">
        タスクを倒して、ポケモンにダメージを与えよう
      </p>
    </header>
  );
}
