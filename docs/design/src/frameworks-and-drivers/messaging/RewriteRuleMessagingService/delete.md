---
codd:
  node_id: "design:design-src-frameworks-and-drivers-messaging-rewriterulemessagingservice-delete"
  type: design
---

# RewriteRuleMessagingService.delete() テスト戦略

## 目的

@webext-core/proxy-service経由でBackground ScriptにRewriteRule削除を依頼する。
Content ScriptでのDB操作仲介を検証する。

## テスト分類

### 1. 正常系（ProxyService連携）

ProxyServiceのdeleteRule()を呼び出し、正常に完了することを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 削除成功 | deleteRule()が正常に完了する | 基本パターン |
| IDの伝播 | DTOのidがdeleteRule()に正しく渡される | 引数の正確性確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. ProxyService呼び出し確認

getRewriteRuleProxyService()で取得したサービスのdeleteRule()が正しく呼ばれることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 呼び出し回数 | deleteRule()が1回呼ばれる | メソッド委譲の確認 |
| 呼び出し引数 | deleteRule(id)にDTOのidが渡される | 引数マッピングの確認 |

**対応テスト**: `normal-cases.test.ts` 内で検証

## 網羅性チェック

- [x] 削除成功時の処理
- [x] deleteRule()が1回呼ばれること
- [x] DTOのidがdeleteRule()に正しく渡されること
- [ ] 異常系（ProxyServiceエラー） → 不要（エラーハンドリングなし、上位層で処理）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/messaging/RewriteRuleMessagingService/
├── delete/
│   └── normal-cases.test.ts       # ProxyService連携（2ケース）
└── mocks/
    └── createMockRewriteRuleProxyService.ts  # モックファクトリ（既存）
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

### モック対象

- **IRewriteRuleProxyService**: @webext-core/proxy-serviceから取得されるサービスオブジェクト
  - `deleteRule()` メソッドをモック設定

### モックファイル構成

```text
tests/unit/frameworks-and-drivers/messaging/RewriteRuleMessagingService/mocks/
└── createMockRewriteRuleProxyService.ts    # モックファクトリ（既存、deleteRule()はモック済み）
```

### モックファクトリ

既存の`createMockRewriteRuleProxyService.ts`を使用。deleteRule()は既にモック定義済み。

### モック対象の理由

- getRewriteRuleProxyService: @webext-core/proxy-serviceはChrome拡張機能のランタイム通信に依存するため、単体テストではモック化が必須
- vi.mock()はテストファイルのモジュールトップレベルでのみ呼び出す（本番コードのbackground.tsで行う実装注入は本テストでは実行しない）
