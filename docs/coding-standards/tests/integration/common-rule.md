---
codd:
  node_id: "governance:coding-standards-tests-integration-common-rule"
  type: governance
---

# 結合テスト共通ルール

結合テストを作成する際の共通ルールをまとめたドキュメント。

**参照**: インポートパスのルールは [import-paths.md](../common-rule/import-paths.md) を参照。

## 適用シナリオ

1. **IndexedDBを使用するリポジトリの結合テストを作成する場合**: fake-indexeddbのautoインポートのみでセットアップし、globalオブジェクトへの手動代入は行わない。autoインポートと手動セットアップを併用すると予期しない挙動になる
2. **複数の結合テストファイルで共通のモックを使う場合**: beforeEachでモッククリアを行い、afterEachでのモック操作は行わない（単体テストとは異なる規約）。セットアップ順序はモッククリア → DBクリア → 依存オブジェクト初期化 → コールバック初期化の順で統一する

> **注意**: 単体テストでは afterEach でのリセット操作が必要（[basic-rule.md](../unit/common-rule/basic-rule.md) 参照）。結合テストでは不要。

---

## 1. fake-indexeddb のセットアップ

### 規約

- `fake-indexeddb/auto` のインポートのみで自動セットアップされる
- 手動での `globalThis.indexedDB` 代入は不要
- `auto` インポートと手動セットアップの併用は禁止

### 禁止事項

- `fake-indexeddb/auto` インポート後に `globalThis.indexedDB = new IDBFactory()` を実行すること

### 許可事項

- `import 'fake-indexeddb/auto';` のみでのセットアップ
- 特別な理由がある場合のみ、`auto` なしで手動セットアップ

## eslint-rule

ESLint化不可（ライブラリ固有の使用パターンのため、PRレビューで確認）

---

## 2. Vitestモック管理

### 規約

- `beforeEach` で `vi.clearAllMocks()` を使用する
- `afterEach` でのモッククリア/リセットは原則不要

### clearAllMocks vs resetAllMocks の違い

| メソッド            | 呼び出し履歴 | 実装(mockImplementation) |
| ------------------- | ------------ | ------------------------ |
| `clearAllMocks()`   | クリア       | 維持                     |
| `resetAllMocks()`   | クリア       | リセット                 |
| `restoreAllMocks()` | クリア       | 元の実装に復元           |

### 禁止事項

- `beforeEach` と `afterEach` の両方でモック操作を行うこと

### 許可事項

- `beforeEach` での `vi.clearAllMocks()` 使用
- 外部リソースクリーンアップのための `afterEach` 使用（モック操作以外）

## eslint-rule

ESLint化不可（テストパターンの意図判断が必要なため、PRレビューで確認）

---

## 3. テストセットアップの順序

### 規約

`beforeEach` 内での処理順序:

1. モックのクリア（`vi.clearAllMocks()`）
2. DBのクリア
3. 依存オブジェクトの初期化
4. コールバック関数の初期化

## eslint-rule

ESLint化不可（処理順序の強制は静的解析の範囲外、PRレビューで確認）
