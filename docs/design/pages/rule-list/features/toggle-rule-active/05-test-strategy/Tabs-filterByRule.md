---
codd:
  node_id: "design:design-pages-rule-list-features-toggle-rule-active-05-test-strategy-tabs-filterbyrule"
  type: design
---

# Tabs.filterByRule() テスト戦略

## 目的

RewriteRuleのURLパターンにマッチするタブのみをフィルタリングし、
新しいTabsインスタンスとして返却する。

## テスト分類

### 1. 正常系（マッチング結果）

RewriteRule.matchesUrl()によるフィルタリング結果を確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 一部マッチ | 複数タブ中、一部のみマッチ | 基本パターン |
| 全マッチ | 全タブがルールにマッチ | 境界値 |
| 全不一致 | 全タブがルールに不一致 | 境界値 |

**対応テスト**: `normal-cases.test.ts`

### 2. エッジケース

特殊な状態での動作を確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 空のTabs | タブ0件に対して実行 | 境界値 |
| 単一タブマッチ | 1件のみでマッチ | 境界値 |
| 単一タブ不一致 | 1件のみで不一致 | 境界値 |

**対応テスト**: `edge-cases.test.ts`

### 3. 不変条件（新インスタンス返却）

元のTabsインスタンスが変更されないことを確認。

| 確認事項 | 根拠 |
|---------|------|
| 戻り値が新しいTabsインスタンス | ファーストクラスコレクション不変性 |
| 元インスタンスのタブ数が変わらない | 副作用防止 |

**対応テスト**: `normal-cases.test.ts` 内で確認

## 網羅性チェック

- [x] 一部マッチのフィルタリング
- [x] 全マッチのケース
- [x] 全不一致のケース
- [x] 空Tabsへの適用
- [x] 新インスタンス返却の確認
- [ ] 異常系 → 不要（RewriteRule型で制約）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/browser/Tabs/filterByRule/
├── normal-cases.test.ts   # マッチング結果（3ケース、配列ベース）
└── edge-cases.test.ts     # エッジケース（3ケース、配列ベース）
```

## モック戦略

RewriteRuleのmatchesUrl()メソッドをモック化。

### モックファイル構成

```text
tests/unit/frameworks-and-drivers/browser/Tabs/
└── mocks/
    ├── createMockTab.ts    # Tab生成関数（constructorと共用）
    └── createMockRule.ts   # RewriteRuleモック生成関数
```

### 使用方法

```typescript
// テストコード内で直接モックを定義せず、インポートして使用
import { createMockTab } from '../mocks/createMockTab';
import { createMockRule } from '../mocks/createMockRule';
```
