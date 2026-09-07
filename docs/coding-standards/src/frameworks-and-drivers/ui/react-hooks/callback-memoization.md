---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-react-hooks-callback-memoization"
  type: governance
---

# コールバックのメモ化

## 概要

JSX内で関数を生成するとレンダリングごとに新しいインスタンスが作成される。パフォーマンス最適化のため、適切にメモ化する。

## 問題パターン: レンダー中の関数生成

```tsx
// ❌ 悪い例: レンダーごとに新しい関数インスタンスが生成される
const MyComponent = ({ onAction }) => {
  const { guardedHandler } = useProcessingGuard();

  return (
    <>
      {/* guardedHandler(onAction) がレンダーごとに呼ばれる */}
      <button onClick={guardedHandler(onAction)}>実行</button>
      <button onClick={guardedHandler(onAction)}>実行2</button>  {/* 別インスタンス */}
    </>
  );
};
```

このパターンの問題点：
1. **毎回新しい関数が生成される**: `guardedHandler(onAction)` はレンダー中に実行され、戻り値（関数）が毎回新しいインスタンスになる
2. **同じハンドラでも別インスタンス**: 同じ `guardedHandler(onAction)` を複数箇所で使うと、それぞれ別の関数インスタンスになる
3. **子コンポーネントの再レンダリング**: 新しい関数インスタンスが渡されると、`React.memo` 等のメモ化が無効化される

## 解決策: useMemoでメモ化

```tsx
// ✅ 良い例: ハンドラをメモ化
const MyComponent = ({ onAction, onCancel }) => {
  const { guardedHandler } = useProcessingGuard();

  // ガード済みハンドラをメモ化
  const handleAction = useMemo(
    () => guardedHandler(onAction),
    [guardedHandler, onAction]
  );
  const handleCancel = useMemo(
    () => guardedHandler(onCancel),
    [guardedHandler, onCancel]
  );

  return (
    <>
      <button onClick={handleAction}>実行</button>
      <button onClick={handleAction}>実行2</button>  {/* 同じインスタンス */}
      <button onClick={handleCancel}>キャンセル</button>
    </>
  );
};
```

## useMemo vs useCallback

| フック | 用途 | 例 |
|-------|------|---|
| `useCallback` | 関数自体をメモ化 | `useCallback(() => doSomething(), [deps])` |
| `useMemo` | 関数の**戻り値**をメモ化 | `useMemo(() => createHandler(), [deps])` |

**使い分け**:
- 単純なイベントハンドラ → `useCallback`
- 関数を返す関数（ファクトリ）の結果 → `useMemo`

```tsx
// useCallback: 関数自体をメモ化
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);

// useMemo: 関数を返す関数の結果をメモ化
const guardedClick = useMemo(
  () => guardedHandler(onClick),  // guardedHandlerの戻り値をメモ化
  [guardedHandler, onClick]
);
```

## メモ化が必要なケース

| ケース | 理由 |
|-------|------|
| 同じハンドラを複数箇所で使用 | インスタンスの一貫性を保つ |
| 子コンポーネントにハンドラを渡す | `React.memo` の効果を維持 |
| 関数を返す関数（ファクトリ）の結果を使用 | 毎回新しい関数が生成されるのを防ぐ |

## チェックリスト

コールバックを使用する際は、以下を確認すること：

- [ ] JSX内で `fn(arg)` 形式で関数を呼び出していないか（レンダー中の関数生成）
- [ ] 同じハンドラを複数箇所で使用していないか
- [ ] 子コンポーネントにハンドラを渡す場合、メモ化を検討したか
- [ ] `useCallback` と `useMemo` を適切に使い分けているか

## eslint-rule

部分的にESLint化可能:
- `react-hooks/exhaustive-deps`: 依存配列の漏れを検出
- ただし「メモ化すべきかどうか」は文脈依存のためPRレビューで確認
