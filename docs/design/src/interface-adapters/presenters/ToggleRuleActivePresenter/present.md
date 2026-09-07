---
codd:
  node_id: "design:design-src-interface-adapters-presenters-toggleruleactivepresenter-present"
  type: design
---

# ToggleRuleActivePresenter.present() テスト戦略

## 目的

OutputDataを受け取り、コールバック関数を呼び出してViewにトグル後のルール情報を通知する。
PresenterはOutputDataをViewに橋渡しする責務のみを持ち、データ変換ロジックは含まない。

## テスト分類

### 1. 正常系（コールバック呼び出しと引数検証）

コールバック関数が正しく呼び出され、toggledRuleが正しく渡されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| isActive=true | isActive=trueのルールでコールバック呼び出し＋引数検証 | 有効状態のルール通知 |
| isActive=false | isActive=falseのルールでコールバック呼び出し＋引数検証 | 無効状態のルール通知 |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] コールバック関数が呼び出されること
- [x] コールバックにtoggledRuleが正しく渡されること
- [x] isActive=true/falseの両パターン
- [ ] 異常系（コールバックが例外をスロー） → 不要（Presenterはエラーをキャッチせず呼び出し元に伝播）
- [ ] OutputDataのバリデーション → 不要（責務外、OutputDataはInteractor層で生成）

### 異常系テストが不要な理由

PresenterはOutputDataを受け取りViewに通知するのみで、エラーハンドリングの責務を持たない：

1. **責務の分離**: PresenterはOutputDataの橋渡しのみ、エラー処理はView層
2. **エラー伝播**: コールバックからのエラーは呼び出し元（Interactor経由）に伝播
3. **データ検証**: OutputDataの正当性はInteractor層で保証済み

## テストファイル構成

```text
tests/unit/interface-adapters/presenters/ToggleRuleActivePresenter/present/
└── normal-cases.test.ts       # コールバック呼び出し確認（配列ベース）
```
