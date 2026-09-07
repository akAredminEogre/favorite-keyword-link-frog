---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-react-hooks-useref-types"
  type: governance
---

# useRefの型ガイドライン

## 概要

`useRef`は初期値によって異なる型を返す。不要な型キャストを避け、TypeScriptの型推論を活用する。

## 適用シナリオ

1. **ダイアログやフォーム要素のDOM参照を作成する場合**: `useRef<HTMLDivElement>(null)`のように初期値をnullにすると、TypeScriptが自動的に`RefObject<T>`を推論するため、`as RefObject<T>`キャストは不要。DOM要素用のrefは常にnull初期値を使う
2. **前回のフォーカス要素など可変値を保持するrefを作成する場合**: `MutableRefObject`が必要なケースでは、初期値にnullを含めず適切な初期値を設定する。Props経由でrefを渡す際は`RefObject<T>`型で定義し、`| null`は不要

## useRefの型オーバーロード

Reactの`useRef`は以下の型オーバーロードを持つ：

```typescript
// 1. 初期値がnullの場合 → RefObject<T>を返す（DOM要素用）
function useRef<T>(initialValue: T | null): RefObject<T>;

// 2. 初期値が非nullの場合 → MutableRefObject<T>を返す
function useRef<T>(initialValue: T): MutableRefObject<T>;

// 3. 初期値なしの場合 → MutableRefObject<T | undefined>を返す
function useRef<T = undefined>(): MutableRefObject<T | undefined>;
```

## RefObject vs MutableRefObject

| 型 | currentプロパティ | 主な用途 |
|---|------------------|---------|
| `RefObject<T>` | `readonly current: T \| null` | DOM要素への参照 |
| `MutableRefObject<T>` | `current: T` | 任意の可変値の保持 |

## DOM要素用refの正しい書き方

```typescript
// ✅ 良い例: 型キャスト不要
const useElementRef = <T extends HTMLElement>(): RefObject<T> => {
  const ref = useRef<T>(null);  // RefObject<T>を返す
  return ref;  // 型キャスト不要
};
```

```typescript
// ❌ 悪い例: 不要な型キャスト
const ref = useRef<T>(null);
return ref as RefObject<T>;  // 不要なキャスト
```

## なぜキャストが不要か

`useRef<T>(null)`を呼び出すと：

1. TypeScriptは引数`null`を見て、オーバーロード `useRef<T>(initialValue: T | null): RefObject<T>` にマッチ
2. 戻り値は自動的に`RefObject<T>`になる
3. `RefObject<T>`は`{ readonly current: T | null }`なので、`current`がnullになりうることは型に含まれている

したがって、追加のキャストは不要。

## チェックリスト

`useRef`を使用する際は、以下を確認すること：

- [ ] DOM要素用には`useRef<T>(null)`を使用しているか（nullを初期値に）
- [ ] 戻り値の型を明示する場合、`RefObject<T>`で十分か（`RefObject<T | null>`は冗長）
- [ ] 不要な`as RefObject<T>`キャストを追加していないか

## Propsで受け取るRefの型

`useRef<T>(null)`で作成したrefを子コンポーネントにpropsで渡す場合、受け取る側の型定義は`RefObject<T>`とする（`| null`は不要）。

```typescript
// ✅ 正しい型定義
interface ChildProps {
  dialogRef: RefObject<HTMLDivElement>;
}

// ❌ 誤った型定義: | null は不要（DOM要素のref属性と互換性がなくなる）
interface ChildProps {
  dialogRef: RefObject<HTMLDivElement | null>;
}
```

**理由**:
- `RefObject<T>`は既に`{ readonly current: T | null }`という型を持つ
- 型パラメータに`| null`を追加すると`RefObject<HTMLDivElement | null>`となり、DOM要素の`ref`属性（`LegacyRef<HTMLDivElement>`）と互換性がなくなる
- `useRef<HTMLDivElement>(null)`は`RefObject<HTMLDivElement>`を返すので、そのまま使用する

## eslint-rule

ESLint化不可（型キャストの必要性は文脈依存であり、静的解析で正誤を判断できない。PRレビューで確認）
