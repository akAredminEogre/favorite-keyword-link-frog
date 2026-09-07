---
codd:
  node_id: "governance:coding-standards-tests-common-rule-test-data-type-annotations"
  type: governance
---

# 3. テストデータの型注釈ルール

## 規約

- テストケース配列には明示的な型注釈を付けること
- 型注釈により、プロパティ名のタイポや型の不一致をコンパイル時に検出できる

## 禁止事項

- 型推論に頼ったテストデータ配列の定義

## 許可事項

- `Array<T>` または `T[]` 形式での型注釈
- 型エイリアス（`type` または `interface`）を定義しての型注釈

## eslint-rule

ESLint化不可（`@typescript-eslint/typedef`はすべての変数宣言に型注釈を要求するため過剰。テストデータ配列のみを対象とするルールは存在しない。PRレビューで確認）
