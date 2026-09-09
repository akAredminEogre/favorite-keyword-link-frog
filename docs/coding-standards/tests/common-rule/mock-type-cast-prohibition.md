---
codd:
  node_id: "governance:coding-standards-tests-common-rule-mock-type-cast-prohibition"
  type: governance
---

# 4. モック型キャストの禁止

## 規約

- 関数をモック型（`ReturnType<typeof vi.fn>` 等）に `as` でキャストしてはならない
- モック固有のメソッド（`.mockReturnValue()`, `.toHaveBeenCalled()` 等）にアクセスする場合は、用途に応じて以下を使用すること:
  - `vi.mock` で既にモック化された関数 → `vi.mocked()` で型安全にアクセス
  - 通常の関数にモック機能を付与したい場合 → `vi.fn()` でラップ

## 禁止事項

- 関数を `as ReturnType<typeof vi.fn>` でキャストすること: `as` キャストは TypeScript の型チェックを無効化するだけで、ランタイムの実体を変えない

## 許可事項

- `vi.mocked(someModule.method)` で `vi.mock` 済み関数のモック型にアクセスすること
- `vi.fn(someFunction)` でラップして元の関数の動作を維持しつつモック機能を付与すること

## 根拠

`as` キャストは TypeScript の型チェックを無効化するだけで、ランタイムの実体は変わらない。`vi.mocked()` は Vitest が提供する型安全なユーティリティであり、`vi.mock` で既にモック化された関数に対して正しい型を返す。テストヘルパーやテストファイルの `beforeEach` など複数箇所で使われるため、型の不整合の影響範囲が広い。

## 適用シナリオ

- テストヘルパーのコンストラクタで `onDeleteSuccess` コールバックを受け取り、モックアサーションで呼び出し回数を検証したい場合: `vi.fn(onDeleteSuccess)` でラップして保持する
- `vi.mock` でモジュール全体をモック化し、`beforeEach` でモック関数の戻り値を設定したい場合: `vi.mocked(container.resolve).mockReturnValue(...)` で型安全にアクセスする

## eslint-rule

ESLint化不可（`as` キャストの用途を文脈判断する必要があるため。PRレビューで確認）
