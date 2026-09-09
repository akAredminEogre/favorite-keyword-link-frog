---
codd:
  node_id: "governance:coding-standards-tests-common-rule-index"
  type: governance
---

# テスト共通ルール

テストコード全般に適用される共通ルール。

## ルール一覧

| § | ルール名 | 概要 |
| --- | --------- | ------ |
| 1 | [インポートパスのルール](./import-paths.md) | パスエイリアス使用、相対パス禁止 |
| 2 | [モックファイルの配置ルール](./mock-file-placement.md) | モック配置先、既存モック確認手順 |
| 3 | [テストデータの型注釈ルール](./test-data-type-annotations.md) | テストケース配列への型注釈 |
| 4 | [モック型キャストの禁止](./mock-type-cast-prohibition.md) | `as ReturnType<typeof vi.fn>` 禁止、`vi.mocked()` 使用 |
| 5 | [テストケース配列のフィールド使用検証](./test-case-field-usage.md) | 定義したフィールドの使用漏れ防止 |
| 6 | [モック初期化・リセットの明示的呼び出し](./mock-init-reset.md) | beforeEach/afterEach での明示的呼び出し |
| 7 | [テスト戦略書との一貫性](./test-strategy-consistency.md) | テストケース名・順番をテスト戦略書と一致 |
| 8 | [JSDocルール](./jsdoc-rule.md) | テストJSDocの記述原則と更新義務 |

## カテゴリ別インデックス

### モック関連

- [§2 モックファイルの配置ルール](./mock-file-placement.md)
- [§4 モック型キャストの禁止](./mock-type-cast-prohibition.md)
- [§6 モック初期化・リセットの明示的呼び出し](./mock-init-reset.md)

### テストデータ関連

- [§3 テストデータの型注釈ルール](./test-data-type-annotations.md)
- [§5 テストケース配列のフィールド使用検証](./test-case-field-usage.md)

### インポート関連

- [§1 インポートパスのルール](./import-paths.md)

### ドキュメント関連

- [§7 テスト戦略書との一貫性](./test-strategy-consistency.md)
- [§8 JSDocルール](./jsdoc-rule.md)

## 関連ドキュメント

### ソースコード実装ルール

非同期処理中のState排他制御（try/finally パターン）については、以下を参照：

- [状態ガード/ロックの実装ルール](../../src/frameworks-and-drivers/ui/react-hooks/state-guard.md)
