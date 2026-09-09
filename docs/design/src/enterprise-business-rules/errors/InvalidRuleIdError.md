---
codd:
  node_id: "design:design-src-enterprise-business-rules-errors-invalidruleiderror"
  type: design
---

# InvalidRuleIdError 設計書

## 目的

`createRuleId` が `unknown` 入力のバリデーションに失敗したことを表す専用エラー。
素の `Error` ではなくサブクラスを用いることで、`ImportRulesJsonErrorOutputData.fromError` の
strategies Map（キーが `Function` 型のコンストラクタ参照）で `errorType: 'validation'` に
正しく分類させる。

## 責務

- `Error` を継承し `name = 'InvalidRuleIdError'` を設定する
- メッセージ文字列は `createRuleId` の既存仕様（`Invalid RuleId: <raw>`）を保持する
  - 理由: 既存ユニットテスト（`tests/unit/enterprise-business-rules/value-objects/ids/RuleId/createRuleId/**`）は
    `.toThrow('Invalid RuleId: ...')` でメッセージ文字列を検証しており、サブクラス化してもメッセージを
    変えなければ互換（`toThrow(string)` は `Error` サブクラスでも一致する）
- `raw` の表示は `String(raw)` を用い、`null` / `undefined` / 非文字列型を安全に可読化する

## エラー条件

`createRuleId(raw)` が以下のいずれかを満たしたときに本エラーが throw される:

| 条件 | 例 |
|------|-----|
| `typeof raw !== 'number'` | 文字列 `'1'`、`null`、`undefined`、object |
| `!Number.isInteger(raw)` | `1.5`、`NaN`、`Infinity` |
| `raw < 0` | `-1`、`-100` |

## `ImportRulesJsonErrorOutputData` との連携

`src/application-business-rules/dto/output/ImportRulesJsonErrorOutputData.ts` の
`strategies` Map に `[InvalidRuleIdError, validationPassthrough]` として登録されている。
これにより JSON インポートフロー内で `createRuleId` が投げた本エラーは
`errorType: 'validation'` + 元メッセージ（例: `Invalid RuleId: -1`）として
プレゼンテーション層に届く。登録されていないと `fromError` のフォールバック分岐で
`StorageImportError` にラップされ `errorType: 'storage'` に誤分類される（PR#394 レビュー指摘の defect）。

## テスト

本エラークラスは単純な `Error` サブクラスであり、専用のユニットテストは持たない。
以下の既存テストが本エラーの振る舞いを十分に網羅する:

| 検証観点 | 検証テスト |
|----------|-----------|
| `createRuleId` が本エラーを throw する | `tests/unit/enterprise-business-rules/value-objects/ids/RuleId/createRuleId/Abend/*.test.ts` |
| `createRuleId` の throw メッセージ仕様維持 | `tests/unit/enterprise-business-rules/value-objects/ids/RuleId/createRuleId/Abend/negative-validation.test.ts` ほか |
| `fromError` による `validation` 分類 | `tests/unit/application-business-rules/dto/output/ImportRulesJsonErrorOutputData/fromError/normal-cases.test.ts` |

## 関連ドキュメント

- 実装: `src/enterprise-business-rules/errors/InvalidRuleIdError.ts`
- 呼出し元: `src/enterprise-business-rules/value-objects/ids/RuleId.ts`
- 分類先: `src/application-business-rules/dto/output/ImportRulesJsonErrorOutputData.ts`
- `createRuleId` テスト戦略: `docs/design/src/enterprise-business-rules/value-objects/ids/RuleId/createRuleId.md`
- 上位規約: `docs-rules/design/05-test-strategy.md`
