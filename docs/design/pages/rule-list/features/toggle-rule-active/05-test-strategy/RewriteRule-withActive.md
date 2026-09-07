---
codd:
  node_id: "design:design-pages-rule-list-features-toggle-rule-active-05-test-strategy-rewriterule-withactive"
  type: design
---

# RewriteRule.withActive() テスト戦略

## 目的

isActive状態を変更した新しいRewriteRuleインスタンスを返す。
元のインスタンスは変更しない（イミュータブル）。

## テスト分類

### 1. 状態変更（同値分割）

入力値（initialIsActive × newIsActive）の全パターンをカバー。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| true → false | isActive=trueをfalseに変更 | 基本パターン（有効→無効） |
| false → true | isActive=falseをtrueに変更 | 基本パターン（無効→有効） |
| true → true | 同値設定でも新インスタンス | 冪等性確認 |
| false → false | 同値設定でも新インスタンス | 冪等性確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. 不変条件（イミュータブル性）

Value Objectパターンとして、元インスタンスが変更されないことを確認。

| 確認事項 | 根拠 |
|---------|------|
| 元インスタンスのisActiveが変更されない | Value Objectパターン、副作用防止 |

**対応テスト**: `immutability.test.ts`

### 3. 副作用の範囲

変更対象以外のプロパティが維持されることを確認。

| 確認事項 | 根拠 |
|---------|------|
| id維持 | 意図しない変更の防止 |
| oldString維持 | 意図しない変更の防止 |
| newString維持 | 意図しない変更の防止 |
| urlPattern維持 | 意図しない変更の防止 |
| isRegex維持 | 意図しない変更の防止 |
| isActiveが期待値に変更 | 変更対象の確認 |

**対応テスト**: `property-preservation.test.ts`

## 網羅性チェック

- [x] 全入力パターン（true/false × true/false = 4パターン）
- [x] イミュータブル性（元インスタンス不変）
- [x] 他プロパティ不変（5プロパティ）
- [x] 戻り値が新インスタンスであること
- [ ] 異常系 → 不要（引数がbooleanのため型で制約）

## テストファイル構成

```text
tests/unit/enterprise-business-rules/entities/RewriteRule/withActive/
├── normal-cases.test.ts       # 状態変更（4ケース、配列ベース）
├── immutability.test.ts       # イミュータブル性（1ケース）
└── property-preservation.test.ts  # プロパティ維持（1ケース）
```
