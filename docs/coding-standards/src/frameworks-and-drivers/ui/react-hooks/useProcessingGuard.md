---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-react-hooks-useprocessingguard"
  type: governance
---

# useProcessingGuard - 連続クリック防止フック

## 概要

ダイアログのボタン等で連続クリックによる多重実行を防止するカスタムフック。

## なぜ必要か

ダイアログの「確認」ボタンなどは、クリック後にダイアログが閉じるまでの間に再度クリックされると、同じ処理が複数回実行される可能性がある。このフックで処理中状態を管理し、連続クリックを防止する。

## 使用方法

```tsx
const { isProcessing, guardedHandler } = useProcessingGuard(isOpen);

// useMemoでメモ化して使用
const handleConfirm = useMemo(
  () => guardedHandler(onConfirm),
  [guardedHandler, onConfirm]
);

<button onClick={handleConfirm} disabled={isProcessing}>
  {isProcessing ? '処理中...' : '確認'}
</button>
```

## 引数

| 引数 | 型 | 説明 |
|-----|---|------|
| `isActive` | `boolean` | trueになったときに処理状態をリセット（例: ダイアログのisOpen） |

## 戻り値

| プロパティ | 型 | 説明 |
|-----------|---|------|
| `isProcessing` | `boolean` | 処理中かどうか（視覚的フィードバック用） |
| `guardedHandler` | `<T extends () => void>(handler: T) => () => void` | ハンドラをガードでラップする関数 |

## 状態リセットのタイミング

| タイミング | リセット | 理由 |
|-----------|---------|------|
| 正常完了時 | しない | 連続クリック防止のため（ダイアログが閉じるまでブロック） |
| エラー発生時 | する | 再試行を可能にするため |
| isActive=true時 | する | ダイアログ再オープン時に新しい状態で開始 |

## 制約事項

### 同期ハンドラのみサポート

非同期ハンドラ（async関数）を渡した場合、Promiseの完了を待たずに処理完了と見なされる。非同期処理が必要な場合は、ハンドラ内でダイアログを閉じる処理を同期的に実行し、非同期処理は別途管理すること。

```tsx
// ✅ 良い例: 同期的にダイアログを閉じる
const handleConfirm = useMemo(
  () => guardedHandler(() => {
    onConfirm(); // これがダイアログを閉じる
    // 非同期処理は呼び出し元で管理
  }),
  [guardedHandler, onConfirm]
);

// ❌ 悪い例: 非同期処理の完了を待とうとする
const handleConfirm = useMemo(
  () => guardedHandler(async () => {
    await someAsyncOperation(); // Promiseは待機されない
    onConfirm();
  }),
  [guardedHandler, onConfirm]
);
```

## 関連ドキュメント

- [状態ガード/ロックの実装ルール](./state-guard.md)
- [コールバックのメモ化](./callback-memoization.md) - guardedHandlerの結果はuseMemoでメモ化すること

## eslint-rule

ESLint化不可（フックの使用パターンは文脈依存。PRレビューで確認）
