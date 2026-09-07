---
codd:
  node_id: "governance:coding-standards-tests-e2e-common-rule"
  type: governance
---

# E2Eテスト共通ルール

## 適用シナリオ

1. **新機能のE2Eテストを追加する場合**: テストファイルは`tests/e2e/pages/{page-name}/features/{feature-name}/`に配置し、設計ドキュメントのディレクトリ構造に合わせる
2. **拡張機能のUI操作テストにコンソールエラー検知を追加する場合**: ポップアップページやルールページなど拡張機能側のページで操作を行うテストでは、コンソールエラー監視を設定する。対象ページ（テスト先のWebページ）側のコンソールエラーは検知対象外とし、拡張機能側のエラーのみを検知する

## ディレクトリ構造
E2Eテストは機能ごとに作成し、docs/designのディレクトリ構造を踏襲した形で配置する。

```plaintext
tests/e2e/pages/{page-name}/features/{feature-name}/
└── {テスト観点}.spec.ts
```

## コンソールエラーの検知

拡張機能側で発生しているコンソールエラーを検知し、1件以上あった場合はテストを失敗させる。
- ページ側のコンソールエラーは検知しない

### 実装例

```typescript
import { test, expect } from './fixtures';

test('', async ({ page, popupPage }) => {
  // 前略

  // コンソールエラーメッセージを記録するための配列
  const consoleMessages: string[] = [];

  // ポップアップページのコンソールメッセージを監視
  popupPage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(msg.text());
    }
  });

  // Assert: コンソールエラーが発生していないことを確認
  expect(consoleMessages).toHaveLength(0);
});
```