---
codd:
  node_id: "design:design-src-interface-adapters-presenters-deleterulepresenter-presenterror"
  type: design
---

# DeleteRulePresenter.presentError() テスト戦略

## 目的

ErrorOutputDataを受け取り、フォーマット済みエラーメッセージを構築してshowErrorInViewコールバックに渡す。
ADR-001準拠: エラーメッセージのフォーマットはPresenter層の責務（Viewは表示のみ）。

## テスト分類

### 1. 正常系（コールバック呼び出しとメッセージフォーマット検証）

コールバック関数が正しく呼び出され、フォーマット済みエラーメッセージが渡されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Errorオブジェクト由来 | Errorオブジェクト由来のエラーでコールバックが呼び出され、フォーマット済みメッセージが渡される | 標準エラーの通知 |
| 文字列由来 | 文字列由来のエラーでコールバックが呼び出され、フォーマット済みメッセージが渡される | 非標準エラーの通知 |

**対応テスト**: `normal-cases.test.ts`

### 2. コールバック呼び出しの分離

showErrorInViewのみが呼び出され、removeRuleFromViewは呼び出されないことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| コールバック分離 | removeRuleFromViewが呼び出されない | エラー通知とルール削除の責務分離 |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

## 網羅性チェック

- [x] showErrorInViewコールバックが呼び出されること
- [x] コールバックにフォーマット済みメッセージが渡されること（`ルール {ruleId} の削除処理中にエラーが発生しました: {message}`）
- [x] removeRuleFromViewが呼び出されないこと
- [x] Errorオブジェクト/文字列の両パターン
- [ ] 異常系（コールバックが例外をスロー） → 不要（Presenterはエラーをキャッチせず呼び出し元に伝播）
- [ ] ErrorOutputDataのバリデーション → 不要（責務外、ErrorOutputDataはInteractor層で生成）

### 異常系テストが不要な理由

PresenterはErrorOutputDataを受け取りViewに通知するのみで、エラーハンドリングの責務を持たない：

1. **責務の分離**: PresenterはErrorOutputDataの橋渡しのみ、エラー処理はView層
2. **エラー伝播**: コールバックからのエラーは呼び出し元（Interactor経由）に伝播
3. **データ検証**: ErrorOutputDataの正当性はInteractor層で保証済み

## テストファイル構成

```text
tests/unit/interface-adapters/presenters/DeleteRulePresenter/presentError/
└── normal-cases.test.ts       # コールバック呼び出し確認（配列ベース）
```

## モック戦略

コンストラクタに渡すコールバック関数をvi.fn()でモック化してテストする。

### モック対象

| 依存関係 | モック方法 | 理由 |
|---------|-----------|------|
| removeRuleFromView | vi.fn() | 呼び出されないことの確認 |
| showErrorInView | vi.fn() | 呼び出しと引数の検証 |

### テストデータ

DeleteRuleErrorOutputDataは実インスタンスを使用（メッセージ抽出の動作確認のため）。
