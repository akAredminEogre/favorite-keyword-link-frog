---
codd:
  node_id: "governance:adr-008-ui-component-directory-migration"
  type: governance
---

# ADR-008: UIコンポーネント配置の段階的移行

## ステータス

承認済み

## コンテキスト

現在、UIコンポーネントは以下の2箇所に分散している:

- `src/components/` - 既存のUIコンポーネント（SaveButton、CancelButtonなど）
- `src/frameworks-and-drivers/ui/components/` - Clean Architectureに準拠した配置

Clean Architectureでは、UIコンポーネントは第4層（frameworks-and-drivers）に属するため、`src/frameworks-and-drivers/ui/components/` が理論的に正しい配置である。

しかし、既存コンポーネントを一括移行すると影響範囲が大きく、リスクが高い。

## 決定

UIコンポーネントの配置を段階的に移行する:

### 1. 新規作成コンポーネント

新規作成するUIコンポーネントは、すべて `src/frameworks-and-drivers/ui/components/` に配置する。

```text
src/frameworks-and-drivers/ui/components/
├── atoms/
│   ├── DeleteButton/
│   └── ToastNotification/
├── molecules/
└── organisms/
    └── ConfirmDialog/
```

### 2. 既存コンポーネントの移行

既存の `src/components/` 配下のコンポーネントは、以下のタイミングで移行する:

| 移行タイミング | 対象 |
|--------------|------|
| 変更時 | 機能追加・修正で変更が必要になったコンポーネント |
| 別タスク | 移行専用のユーザーストーリーで対応 |

### 3. 最終目標

すべてのUIコンポーネントを `src/frameworks-and-drivers/ui/components/` に統一する。

移行完了後、`src/components/` ディレクトリは削除する。

## 移行対象（現状）

| 現在の配置 | 移行先 |
|-----------|--------|
| `src/components/atoms/Button/` | `src/frameworks-and-drivers/ui/components/atoms/Button/` |
| `src/components/molecules/SaveButton/` | `src/frameworks-and-drivers/ui/components/atoms/SaveButton/` |
| `src/components/molecules/CancelButton/` | `src/frameworks-and-drivers/ui/components/atoms/CancelButton/` |
| `src/components/molecules/RuleCard/` | `src/frameworks-and-drivers/ui/components/molecules/RuleCard/` |
| その他 | 同様のパターンで移行 |

## 影響

- 新規開発: `src/frameworks-and-drivers/ui/components/` に配置
- 既存コード: 移行完了まで `src/components/` を参照可能
- インポートパス: 移行時に更新が必要

## 関連ドキュメント

- [ADR-001: Clean Architecture with Presenter Pattern](./001-clean-architecture-with-presenter-pattern.md)
- [UIコンポーネント コーディング規約](../coding-standards/src/frameworks-and-drivers/ui/components.md)
