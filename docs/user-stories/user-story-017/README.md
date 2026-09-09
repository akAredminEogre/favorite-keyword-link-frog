---
codd:
  node_id: "req:user-stories-user-story-017-readme"
  type: requirement
---

# User Story 017: ImportRulesJson I/O バッチ最適化（Dexie bulk 操作）

## ストーリー

> ルールJSONインポート時の削除・作成処理を `replaceAll()` を用いたアトミックな一括置換に切り替えることで、大量ルール（最大1000件）のインポートを高速化し、部分適用リスクを排除したい

## 概要

`ImportRulesJsonInteractor.confirmImport()` は `IRewriteRuleRepository.replaceAll()` を用いた原子的な一括置換を行う実装に更新済み。
`replaceAll()` は Dexie の `db.transaction()` 内で全削除と一括追加をアトミックに実行し、部分適用リスクを排除している。

本ユーザーストーリーでは、`IRewriteRuleRepository` インターフェースに `replaceAll(rules: RewriteRule[]): Promise<void>` を追加し、`DexieRewriteRuleRepository` でトランザクション保護付きの実装を行い、`ImportRulesJsonInteractor.confirmImport()` で逐次ループを廃止してバッチ置換に切り替えた。

## 背景

PR#394 レビュー（GitHub Copilot コメント id:2856697497）で指摘済み。
本 PR（feat/rule-json-import）にて `IRewriteRuleRepository.replaceAll()` を導入し、`ImportRulesJsonInteractor.confirmImport()` を一括置換方式に更新済み。

**該当ファイル**:
- `host-frontend-root/frontend-src-root/src/application-business-rules/interactors/ImportRulesJsonInteractor.ts`
- `host-frontend-root/frontend-src-root/src/application-business-rules/ports/gateway/IRewriteRuleRepository.ts`
- `host-frontend-root/frontend-src-root/src/frameworks-and-drivers/persistence/DexieRewriteRuleRepository.ts`

## 実装

### 実装済み（`replaceAll()` による一括置換）

```typescript
// confirmImport() 内 — feat/rule-json-import にて実装済み
await this.repository.replaceAll(rulesToImport.toArray());
// DexieRewriteRuleRepository.replaceAll() が db.transaction() 内でアトミックに実行
```

### 解決した課題

| 課題 | 対応 |
|------|------|
| パフォーマンス | `replaceAll()` で逐次 I/O を廃止し、トランザクション内で一括処理 |
| 部分適用リスク | `db.transaction()` によりロールバック保証、部分適用なし |
| インターフェース追加 | `IRewriteRuleRepository` に `replaceAll(rules: RewriteRule[]): Promise<void>` を追加済み |

## 開発戦略

### Phase 1: インターフェース拡張（feat/rule-json-import にて完了）

- [x] `IRewriteRuleRepository` に `replaceAll(rules: RewriteRule[]): Promise<void>` を追加

### Phase 2: DexieRewriteRuleRepository 実装（feat/rule-json-import にて完了）

- [x] `DexieRewriteRuleRepository.replaceAll()` を Dexie `db.transaction()` + 全削除 + `bulkAdd()` で実装
- [x] トランザクション内で削除・作成を一括実行（原子性保証）

### Phase 3: ImportRulesJsonInteractor 更新（feat/rule-json-import にて完了）

- [x] `confirmImport()` を `replaceAll()` に置き換え（逐次ループ廃止）
- [x] エラー時のロールバック挙動を確認

### Phase 4: テスト整備

- [ ] `DexieRewriteRuleRepository.replaceAll()` のユニットテスト
- [ ] `ImportRulesJsonInteractor.confirmImport()` のユニットテスト（`replaceAll()` 版）
- [ ] E2E テスト: 1000件規模のインポートが正常完了すること（パフォーマンステスト）

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
