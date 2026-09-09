---
codd:
  node_id: "req:functional-requirements"
  type: requirement
  depends_on:
    - id: "req:business-requirements"
      relation: derives_from
      semantic: governance
---

# 機能要件定義書

## 機能一覧
- DOM要素選択機能
  - ブラウザに表示されているキーワードをマウスクリックで選択→選択範囲を含む最小のDOM要素を特定し、置換ルール作成フォームに反映
- DOM要素置換機能
  - メモエディタの置換機能の感覚でDOM書き換えできることを目指す
  - `置換前`、`置換後` フォームに入力された内容に基づき、選択されたDOM要素のテキスト内容や属性値を動的に書き換える
  - 置換ルールを適用するURLを前方一致で指定
  - 正規表現による動的な置換を可能にし、商品番号からのリンク作成等をサポートする
- ルール管理機能
  - 作成したDOM書き換えルールを一覧表示、編集、削除できる
  - ルールの有効/無効切り替えをサポート

## 開発機能一覧
- Clean Architectureに基づく設計・実装
- テストコードを用いた、TDD開発