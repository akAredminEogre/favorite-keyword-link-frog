---
codd:
  node_id: "design:design-src-frameworks-and-drivers-messaging-rewriterulemessagingservice-getall"
  type: design
---

# RewriteRuleMessagingService.getAll() テスト戦略

## 目的

@webext-core/proxy-service経由でBackground ScriptからRewriteRuleDTO配列を取得する。
Content ScriptでのDB操作仲介を検証する。

## テスト分類

### 1. 正常系（ProxyService連携）

ProxyServiceからDTOを取得し、そのまま返却することを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 単一ルール | 1件のDTOを返却 | 基本パターン |
| 空配列 | 0件のDTOを空配列で返却 | 境界値（最小ケース） |
| 複数ルール | 複数件のDTOを配列で返却 | 複数件処理の確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. ProxyService呼び出し確認

getRewriteRuleProxyService()で取得したサービスのgetAllRules()が呼ばれることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 呼び出し回数 | getAllRules()が1回呼ばれる | メソッド委譲の確認 |

**対応テスト**: `normal-cases.test.ts` 内で検証

## 網羅性チェック

- [x] 単一ルールの返却
- [x] 空配列の処理
- [x] 複数ルールの返却
- [x] ProxyService.getAllRules()が1回呼ばれること
- [ ] 異常系（ProxyServiceエラー） → 不要（エラーハンドリングなし、上位層で処理）
- [ ] getById/updateActive → 不要（スケルトン実装、Not Implemented）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/messaging/RewriteRuleMessagingService/
├── getAll/
│   └── normal-cases.test.ts       # ProxyService連携（3ケース）
└── mocks/
    └── createMockRewriteRuleProxyService.ts  # モックファクトリ
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

### モック対象

- **IRewriteRuleProxyService**: @webext-core/proxy-serviceから取得されるサービスオブジェクト
  - `getAllRules()` メソッドをモック設定

### モックファイル構成

```text
tests/unit/frameworks-and-drivers/messaging/RewriteRuleMessagingService/mocks/
└── createMockRewriteRuleProxyService.ts    # モックファクトリ
```

### モックファクトリ

```typescript
// createMockRewriteRuleProxyService.ts
import { vi } from 'vitest';
import { IRewriteRuleProxyService } from 'src/frameworks-and-drivers/messaging/RewriteRuleProxyService';

export const createMockRewriteRuleProxyService = (): IRewriteRuleProxyService => {
  return {
    getAllRules: vi.fn(),
  };
};
```

### モック対象の理由

- getRewriteRuleProxyService: @webext-core/proxy-serviceはChrome拡張機能のランタイム通信に依存するため、単体テストではモック化が必須
- vi.mock()はテストファイルのモジュールトップレベルでのみ呼び出す（本番コードのbackground.tsで行う実装注入は本テストでは実行しない）
