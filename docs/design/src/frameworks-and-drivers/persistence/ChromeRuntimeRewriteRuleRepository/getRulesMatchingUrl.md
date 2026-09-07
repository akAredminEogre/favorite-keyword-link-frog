---
codd:
  node_id: "design:design-src-frameworks-and-drivers-persistence-chromeruntimerewriterulerepository-getrulesmatchingurl"
  type: design
---

# ChromeRuntimeRewriteRuleRepository.getRulesMatchingUrl() テスト戦略

## 目的

指定されたURLにマッチするRewriteRuleを取得する。
IRewriteRuleMessagingPort経由で全ルールを取得し、URLパターンでフィルタリングしてRewriteRulesを返す。

ADR-002, ADR-003に準拠: IRewriteRuleMessagingPort → Mapper → Repository

## テスト分類

### 1. 正常系（URLマッチング）

URLパターンに基づいてルールをフィルタリングできることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| マッチあり | URLにマッチするルールのみを取得する | 基本パターン |
| マッチなし | マッチするルールがない場合は空のRewriteRulesを返す | 境界値（結果0件） |
| 空urlPattern | 空のurlPatternを持つルールは取得されない | エッジケース |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] URLマッチングによるフィルタリング
- [x] マッチなしの場合の空RewriteRules返却
- [x] 空urlPatternのスキップ
- [x] IRewriteRuleMessagingPort.getAll()が呼ばれること
- [x] 戻り値がRewriteRulesインスタンスであること
- [ ] 異常系（MessagingPortエラー） → 将来検討（現時点ではエラーハンドリングなし）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/persistence/ChromeRuntimeRewriteRuleRepository/getRulesMatchingUrl/
└── normal-cases.test.ts       # URLマッチング（3ケース）
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../../docs/coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

### モック対象

- **IRewriteRuleMessagingPort**: 外部依存（proxy-service経由のBackground通信）をモック化
  - `getAll()`: テストケースごとに異なるDTO配列を返すようモック設定
  - `getById()`, `updateActive()`: インターフェース準拠のためダミー定義

### モックファイル構成

インターフェース配下にモックファクトリを配置（複数テストで共有）:

```text
tests/unit/interface-adapters/ports/IRewriteRuleMessagingPort/mocks/
└── createMockRewriteRuleMessagingPort.ts    # モックファクトリ
```
