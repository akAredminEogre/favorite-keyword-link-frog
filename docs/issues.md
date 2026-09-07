---
codd:
  node_id: "doc:issues"
  type: document
---

# 0.1.2
- [ ] Chrome Web Storeへの実際の登録作業
- [ ] ビルド・パッケージング手順の確認

# 0.1.3
- [ ] コーディング規約ドキュメントまとめ
- [ ] 採番バッチ化
- [ ] e2eテストのflaky解消

# 0.2.0
- [ ] GetElementSelectionUseCaseのシーケンスのリファクタリング
- [ ] ルールの有効/無効切り替え機能

# 0.3.0
- [ ] 書き換えルールの削除機能

# 0.4.0
- [ ] 正規表現の適用範囲拡大

## phase02
- [ ] chrome apiのディレクトリ整理
- [ ] { type: 'getElementSelection' }をクラス化
- [ ] edit/app.tsxのloadingをatomsに移動
- [ ] edit/app.tsxのuseEffectの整理
- [ ] e2eテストのエラー修正を部品化
- [ ] RewriteRuleのfromParamsファクトリメソッドの導入
- [ ] モックの切り出し
- [ ] フロントエンドコンポーネントのフロントエンドテスト
- [ ] urlPatternの空文字、null、undefinedのバリデーション
- [ ] urlPatternの値オブジェクト化
- [ ] 編集ページはポップアップとしても使えるようにする
- [ ] UseCaseレベルでのテスト作成
- [ ] HandleContextMenuReplaceDomElemenのテストコード
- [ ] registerTabsOnUpdatedの'complete'ハードコード解消
- [ ] 不正な正規表現入力のエラーハンドリング
- [ ] rewriteRules.toArray().forEachの書き方をファーストクラスコレクションに移管
- [ ] HtmlReplacerのメンバ変数化
- [ ] application層からinfrastructureの実装をしているのを解消
- [ ] issue-012: 右クリック入力のe2eテスト
- [ ] ElementSelectorの返り値をValueObjectに変更
- [ ] no-consoleも無視しない
- [ ] SelectionServiceのテストケース追加
  - [ ] hasValidSelectionのテストと、ElementSelector.test.tsの重複削除
- [ ] mockSelectionServiceが変更可能なのは大丈夫か確認
- [ ] 選択されたテキストが複数のHTML要素にまたがる場合の処理方針について
- [ ] 右クリック入力のロジック分離
- [ ] ElementSelectorの詳細テスト追加
- [ ] ElementSelector.test.tsのテストケース分割
- [ ] isInvalidAncestor、getStartElementの切り出し
- [ ] isMultiElementSelection、findOptimalElementのif文整理