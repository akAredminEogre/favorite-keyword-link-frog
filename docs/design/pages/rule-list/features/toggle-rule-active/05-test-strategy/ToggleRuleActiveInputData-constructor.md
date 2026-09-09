---
codd:
  node_id: "design:design-pages-rule-list-features-toggle-rule-active-05-test-strategy-toggleruleactiveinputdata-constructor"
  type: design
---

# ToggleRuleActiveInputData.constructor() テスト戦略

## 目的

ルール有効/無効切り替えの入力データ（ruleId）を保持するDTOを生成する。

## テスト分類

### 1. 正常系（インスタンス生成）

様々なruleIdでインスタンスを生成できることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 小さい値 | ruleId=1 | 基本パターン |
| 中間の値 | ruleId=100 | 一般的なケース |
| 大きい値 | ruleId=999999 | 境界条件（大きな値） |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] 様々なruleId値でインスタンス生成（3パターン）
- [x] ruleIdが正しく保持されること
- [ ] 読み取り専用性 → TypeScriptの型システムで保証（ランタイムテスト不要）
- [ ] 異常系 → 不要（InteractorがruleIdの存在を検証、DTOは値を保持するのみ）
- [ ] 型チェック（数字文字列等） → 不要（下記参照）
- [ ] 値の範囲チェック（負の数等） → 不要（下記参照）

### 型チェックが不要な理由

数字文字列（例: `"123"`）などの不正な型の入力テストは以下の理由で不要:

1. **TypeScriptの型システム**: `ruleId: number` と定義されており、コンパイル時に型エラーとなる
2. **責務の分離**: DTOはデータ転送のみを担当し、型バリデーションの責務を持たない
3. **バリデーション層**: 入力検証はController層またはInteractor層で行う

### 値の範囲チェックが不要な理由

負の数（例: `-1`）などの不正な値の入力テストは以下の理由で不要:

1. **責務の分離**: DTOはデータ転送のみを担当し、値の妥当性検証の責務を持たない
2. **バリデーション層**: ruleIdの存在確認・有効性検証はInteractor層で行う
3. **実際の検証**: Interactorが`repository.getById(ruleId)`を呼び出し、存在しないIDはエラーとなる

## テストファイル構成

```text
tests/unit/application-business-rules/dto/input/ToggleRuleActiveInputData/constructor/
└── normal-cases.test.ts       # インスタンス生成（3ケース、配列ベース）
```
