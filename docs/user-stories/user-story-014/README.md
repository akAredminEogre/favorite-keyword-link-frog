---
codd:
  node_id: "req:user-stories-user-story-014-readme"
  type: requirement
---

# User Story 014: UpdateRewriteRuleUseCaseのADR-001適合リファクタリング

## ストーリー

> 開発者として、UpdateRewriteRuleUseCaseをADR-001（Clean Architecture Presenter付きパターン）に適合させることで、コードベースの一貫性を高め、テスト容易性を向上させたい

## 概要

現在の`UpdateRewriteRuleUseCase`はADR-001で定義されたClean Architecture Presenter付きパターンに準拠していない。本ユーザーストーリーでは、以下のリファクタリングを行う:

1. UseCase → Interactorへのリネームと配置変更
2. Input Port / Output Port の定義
3. Presenter パターンの導入
4. Controller の追加
5. DTO の定義

## 設計ドキュメント

- [ADR-001: Clean Architecture Presenter付きパターン採用](../../adr/001-clean-architecture-with-presenter-pattern.md)
- [テスト戦略書](../../design/src/application/usecases/rule/UpdateRewriteRuleUseCase/execute.md) - 現行のテスト戦略書（Phase 2で新しい場所に作成、Phase 4で旧ファイルを削除）
- 機能設計（`docs/design/pages/rule-list/features/update-rule/`） - ページ・機能レベルの設計ドキュメント（Phase 1で作成予定）

## 現状分析

### 現在の実装状態

| 項目 | 現在 | ADR-001準拠 |
| ------ | ------ | ------------- |
| クラス名 | `UpdateRewriteRuleUseCase` | `UpdateRewriteRuleInteractor` |
| 配置 | `src/application/usecases/rule/` | `src/application-business-rules/interactors/` |
| Input Port | なし | `IUpdateRewriteRuleUseCase` |
| Output Port | なし | `IUpdateRewriteRulePresenter` |
| Presenter | なし | `UpdateRewriteRulePresenter` |
| Controller | なし | `UpdateRewriteRuleController` |
| DTO | `RewriteRuleParams`（共用） | `UpdateRewriteRuleInputData` / `OutputData` |
| タブ操作 | `IChromeTabsService` | `ITabsGateway` |

### 差分分類

| ファイル | 現在位置 | 理論位置 | 修正 | 分類 |
| --------- | --------- | --------- | ------ | ------ |
| UpdateRewriteRuleUseCase.ts | src/application/usecases/rule/ | src/application-business-rules/interactors/ | 必須（Interactorにリネーム、Presenter導入） | C |
| IChromeTabsService.ts | src/application/ports/ | - | 不要（ITabsGatewayを使用） | B |

### 分類C: 移行必須ファイルの影響分析

#### UpdateRewriteRuleUseCase.ts

- **変更内容**:
  - `src/application-business-rules/interactors/UpdateRewriteRuleInteractor.ts` へリネーム・移動
  - `IUpdateRewriteRuleUseCase`（Input Port）を実装
  - `IUpdateRewriteRulePresenter`（Output Port）を依存に追加
  - `IChromeTabsService` → `ITabsGateway` に変更
  - エラーハンドリングをPresenter経由に変更
- **影響ファイル数**: 少数
- **影響モジュール**:
  - application層（UseCaseを呼び出す箇所）
  - frameworks-and-drivers/di/container.ts（DI登録）
  - tests/（関連テスト）

### 新規作成ファイル

| ファイル | 配置先 | 説明 |
| --------- | -------- | ------ |
| IUpdateRewriteRuleUseCase.ts | src/application-business-rules/ports/input/ | Input Port |
| IUpdateRewriteRulePresenter.ts | src/application-business-rules/ports/output/ | Output Port |
| UpdateRewriteRuleInteractor.ts | src/application-business-rules/interactors/ | Interactor実装 |
| UpdateRewriteRuleInputData.ts | src/application-business-rules/dto/input/ | Input DTO |
| UpdateRewriteRuleOutputData.ts | src/application-business-rules/dto/output/ | Output DTO |
| UpdateRewriteRuleErrorOutputData.ts | src/application-business-rules/dto/output/ | Error Output DTO |
| UpdateRewriteRuleController.ts | src/interface-adapters/controllers/ | Controller |
| UpdateRewriteRulePresenter.ts | src/interface-adapters/presenters/ | Presenter |
| UpdateRewriteRuleControllerFactory.ts | src/interface-adapters/factories/ | Factory（ADR-005準拠） |

### 分類B: 対応しない

- `IChromeTabsService.ts` - 既存の他UseCaseが依存しているため、本ユーザーストーリーでは削除しない

## 開発戦略

### Phase 0: 前提タスク（分類Cファイルのディレクトリ移動）

- [ ] UpdateRewriteRuleUseCase.ts を `src/application-business-rules/interactors/UpdateRewriteRuleInteractor.ts` へ移動（ロジック変更なし、import修正のみ）

### Phase 1: Skeleton（インターフェース・スケルトンクラス作成）

#### 第2層: application-business-rules

- [ ] IUpdateRewriteRuleUseCase（Input Port インターフェース）
- [ ] IUpdateRewriteRulePresenter（Output Port インターフェース）
- [ ] UpdateRewriteRuleInputData / OutputData / ErrorOutputData（DTO）
- [ ] UpdateRewriteRuleInteractor に IUpdateRewriteRuleUseCase を実装（スケルトン）

#### 第3層: interface-adapters

- [ ] UpdateRewriteRuleController（スケルトン実装）
- [ ] UpdateRewriteRulePresenter（スケルトン実装）
- [ ] UpdateRewriteRuleControllerFactory（スケルトン実装）

#### 設計ドキュメント（docs/design/pages）

- [ ] `docs/design/pages/rule-list/features/update-rule/00-overview.md` の作成
- [ ] `docs/design/pages/rule-list/features/update-rule/01-class-design.md` の作成
- [ ] `docs/design/pages/rule-list/features/update-rule/03-directory-structure.md` の作成

#### テスト戦略書

- [ ] 結合テスト戦略書の作成（`docs/design/pages/rule-list/features/update-rule/integration-test-strategy.md`）

### Phase 2: 実装・単体テスト

#### 第2層: application-business-rules

- [ ] UpdateRewriteRuleInteractor の実装、テスト戦略書・単体テスト
  - IChromeTabsService → ITabsGateway への変更
  - Presenter経由のエラーハンドリング導入
  - テスト戦略書を新しい場所に作成: `docs/design/src/application-business-rules/interactors/UpdateRewriteRuleInteractor/execute.md`

#### 第3層: interface-adapters

- [ ] UpdateRewriteRuleController の実装、テスト戦略書・単体テスト
- [ ] UpdateRewriteRulePresenter の実装、テスト戦略書・単体テスト
- [ ] UpdateRewriteRuleControllerFactory の実装、テスト戦略書・単体テスト

### Phase 3: 統合

- [ ] container.ts に新クラスのDI登録を追加
- [ ] 呼び出し元を Controller 経由に変更
- [ ] 結合テスト戦略書に基づくテスト実装
- [ ] E2Eテスト戦略書の作成（`docs/design/pages/rule-list/features/update-rule/e2e-test-strategy.md`）
- [ ] E2Eテスト実装

### Phase 4: 旧コード削除

- [ ] 旧 UpdateRewriteRuleUseCase の削除
- [ ] 旧テスト戦略書の削除（`docs/design/src/application/usecases/rule/UpdateRewriteRuleUseCase/execute.md`）
  - 新しいテスト戦略書はPhase 2で作成済みのため、旧ファイルは単純削除

### 対応しない（分類B）

- IChromeTabsService.ts - 他UseCaseが依存しているため削除対象外

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
