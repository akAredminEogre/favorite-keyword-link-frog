---
codd:
  node_id: "req:user-stories-user-story-015-readme"
  type: requirement
---

# User Story 015: ルールJSONエクスポート機能

## ストーリー

> ルール一覧でルールをJSONファイルとしてエクスポートできる

## 概要

ルール一覧画面において、保存済みの全ルールをJSON形式でファイルにエクスポートできる機能を追加する。
エクスポートされたJSONファイルは将来のインポート機能と互換性のある形式とし、メタデータとルールの全属性（ID含む）を含める。

## 設計ドキュメント

- [export-rules-json 設計](../../design/pages/rule-list/features/export-rules-json/)
  - [00-overview.md](../../design/pages/rule-list/features/export-rules-json/00-overview.md) - 機能概要
  - [01-class-design.md](../../design/pages/rule-list/features/export-rules-json/01-class-design.md) - クラス設計
  - [02-sequence.puml](../../design/pages/rule-list/features/export-rules-json/02-sequence.puml) - シーケンス図
  - [03-directory-structure.md](../../design/pages/rule-list/features/export-rules-json/03-directory-structure.md) - ディレクトリ構造
  - [e2e-test-strategy.md](../../design/pages/rule-list/features/export-rules-json/e2e-test-strategy.md) - E2Eテスト戦略書

## 現状分析

### 差分分類

設計ドキュメント（03-directory-structure.md）と現在の実装の差分を分類：

| ファイル | 現在位置 | 理論位置 | 修正 | 分類 |
|--------|---------|---------|------|------|
| IExportRulesJsonUseCase.ts | 存在しない | src/application-business-rules/ports/input/ | 新規作成 | A |
| IExportRulesJsonPresenter.ts | 存在しない | src/application-business-rules/ports/output/ | 新規作成 | A |
| ExportRulesJsonInputData.ts | 存在しない | src/application-business-rules/dto/input/ | 新規作成 | A |
| ExportRulesJsonOutputData.ts | 存在しない | src/application-business-rules/dto/output/ | 新規作成 | A |
| ExportRulesJsonErrorOutputData.ts | 存在しない | src/application-business-rules/dto/output/ | 新規作成 | A |
| ExportRulesJsonInteractor.ts | 存在しない | src/application-business-rules/interactors/ | 新規作成 | A |
| IExportRulesJsonController.ts | 存在しない | src/interface-adapters/controllers/ | 新規作成 | A |
| ExportRulesJsonController.ts | 存在しない | src/interface-adapters/controllers/ | 新規作成 | A |
| IExportRulesJsonControllerFactory.ts | 存在しない | src/interface-adapters/factories/ | 新規作成 | A |
| ExportRulesJsonControllerFactory.ts | 存在しない | src/interface-adapters/factories/ | 新規作成 | A |
| ExportRulesJsonPresenter.ts | 存在しない | src/interface-adapters/presenters/ | 新規作成 | A |
| ExportButton.tsx | 存在しない | src/frameworks-and-drivers/ui/components/atoms/ExportButton/ | 新規作成 | A |
| useExportRulesJson.ts | 存在しない | src/frameworks-and-drivers/ui/hooks/ | 新規作成 | A |
| RulesApp.tsx | 既存 | src/frameworks-and-drivers/ui/pages/rules/ | 修正（ExportButton追加） | E |
| container.ts | 既存 | src/frameworks-and-drivers/di/ | 修正（DI登録追加） | E |
| IRewriteRuleRepository.ts | 既存 | src/application-business-rules/ports/gateway/ | 変更なし（getAll()使用） | D |
| RewriteRuleMapper.ts | 既存 | src/interface-adapters/mappers/ | 変更なし（getAll()使用） | D |

### 分類C: 移行必須ファイル

なし。既存ファイルはすべて適切な位置に配置済み。

### 分類B: 対応しない

なし。

## 開発戦略

[docs/development-flow/new-feature/index.md](../../../docs/development-flow/new-feature/index.md) に従う。
スケルトンフェーズは設けず、E2E 1シナリオ実装へ直結する（スタブ・スケルトンは作成しない）。

### Phase 1: E2E 1シナリオ実装

`02-sequence.puml` の正常系（エクスポートボタンクリック → JSONファイルダウンロード）を通す最小限の実装。

#### 第2層: application-business-rules

- [ ] IExportRulesJsonUseCase（Input Port インターフェース）
- [ ] IExportRulesJsonPresenter（Output Port インターフェース）
- [ ] ExportRulesJsonInputData / OutputData / ErrorOutputData（DTO）
- [ ] ExportRulesJsonInteractor の実装（getAll() 呼び出し、OutputData / ErrorOutputData 生成）

#### 第3層: interface-adapters

- [ ] IExportRulesJsonController（Controllerインターフェース、ADR-005準拠）
- [ ] ExportRulesJsonController の実装
- [ ] IExportRulesJsonControllerFactory（Factoryインターフェース、ADR-005準拠）
- [ ] ExportRulesJsonControllerFactory の実装
- [ ] ExportRulesJsonPresenter の実装（ファイルダウンロード処理）

#### 第4層: frameworks-and-drivers

- [ ] useExportRulesJson カスタムフックの実装
- [ ] ExportButton UIコンポーネントの実装
- [ ] RulesApp.tsx に ExportButton を統合（ExportButton を RulesApp 内でレンダリング）
- [ ] container.ts に ExportRulesJsonControllerFactory の DI 登録を追加

#### E2Eテスト

- [x] E2Eテスト戦略書の作成（`docs/design/pages/rule-list/features/export-rules-json/e2e-test-strategy.md`）
- [ ] E2Eテスト実装（正常系 1 シナリオ: `normal-flow.spec.ts`）

### Phase 2: ユニットテスト網羅・不具合修正

E2Eテスト通過後、各クラス・メソッドの単体テストを整備する。

#### 第2層: application-business-rules

- [ ] ExportRulesJsonInteractor のテスト戦略書・単体テスト

#### 第3層: interface-adapters

- [ ] ExportRulesJsonController のテスト戦略書・単体テスト
- [ ] ExportRulesJsonPresenter のテスト戦略書・単体テスト
- [ ] ExportRulesJsonControllerFactory のテスト戦略書・単体テスト

#### 第4層: frameworks-and-drivers

- [ ] ExportButton UIコンポーネントのテスト戦略書・単体テスト
- [ ] useExportRulesJson カスタムフックのテスト戦略書・単体テスト

### Phase 3: 結合テスト・E2Eテスト全件

- [ ] 結合テスト戦略書に基づくテスト実装完了
  - 詳細: [integration-test-strategy.md](../../design/pages/rule-list/features/export-rules-json/integration-test-strategy.md)（未作成。Phase 3 で作成・実施）
- [ ] E2Eテスト戦略書に基づくテスト実装完了（全シナリオ）
  - 詳細: [e2e-test-strategy.md](../../design/pages/rule-list/features/export-rules-json/e2e-test-strategy.md)

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
