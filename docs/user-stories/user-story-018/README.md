---
codd:
  node_id: "req:user-stories-user-story-018-readme"
  type: requirement
---

# User Story 018: UseCase/Controller InputData 注入パターン統一（ImportRulesJsonInputData 活用）

> ⚠️ **I/F 名整合注記（CodeRabbit PR#405 指摘対応）**
> 本文中の `previewImport()` / `execute()` は旧設計のメソッド名であり、**確定実装の I/F とは異なる**。現行 `IImportRulesJsonUseCase` の唯一のメソッドは **`importRulesJson(inputData: ImportRulesJsonInputData)`**（`previewImport` / `confirmImport` は存在しない・プレビューなし1フェーズ設計）。`ImportRulesJsonController` は Factory 内無名オブジェクトで、現状 `importRulesJson(file: File)` を持ち内部で InputData を生成する。
> 本ストーリーの目的（Controller も `ImportRulesJsonInputData` を直接受け取る形に統一）は将来課題として有効だが、対象メソッド名は上記の現行 I/F（`importRulesJson`）を正として読み替えること。

## ストーリー

> UseCase および Controller が InputData DTO を通じて入力を受け取るパターンに統一することで、コードベースの一貫性を高め、テスト容易性を向上させたい

## 概要

`ImportRulesJsonInteractor`（UseCase）は `importRulesJson(inputData: ImportRulesJsonInputData)` で InputData を受け取る実装に更新済み。
一方 `ImportRulesJsonController` は `importRulesJson(file: File)` で File を直接受け取り、内部で `ImportRulesJsonInputData` を生成して UseCase に渡す設計となっている。

本ユーザーストーリーでは、Controller も `ImportRulesJsonInputData` を直接受け取るパターンに統一し、コードベースの一貫性を向上させることを将来的な目標とする。

## 背景

PR#394 レビュー（GitHub Copilot によるコメント、akAredminEogre 返信 id:2849726185）で指摘済み。
`ImportRulesJsonInputData` は将来のリファクタリングに備えて意図的に保持されているが、本 PR では UseCase/Controller の設計変更が必要なため見送り、本ユーザーストーリーとして明示した。

**該当ファイル**:
- `host-frontend-root/frontend-src-root/src/application-business-rules/dto/input/ImportRulesJsonInputData.ts`
- `host-frontend-root/frontend-src-root/src/application-business-rules/interactors/ImportRulesJsonInteractor.ts`
- `host-frontend-root/frontend-src-root/src/application-business-rules/ports/input/IImportRulesJsonUseCase.ts`
- `host-frontend-root/frontend-src-root/src/interface-adapters/controllers/ImportRulesJsonController.ts`

## 現状

### 現在の設計（Controller が File を受け取り、内部で InputData 生成）

```typescript
// IImportRulesJsonUseCase.ts — InputData 経由に更新済み
interface IImportRulesJsonUseCase {
  importRulesJson(inputData: ImportRulesJsonInputData): Promise<void>;
  confirmImport(): Promise<void>;
}

// ImportRulesJsonController.ts — Controller は File を直接受け取る
async importRulesJson(file: File): Promise<void> {
  await this.useCase.importRulesJson(new ImportRulesJsonInputData(file));
}
```

### 目標設計（Controller も InputData DTO 経由に統一）

```typescript
// ImportRulesJsonController.ts
async importRulesJson(inputData: ImportRulesJsonInputData): Promise<void> {
  await this.useCase.importRulesJson(inputData);
}
```

### 課題

| 課題 | 詳細 |
|------|------|
| 一貫性欠如 | UseCase は InputData DTO を受け取っているが、Controller は `File` を直接受け取っており、他の Controller との一貫性がない |
| テスト容易性 | Controller も InputData DTO を受け取ることで、テスト時に入力値の構造が明確になり、将来の拡張も容易になる |
| Controller 層での InputData 未活用 | UseCase は InputData を受け取っているが、Controller はまだ `File` を直接受け取っている |

## 開発戦略

### Phase 1: UseCase インターフェース変更

- [ ] `IImportRulesJsonUseCase.previewImport()` の引数を `ImportRulesJsonInputData` に変更
- [ ] `ImportRulesJsonInteractor.previewImport()` の実装を更新

### Phase 2: Controller 変更

- [ ] `IImportRulesJsonController.execute()` の引数を `ImportRulesJsonInputData` に変更
- [ ] `ImportRulesJsonController.execute()` の実装を更新
- [ ] `ImportRulesJsonControllerFactory` の更新（必要に応じて）

### Phase 3: UI 層の更新

- [ ] `useImportRulesJson.ts` など UI 層で InputData を生成してから Controller に渡すよう更新

### Phase 4: テスト整備

- [ ] 影響を受ける全クラスのユニットテスト更新
- [ ] E2E テスト通過確認

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
