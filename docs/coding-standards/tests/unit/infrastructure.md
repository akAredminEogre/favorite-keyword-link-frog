---
codd:
  node_id: "governance:coding-standards-tests-unit-infrastructure"
  type: governance
---

# infrastructure層固有の規約

## 適用シナリオ

1. **DIコンテナやIndexedDBリポジトリを新規作成・変更した場合**: di層とpersistence層のクラスはテスト必須のため、単体テストを作成・更新する。エラー系テストは必須ではないが、外部API呼び出し失敗などの重要なケースは推奨される
2. **Chrome APIラッパーやメッセージング層のクラスを作成した場合**: これらはフレームワーク固有のコードであり、テスト作成は任意。ドメインロジックを含む場合のみテストを検討する

## 1. Infrastructure層特有のパターン
- Infrastructure層は、下記のクラスのみテストコードを作成する。
  - di
  - persistence
上記のクラスは、クラスの作成、変更時にテストコードを作成、変更する。またエラー系のテストコードは必須としない
それ以外のクラスは、必須とせず、必要に応じて作成する。