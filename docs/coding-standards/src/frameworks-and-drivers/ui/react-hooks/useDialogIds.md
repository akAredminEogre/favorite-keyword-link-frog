---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-react-hooks-usedialogids"
  type: governance
---

# useDialogIds - ARIA用ID生成フック

## 概要

ダイアログの`aria-labelledby`と`aria-describedby`で使用するIDを、Reactの`useId()`を使って一意に生成するカスタムフック。

## なぜ必要か

ハードコードされたID（例: `confirm-dialog-title`）は、同一ページ内で複数のダイアログが同時にレンダリングされた場合にID競合を引き起こす。

`useId()`を使用することで：
- SSRでも安全に一意のIDを生成
- 複数ダイアログの同時レンダリングに対応
- コンポーネントの再利用性を確保

## 使用方法

```tsx
const { titleId, descriptionId } = useDialogIds('confirm-dialog');

<div role="dialog" aria-labelledby={titleId} aria-describedby={descriptionId}>
  <h2 id={titleId}>タイトル</h2>
  <p id={descriptionId}>説明文</p>
</div>
```

## 引数

| 引数 | 型 | 説明 |
|-----|---|------|
| `prefix` | `string` | IDの接頭辞（デバッグ時の可読性向上） |

## 戻り値

| プロパティ | 型 | 説明 |
|-----------|---|------|
| `titleId` | `string` | タイトル要素のID（aria-labelledby用） |
| `descriptionId` | `string` | 説明要素のID（aria-describedby用） |

## 関連ドキュメント

- [ADR-007: ダイアログコンポーネントのアクセシビリティ要件](../../../../../adr/007-dialog-accessibility-requirements.md) - 「1.1 ID生成にuseId()を使用」セクション

## eslint-rule

ESLint化不可（フックの使用パターンは文脈依存。PRレビューで確認）
