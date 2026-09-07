---
codd:
  node_id: "test:user-stories-user-story-020-acceptance-criteria"
  type: test
---

# 受け入れ条件

## ユーザーストーリー要件

- [ ] AC-1: `IRewriteRuleRepository` に `createWithId()` メソッドが追加されている
- [ ] AC-2: `DexieRewriteRuleRepository.createWithId()` が元の ID を保持してルールを保存する
- [ ] AC-3: JSON にID が含まれるルールをインポートした後、ルール一覧の ID が JSON の元 ID と一致する
- [ ] AC-4: JSON に ID が含まれないルールをインポートした場合、DB の自動採番 ID が使用される（フォールバック）

## 技術要件

- [ ] AC-5: `IRewriteRuleRepository` インターフェースへの `createWithId()` 追加が ADR-001（Clean Architecture）に準拠している
- [ ] AC-6: `DexieRewriteRuleRepository.createWithId()` のユニットテストが通過する
- [ ] AC-7: `ImportRulesJsonInteractor.confirmImport()` のユニットテスト（ID保持版）が通過する
- [ ] AC-8: 既存の E2E テスト（正常系インポートフロー）がすべて通過する
- [ ] AC-9: E2E テスト: インポート後のルール ID が JSON の元 ID と一致することを確認する
