---
codd:
  node_id: "governance:coding-standards-tests-common-rule-mock-init-reset"
  type: governance
---

# 6. モック初期化・リセットの明示的呼び出し

## 規約

- `beforeEach` の先頭で `vi.clearAllMocks()` を呼び出すこと
- `afterEach` の末尾で `vi.resetAllMocks()` を呼び出すこと
- テストヘルパークラスの `setup()` / `cleanup()` 内に `vi.clearAllMocks()` / `vi.resetAllMocks()` を隠蔽しないこと

## 禁止事項

- テストヘルパーの `setup()` / `cleanup()` 内に `vi.clearAllMocks()` / `vi.resetAllMocks()` を配置すること: テストファイルを読んだだけではモック状態の初期化が行われているか判断できない

## 許可事項

- テストファイルの `beforeEach` / `afterEach` でモックリセットを明示的に呼び出し、テストヘルパーの `setup()` / `cleanup()` は DOM セットアップ・クリーンアップのみを担当すること

## 根拠

テストヘルパーの責務は DOM のセットアップ・クリーンアップであり、Vitest のモック状態管理はテストファイル側の責務である。モックリセットをヘルパー内部に隠蔽すると、テストファイルを読んだだけではモック状態の初期化が行われているか判断できず、レビュー時に見落としの原因となる。

## 適用シナリオ

- カスタムフックのテストで `UseDeleteRuleTestHelper` を使用する場合: `helper.setup()` は DOM 要素の作成のみを行い、`vi.clearAllMocks()` はテストファイルの `beforeEach` で明示的に呼び出す

## eslint-rule

ESLint化不可（`beforeEach` / `afterEach` 内の呼び出し有無を文脈判断する必要があるため。PRレビューで確認）
