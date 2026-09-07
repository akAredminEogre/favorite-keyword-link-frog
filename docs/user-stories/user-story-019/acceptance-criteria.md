---
codd:
  node_id: "test:user-stories-user-story-019-acceptance-criteria"
  type: test
---

# 受け入れ条件

## ユーザーストーリー要件（Phase 1: E2E正常1シナリオ）

- [x] AC-1: ルール一覧画面にインポートボタンが表示される
- [x] AC-2: インポートボタンをクリックするとファイル選択ダイアログが開く
- [x] AC-3: JSONファイルを選択すると、プレビュー／確認ダイアログを挟まず直接一括置換（全件 replaceAll）を実行する（1フェーズ方式）
- [x] AC-4: インポート成功時に「N件のルールをインポートしました」の成功トーストが表示される
- [x] AC-5: インポート後、ルール一覧がインポートしたルールで更新される
- [x] AC-6: E2Eテスト（正常系1シナリオ）が通過する

## 技術要件

- [x] AC-7: Clean Architecture（ADR-001）に準拠した層構造で実装されている
- [x] AC-8: DIコンテナ（awilix）に ImportRulesJsonControllerFactory が登録されている
- [x] AC-9: ADR-005（ControllerFactoryパターン）に準拠している
- [x] AC-10: ファイルサイズ上限（5MB）を超えるファイルを選択した場合、エラーが表示される

## 子タスク（別PR対応）

以下は本ユーザーストーリーの受け入れ条件には含めず、別ユーザーストーリーで管理する:

| ユーザーストーリー | 内容 | 受け入れ条件 |
|-----------------|------|-------------|
| [US-016](../user-story-016/acceptance-criteria.md) | ModalDialogBase移行 | acceptance-criteria.md 参照 |
| [US-017](../user-story-017/acceptance-criteria.md) | I/Oバッチ最適化 | acceptance-criteria.md 参照 |
| [US-018](../user-story-018/acceptance-criteria.md) | InputData注入パターン統一 | acceptance-criteria.md 参照 |
