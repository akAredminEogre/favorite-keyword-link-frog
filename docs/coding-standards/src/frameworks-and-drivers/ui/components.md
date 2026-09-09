---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-components"
  type: governance
---

# UI コンポーネント コーディング規約

## 概要

Atomic Design に基づく UI コンポーネントの Props 型に関する規約。

## Props の型設計

### 原則: コンポーネント粒度に応じた型選択

| 粒度 | Props に使用する型 | 理由 |
|------|-------------------|------|
| Atoms | プリミティブ型のみ | 汎用性・再利用性の維持 |
| Molecules | プリミティブ型推奨 | 汎用性の維持 |
| Organisms | エンティティ型も可 | 特定コンテキストに依存してよい |
| Pages | エンティティ型も可 | 特定ユースケースに特化 |

### Atoms: プリミティブ型のみ

Atoms は最も基本的な UI 部品であり、**プリミティブ型のみ**を Props として受け取る。

- 汎用的で再利用可能な部品として設計する
- ドメイン層への依存を避ける
- 異なるコンテキストでも使用可能にする

### Pages/Organisms: エンティティ型も許容

Pages や Organisms は特定のユースケースに特化するため、エンティティ型を受け取ってもよい。

## データフロー

Presenter は View (Page) にエンティティを渡し、View はエンティティから必要な値のみを抽出して、Atom にはプリミティブ型として値を渡す。

---

## ボタンの処理中状態

### 原則: 処理中のボタンにはdisabled属性を付与し、視覚的フィードバックを提供すること

ボタンクリック後に処理中状態（`isProcessing`等）でクリックをガードする場合、同時に`disabled`属性も設定する。

### 理由

- ユーザーに「ボタンが反応しない理由」を視覚的に伝える
- ボタンがグレーアウトされ、カーソルも変化する
- スクリーンリーダーが「無効」と読み上げる（アクセシビリティ）

### CSSスタイル要件

disabled属性を使用する場合、対応するCSSスタイルも必ず定義すること:

| プロパティ | 値 | 目的 |
|-----------|-----|------|
| `cursor` | `not-allowed` | クリック不可を視覚的に示す |
| `opacity` | `0.6` | 無効状態を視覚的に区別 |
| `:hover:not(:disabled)` | - | ホバー効果を無効状態で無効化 |

### 適用場面

| シナリオ | disabled属性 |
|---------|-------------|
| API呼び出し中 | `disabled={isLoading}` |
| フォーム送信中 | `disabled={isSubmitting}` |
| 連続クリック防止中 | `disabled={isProcessing}` |

### eslint-rule

ESLint化不可（処理中状態の管理方法は文脈依存であり、静的解析で正誤を判断できない。PRレビューで確認）

---

## eslint-rule

`host-frontend-root/frontend-src-root/eslint-rules/clean-architecture/frameworks-and-drivers/ui/atoms.js`

Atoms内でのエンティティ/値オブジェクトのimportを禁止。プリミティブ型のみかどうかの完全な検証はPRレビューで確認。

## 関連ドキュメント

- [ADR-001: Clean Architecture with Presenter Pattern](../../../../adr/001-clean-architecture-with-presenter-pattern.md)
- [ADR-008: UIコンポーネント配置の段階的移行](../../../../adr/008-ui-component-directory-migration.md)
