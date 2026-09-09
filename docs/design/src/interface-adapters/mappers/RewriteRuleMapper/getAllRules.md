---
codd:
  node_id: "design:design-src-interface-adapters-mappers-rewriterulemapper-getallrules"
  type: design
---

# RewriteRuleMapper.getAllRules() テスト戦略

## 目的

IRewriteRuleMessagingPort経由でDTO配列を取得し、RewriteRule配列に変換する。
MessagingPort（proxy-service）との連携と、DTO→Entity変換の統合を検証する。

## テスト分類

### 1. 正常系（MessagingPort連携）

MessagingPortからDTOを取得し、Entityに変換できることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 単一ルール | 1件のDTOをEntityに変換 | 基本パターン |
| 空配列 | 0件のDTOを空配列で返却 | 境界値（最小ケース） |
| 複数ルール | 複数件のDTOをEntity配列に変換 | 複数件処理の確認 |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] 単一ルールの変換
- [x] 空配列の処理
- [x] 複数ルールの変換
- [x] MessagingPort.getAll()が1回呼ばれること
- [x] 戻り値がRewriteRuleインスタンスであること
- [ ] 異常系（MessagingPortエラー） → 将来検討（現時点ではエラーハンドリングなし）
- [ ] 個別プロパティの検証 → 不要（toEntity()のテストで網羅済み）

## テストファイル構成

```text
tests/unit/interface-adapters/mappers/RewriteRuleMapper/getAllRules/
└── normal-cases.test.ts       # MessagingPort連携（3ケース）
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

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
