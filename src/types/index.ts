// アプリ全体で使う型定義をまとめたファイル

// タスクが与えるダメージ量。小=10 / 中=20 / 大=30 の3種類のみ許可する
export type TaskDamage = 10 | 20 | 30;

// 1件のタスクを表す型
export type TaskItem = {
  id: string;
  title: string;
  damage: TaskDamage;
  createdAt: number;
};

// 画面表示用に整形したポケモンのデータ
export type PokemonData = {
  id: number;
  name: string;
  imageUrl: string | null;
};

// ダメージ数値演出を表す型（複数同時に表示できるよう配列で扱う）
export type DamageEffect = {
  id: string;
  amount: number;
};

// PokeAPI の /pokemon/{id} から返るレスポンスのうち、使用する部分だけを型定義したもの
export type PokeApiPokemonResponse = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
};
