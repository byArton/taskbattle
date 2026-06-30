// PokeAPI とのやり取り・関連ロジックをまとめたユーティリティ
import type { PokeApiPokemonResponse, PokemonData } from '@/types';

// 取得対象とするポケモンIDの上限（第1〜第9世代相当）
const MAX_POKEMON_ID = 1025;

/**
 * 役割: PokeAPIから取得するランダムなポケモンIDを生成する
 * 入力: なし
 * 出力: number（1〜MAX_POKEMON_ID の整数）
 */
export function getRandomPokemonId(): number {
  return Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
}

/**
 * 役割: APIから取得したポケモン名を表示用に整形する（先頭文字を大文字化）
 * 入力: name: string（APIが返す小文字の名前）
 * 出力: string（先頭が大文字の名前）
 */
export function formatPokemonName(name: string): string {
  if (name.length === 0) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * 役割: 敵ポケモンの最大HPを動的に生成する（80〜200の範囲）
 * 入力: pokemonId?: number（任意。基礎値として加味する）
 * 出力: number（その敵の最大HP）
 */
export function createDynamicHp(pokemonId?: number): number {
  // ランダム要素を主軸にしつつ、IDごとの微差を加えて毎回HPが変わるようにする
  const base = 80 + Math.floor(Math.random() * 121); // 80〜200
  const idBias = typeof pokemonId === 'number' ? pokemonId % 20 : 0;
  return base + idBias;
}

/**
 * 役割: PokeAPIからランダムなポケモンを取得し、画面表示用データに変換する
 * 入力: なし
 * 出力: Promise<PokemonData>（取得失敗時は例外を投げる）
 */
export async function fetchPokemon(): Promise<PokemonData> {
  const id = getRandomPokemonId();
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`ポケモンの取得に失敗しました (status: ${response.status})`);
  }

  // レスポンスを型安全に扱う
  const data = (await response.json()) as PokeApiPokemonResponse;

  // official-artwork を優先し、無ければ front_default にフォールバックする
  const imageUrl =
    data.sprites.other['official-artwork'].front_default ??
    data.sprites.front_default;

  return {
    id: data.id,
    name: data.name,
    imageUrl,
  };
}
