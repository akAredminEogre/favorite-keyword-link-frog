---
codd:
  node_id: "design:design-src-application-business-rules-dto-output-deleteruleoutputdata-constructor"
  type: design
---

# DeleteRuleOutputData.constructor() テスト戦略

## 目的

ルール削除成功時の出力データを生成する。
削除されたルールIDを受け取り、プロパティとして保持する。

## テスト分類

### 1. 正常系（プロパティ設定）

コンストラクタで渡された値が正しくプロパティに設定されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 正のID | 正の整数IDでインスタンスを作成できる | 標準的なルールID |
| 複数桁ID | 複数桁のIDでインスタンスを作成できる | 大きなID値の処理 |

**対応テスト**: `normal-cases.test.ts`

### 2. 読み取り専用性

deletedRuleIdがreadonlyとして保持されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| readonly | deletedRuleIdが変更不可である | イミュータブル性の保証 |

**対応テスト**: TypeScriptの型システムで保証（テスト不要）

## 網羅性チェック

- [x] 正の整数IDでのインスタンス作成
- [x] 複数桁IDでのインスタンス作成
- [x] deletedRuleIdの保持確認
- [ ] 異常系（負のID、0） → 不要（バリデーションはUseCase層の責務）
- [ ] readonly性 → TypeScriptの型システムで保証

## テストファイル構成

```text
tests/unit/application-business-rules/dto/output/DeleteRuleOutputData/constructor/
└── normal-cases.test.ts       # プロパティ設定確認（配列ベース、2ケース）
```

## モック戦略

モックは使用しない。DTOは純粋なデータ構造であり、外部依存がない。

### テストデータ

- 正のID: `1`
- 複数桁ID: `12345`
