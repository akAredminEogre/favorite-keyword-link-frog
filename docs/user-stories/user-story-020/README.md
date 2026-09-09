---
codd:
  node_id: "req:user-stories-user-story-020-readme"
  type: requirement
---

# User Story 020: ImportRulesJson ID保持リストア（createWithId 実装）

## ストーリー

> ルールJSONインポート時に、JSONに含まれるルールIDを保持してインポートできる（リストアユースケース対応）

## 概要

`ImportRulesJsonInteractor.confirmImport()` は現在、`IRewriteRuleRepository.create()` を使用してルールを新規作成するため、Dexie の自動採番により JSON に含まれる元の ID が失われる。

設計ドキュメント（[00-overview.md](../../design/pages/rule-list/features/import-rules-json/00-overview.md)）には「ID が存在する場合はそのIDを使用する（リストアユースケース）」という要件が記載されているが、現在の `IRewriteRuleRepository` インターフェースには `createWithId()` 相当のメソッドがなく、本 PR では実装を見送った。

本ユーザーストーリーでは、リポジトリインターフェースへの `createWithId()` メソッド追加と、Interactor での ID 保持インポートを実装する。

## 背景

PR#394 レビュー（GitHub Copilot コメント id:2856697486）で指摘済み。
`DexieRewriteRuleRepository.create()` が Dexie の `add()` を使用しており、`RewriteRule` の ID が無視されてDB側で自動採番されるため、JSON の元 ID が保持されない。

実装するには `IRewriteRuleRepository` インターフェース変更が必要で変更範囲が広いことを理由に見送り、今後のフェーズで対応予定とした。

**該当ファイル**:
- `host-frontend-root/frontend-src-root/src/application-business-rules/ports/gateway/IRewriteRuleRepository.ts`
- `host-frontend-root/frontend-src-root/src/frameworks-and-drivers/persistence/DexieRewriteRuleRepository.ts`
- `host-frontend-root/frontend-src-root/src/application-business-rules/interactors/ImportRulesJsonInteractor.ts`

## 現状

### 現在の実装（ID無視）

```typescript
// IRewriteRuleRepository.ts
interface IRewriteRuleRepository {
  create(rule: RewriteRule): Promise<void>;  // IDを無視してDB自動採番
  // createWithId() 相当のメソッドなし
}

// DexieRewriteRuleRepository.ts
async create(rule: RewriteRule): Promise<void> {
  await db.rewriteRules.add({ ...rule });  // Dexie が id を無視して自動採番
}

// ImportRulesJsonInteractor.ts
for (const rule of rulesToImport) {
  await this.repository.create(rule);  // 元の ID が失われる
}
```

### 課題

| 課題 | 詳細 |
|------|------|
| リストア不完全 | JSON に含まれる元の ID がインポート後に失われ、完全なリストアができない |
| インターフェース未対応 | `IRewriteRuleRepository` に `createWithId()` 相当のメソッドがない |
| 設計ドキュメントとの乖離 | 設計では「ID が存在する場合はそのIDを使用する」要件が明記済み |

## 開発戦略

### Phase 1: リポジトリインターフェース拡張

- [ ] `IRewriteRuleRepository` に `createWithId(rule: RewriteRule): Promise<void>` を追加
  - 既存の `create()` との差異を明確にするため JSDoc コメントを付与

### Phase 2: DexieRewriteRuleRepository 実装

- [ ] `DexieRewriteRuleRepository.createWithId()` を Dexie `put()` または `add()` で実装
  - `db.rewriteRules.put(rule)` を使い、元の ID を維持してレコードを保存
  - ID 衝突時の挙動（上書き vs エラー）を設計ドキュメントに明記

### Phase 3: ImportRulesJsonInteractor 更新

- [ ] `confirmImport()` で `createWithId()` を使用し、元の ID を保持してインポート
- [ ] JSON に ID が存在しない場合のフォールバック処理を実装

### Phase 4: テスト整備

- [ ] `DexieRewriteRuleRepository.createWithId` のユニットテスト
- [ ] `ImportRulesJsonInteractor.confirmImport()` のユニットテスト（ID保持版）
- [ ] E2E テスト: インポート後のルール ID が JSON の元 ID と一致すること

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
