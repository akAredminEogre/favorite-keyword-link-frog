---
codd:
  node_id: "governance:coding-standards-enterprise-business-rules-branded-types"
  type: governance
---

# Branded Type 規約

## 目的

`enterprise-business-rules/` 層の Entity ID を Branded Type 化することで、`number` 同士の誤代入（`RuleId` ↔ `TabId` 等）をコンパイル時に弾く。factory 集約による検証ロジック散逸の防止と、例外窓口の一箇所宣言を両立する。

## 適用範囲

`enterprise-business-rules/` 配下の Entity ID に限定。他層（interface-adapters / frameworks-and-drivers 等）での全量 Branded 化は未適用（Stage 2 以降で段階的に拡大予定）。

## 命名規則

- 型名の形式: `*Id`（例: `RuleId`、`TabId`）
- factory 関数名の形式: `create*Id`
- factory 引数型: `unknown`（境界検証込み）

## 型の使い分け方針

- Entity 内部のフィールド・`fromParams` 戻り値 → Branded 必須
- Entity 外部（repository / mapper / interactor）→ 段階的に Branded 化（Stage 2 以降）、本 Stage では `number` 互換許容
- テスト fixture → factory ヘルパ経由を推奨（`as *Id` キャストは例外扱い）

## factory 集約先

`enterprise-business-rules/value-objects/ids/` 配下に全 factory を集約する。

## 禁止事項と許可事項

### 禁止

- Entity 外部で `as *Id` 直接キャスト（factory を経由すること）
- factory の重複定義（同一 ID 型の factory は 1 箇所のみ）
- factory 不在の生値で Entity を生成

### 許可（例外窓口）

- テスト fixture のヘルパ内での `as *Id` キャスト
- DTO↔Entity 境界マッパー内
- repository 内部（Stage 3 で回収予定）

## eslint-rule

現状: ESLint 自動強制は未実装（Stage 4 で導入予定）。

暫定運用: コードレビューでの人手チェック + 本規約文書への参照義務。

将来計画:
- Stage 4a: `@typescript-eslint/naming-convention` を流用した命名規則強制
- Stage 4b: `no-restricted-types` 流用による Entity 層内 `id: number` 禁止
- Stage 4c: custom rule（4a/4b で不足する場合の最終手段）

## 適用シナリオ

1. **Entity 生成時**: `RewriteRule.fromParams` は内部で `createRuleId` を呼び、不正な id（負数・非整数・非 number）は例外で弾く。呼び出し元は生の `number` を渡せるが、Entity 内部では必ず `RuleId` として扱われる。

2. **テスト記述時**: 新規テスト fixture では `createRuleId(42)` を使い、既存の生値 `{ id: 42 }` 直接渡しは Stage 2 以降で段階移行する。

## 進捗（移行ステータス）

- Stage 0: 完了（本PR #394） — type-fest 導入・本ドキュメント策定
- Stage 1: 完了（本PR #394） — `RuleId` 参照実装（`RewriteRule` Entity）
- Stage 2〜4: user-story-023 にて別PR対応
