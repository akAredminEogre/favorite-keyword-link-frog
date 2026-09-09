---
codd:
  node_id: "design:design-clean-architecture-domain-entities"
  type: design
---

<!-- このファイルが更新されるたびに、eslintの設定も更新すること -->

# Domain Layer - Entities 設計ガイドライン

## 概要

Domain層のEntitiesは、ビジネスロジックの中核を担うクラスである。Clean Architectureの原則に従い、外部依存を最小限に抑える必要がある。

## グローバルオブジェクトへの直接アクセス禁止

### 対象ファイル

現状、以下のファイルが対象である：

- `src/domain/entities/ElementSelector.ts`
- `src/domain/entities/ParserContextStrategy.ts`
- `src/domain/value-objects/Elements/Elements.ts`

### 禁止事項

Domain層のEntitiesでは、以下のグローバルオブジェクトへの**直接アクセスを禁止**する：

- `document`
- `document.body`
- `document.body.contains()`
- `document.createElement()`

### 理由

1. **依存性逆転の原則（DIP）違反**: グローバルオブジェクトへの直接アクセスは、Domain層が外部環境に依存することを意味する
2. **テスタビリティの低下**: グローバル状態に依存するコードは、単体テストが困難になる
3. **環境依存**: ブラウザ環境以外での実行が不可能になる

### 対処方法

グローバルオブジェクトへのアクセスが必要な場合は、**Port/Adapterパターン**を使用する：

1. Domain層にインターフェース（Port）を定義
2. Infrastructure層で実装（Adapter）を作成
3. 依存性注入（DI）でEntityに注入
