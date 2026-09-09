---
codd:
  node_id: "design:design-src-interface-adapters-mappers-rewriterulemapper-delete"
  type: design
---

# RewriteRuleMapper.delete() テスト戦略

## 目的

指定されたIDを使用してIRewriteRuleMessagingPort経由でルール削除リクエストを送信する。
MessagingPort（proxy-service）との連携を検証する。

## テスト分類

### 1. 正常系（MessagingPort連携）

MessagingPortに正しいDTOを渡して削除リクエストを送信できることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| ID=1 | 最小IDで正しくDTOが構築され、messagingPort.delete()が1回呼ばれる | 基本パターン + 境界値（最小ID） |
| ID=999 | 大きなIDでも正しくDTOが構築される | 大きな値での動作確認 |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] 単一IDでの削除呼び出し
- [x] messagingPort.delete()が1回呼ばれること
- [x] 正しいDeleteRuleRequestDTOが渡されること
- [ ] 異常系（MessagingPortエラー） → 将来検討（現時点ではエラーハンドリングなし）

## テストファイル構成

```text
tests/unit/interface-adapters/mappers/RewriteRuleMapper/delete/
└── normal-cases.test.ts       # MessagingPort連携（2ケース）
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

### モック対象

- **IRewriteRuleMessagingPort**: 外部依存（proxy-service経由のBackground通信）をモック化
  - `delete()`: 成功時にPromise.resolve()を返すようモック設定
  - `getAll()`, `getById()`, `updateActive()`: インターフェース準拠のためダミー定義

### モックファイル構成

インターフェース配下にモックファクトリを配置（複数テストで共有）:

```text
tests/unit/interface-adapters/ports/IRewriteRuleMessagingPort/mocks/
└── createMockRewriteRuleMessagingPort.ts    # モックファクトリ（既存）
```
