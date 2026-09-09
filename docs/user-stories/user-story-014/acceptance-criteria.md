---
codd:
  node_id: "test:user-stories-user-story-014-acceptance-criteria"
  type: test
---

# User Story 014: 受け入れ条件

## 機能要件

- [ ] ルール更新機能が正常に動作する（リファクタリング前と同等の振る舞い）
- [ ] ルール更新後、該当タブが自動的にリロードされる
- [ ] タブリロード失敗時もルール保存は成功する

## アーキテクチャ要件

- [ ] ADR-001で定義されたClean Architecture Presenter付きパターンに準拠している
  - Interactor は `src/application-business-rules/interactors/` に配置
  - Input Port は `src/application-business-rules/ports/input/` に配置
  - Output Port は `src/application-business-rules/ports/output/` に配置
  - DTO は `src/application-business-rules/dto/` に配置
  - Controller は `src/interface-adapters/controllers/` に配置
  - Presenter は `src/interface-adapters/presenters/` に配置

- [ ] エラーハンドリングが Presenter 経由で行われる
  - Interactor は try-catch でエラーを捕捉し、Presenter.presentError() を呼び出す
  - View（呼び出し元）は直接エラーハンドリングを行わない

- [ ] 依存性逆転の原則が守られている
  - Interactor は Output Port（インターフェース）に依存
  - Presenter は Output Port を実装
  - Controller は Input Port（インターフェース）経由で Interactor を呼び出す

## テスト要件

- [ ] 単体テストが存在し、すべてパスする
  - UpdateRewriteRuleInteractor
  - UpdateRewriteRuleController
  - UpdateRewriteRulePresenter

- [ ] テスト戦略書が新しい配置に移動されている
  - 現在: `docs/design/src/application/usecases/rule/UpdateRewriteRuleUseCase/execute.md`
  - 移行先: `docs/design/src/application-business-rules/interactors/UpdateRewriteRuleInteractor/execute.md`

- [ ] 結合テストが存在し、パスする

## コード品質要件

- [ ] `make testlint` がパスする
- [ ] 旧 `UpdateRewriteRuleUseCase` が削除されている
- [ ] 未使用のインポートや変数がない
