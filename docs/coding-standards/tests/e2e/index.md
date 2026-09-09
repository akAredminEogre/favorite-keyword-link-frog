---
codd:
  node_id: "governance:coding-standards-tests-e2e-index"
  type: governance
---

# E2Eテストルール

E2Eテスト（Playwright）に適用されるルール。

## 目次

| ファイル | 内容 |
|---------|------|
| [naming-rules.md](./naming-rules.md) | テスト名は検証内容を正確に記述、曖昧表現の回避 |
| [selector-rules.md](./selector-rules.md) | 要素セレクタの優先順位、data-testid命名規則、ヘルパー更新、行スコープ |
| [helper-organization/](./helper-organization/index.md) | 2層構造、配置判断基準、エラー処理パターン |
| [assertion-rules.md](./assertion-rules.md) | 重複アサーション禁止、前提条件検証 |
| [interaction-rules.md](./interaction-rules.md) | click()とdispatchEvent()の使い分け、連続クリックテスト |
| [text-extraction-rules.md](./text-extraction-rules.md) | textContent()のtrim()正規化、innerText()との違い |
| [consistency-maintenance-guideline.md](../../../../docs-rules/coding-standards/tests/e2e/consistency-maintenance-guideline.md) | ルール追加時の一貫性維持 |

## 概要

E2Eテストコードを書く際は、以下の観点でルールに従うこと：

1. **テスト命名**: 検証内容を正確に記述し、曖昧な表現を避ける
2. **セレクタ選択**: テストの安定性を確保するため、`data-testid`を優先使用
3. **ヘルパー配置**: グローバル共通と機能固有の2層構造で整理
4. **アサーション**: ヘルパー関数との重複を避け、前提条件を明示的に検証
5. **インタラクション**: 連続クリックテストには`dispatchEvent`を使用
6. **テキスト取得**: `textContent()`は`trim()`で正規化
7. **配列ベーステスト**: 類似テストケースは配列化して実装（[共通ルール](../array-based-test.md)を参照）
8. **一貫性維持**: 新ルール追加時は同じPR内で適用

詳細なガイドラインは [consistency-maintenance-guideline.md](../../../../docs-rules/coding-standards/tests/e2e/consistency-maintenance-guideline.md) を参照。
specファイル変更時のテスト戦略書同期は [.AI/tests/e2e/consistency-maintenance-guideline.md](../../../../.AI/tests/e2e/consistency-maintenance-guideline.md) を参照。
