---
codd:
  node_id: "design:design-src-interface-adapters-presenters-deleterulepresenter-present"
  type: design
---

# DeleteRulePresenter.present() テスト戦略

## 目的

OutputDataを受け取り、コールバック関数を呼び出してViewに削除成功を通知する。
PresenterはOutputDataをViewに橋渡しする責務のみを持ち、データ変換ロジックは含まない。

## テスト分類

### 1. 正常系（コールバック呼び出しと引数検証）

コールバック関数が正しく呼び出され、deletedRuleIdが正しく渡されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 任意のruleId | deletedRuleIdでremoveRuleFromViewコールバックが呼び出される | 削除成功通知の基本パターン |

**対応テスト**: `normal-cases.test.ts`

### 2. コールバック呼び出しの分離

removeRuleFromViewのみが呼び出され、showErrorInViewは呼び出されないことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| コールバック分離 | showErrorInViewが呼び出されない | 成功通知とエラー通知の責務分離 |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

## 網羅性チェック

- [x] removeRuleFromViewコールバックが呼び出されること
- [x] コールバックにdeletedRuleIdが正しく渡されること
- [x] showErrorInViewが呼び出されないこと
- [ ] 異常系（コールバックが例外をスロー） → 不要（Presenterはエラーをキャッチせず呼び出し元に伝播）
- [ ] OutputDataのバリデーション → 不要（責務外、OutputDataはInteractor層で生成）

### 異常系テストが不要な理由

PresenterはOutputDataを受け取りViewに通知するのみで、エラーハンドリングの責務を持たない：

1. **責務の分離**: PresenterはOutputDataの橋渡しのみ、エラー処理はView層
2. **エラー伝播**: コールバックからのエラーは呼び出し元（Interactor経由）に伝播
3. **データ検証**: OutputDataの正当性はInteractor層で保証済み

## テストファイル構成

```text
tests/unit/interface-adapters/presenters/DeleteRulePresenter/present/
└── normal-cases.test.ts       # コールバック呼び出し確認（配列ベース）
```

## モック戦略

コンストラクタに渡すコールバック関数をvi.fn()でモック化してテストする。

### モック対象

| 依存関係 | モック方法 | 理由 |
|---------|-----------|------|
| removeRuleFromView | vi.fn() | 呼び出しと引数の検証 |
| showErrorInView | vi.fn() | 呼び出されないことの確認 |

### テストデータ

DeleteRuleOutputDataは実インスタンスを使用。
