---
codd:
  node_id: "req:user-stories-user-story-019-readme"
  type: requirement
---

# User Story 019: ルールJSONインポート機能作成

## ストーリー

> ルール一覧でJSONファイルからルールをインポートできる

## 概要

ルール一覧画面において、JSONファイルをインポートしてルールを一括登録できる機能を追加する。
エクスポート機能（user-story-015）で出力したJSONファイルと互換性のある形式で取り込みを行い、
プレビュー確認後に確定することでルールを上書き保存する。

本ユーザーストーリーは PR#394（現行は後継 PR#405・`feat/rule-json-import`）にて、設計から実装・CA準拠リファクタリングまでの
主要フェーズを完了した。将来フェーズで実装する改善項目は、下記「子タスク（別PR対応）」に記載する。

> ⚠️ **完了状態の整合注記（CodeRabbit PR#405 指摘対応）**
> 以下「開発フロー」の各 Phase チェックリストは**初期計画時の作業項目**を網羅列挙したものであり、`[ ]` 未チェックのまま残っている。一方で**確定実装はよりリーンな構成**を採用したため、計画項目の一部は**採用されず**（チェックされないのが正）である。具体的に**本PRで実装されていない計画項目**:
> - Phase 3 の `IFileSizeValidator` / `IByteSizeCalculator` / `FileSizeValidator` / `BlobByteSizeCalculator`（ファイルサイズ検証は EBR `ImportFileSize` value-object に集約。F&D 抽出は US-022 の別PRスコープ）
> - 独立 `ImportRulesJsonController` / `ImportRulesJsonPresenter` クラス（Factory 内無名オブジェクトに集約。標準クラス化は未実施）
> - プレビュー / 確認ダイアログ（`importRulesJson` 単一メソッドの1フェーズ一括上書き。`previewImport`/`confirmImport` は不採用）
>
> **実際に出荷された実装の正は「実装済みコンポーネント」表（下記）と `00-overview.md` / `01-class-design.md` + `src/` コード**である。Phase チェックリストは履歴・計画記録として残し、出荷実態と差異がある旨を本注記で明示する。

## 設計ドキュメント

- [import-rules-json 設計](../../design/pages/rule-list/features/import-rules-json/)
  - [00-overview.md](../../design/pages/rule-list/features/import-rules-json/00-overview.md) - 機能概要
  - [01-class-design.md](../../design/pages/rule-list/features/import-rules-json/01-class-design.md) - クラス設計
  - [02-sequence.puml](../../design/pages/rule-list/features/import-rules-json/02-sequence.puml) - シーケンス図
  - [03-directory-structure.md](../../design/pages/rule-list/features/import-rules-json/03-directory-structure.md) - ディレクトリ構造
  - [e2e-test-strategy.md](../../design/pages/rule-list/features/import-rules-json/e2e-test-strategy.md) - E2Eテスト戦略書
- [04-network-diagram.puml](./04-network-diagram.puml) - タスク依存ネットワーク図（アローダイアグラム）

## 現状分析

### 実装済みコンポーネント（PR#394 feat/rule-json-import）

| ファイル | 分類 | 状態 |
|--------|------|------|
| `IImportRulesJsonUseCase.ts` | A | 実装済み |
| `IImportRulesJsonPresenter.ts` | A | 実装済み |
| `ImportRulesJsonInputData.ts` | A | 実装済み（byteSize注入によるCA準拠対応）|
| `ImportRulesJsonOutputData.ts` | A | 実装済み |
| `IJsonParser.ts` | A | 実装済み（JSON.parse CA準拠対応）|
| `ImportRulesJsonInteractor.ts` | A | 実装済み |
| `IImportRulesJsonController.ts` | A | 実装済み |
| `ImportRulesJsonController.ts` | A | 実装済み |
| `IImportRulesJsonControllerFactory.ts` | A | 実装済み |
| `ImportRulesJsonControllerFactory.ts` | A | 実装済み |
| `ImportRulesJsonPresenter.ts` | A | 実装済み |
| `ImportRulesJsonUI.tsx` | A | 実装済み（将来改善 → US-016） |
| `useImportRulesJson.ts` | A | 実装済み |
| `JsonParser.ts` | E | 実装済み（IJsonParser実装、CA準拠、`frameworks-and-drivers/Json/`）|
| `container.ts` | E | 修正済み（DI登録） |

### PR#394で先送りした改善項目（子タスク）

以下の項目は変更範囲・複雑度を理由に本PRで実装せず、別PRで対応することとした:

| ユーザーストーリー | 対象 | 内容 |
|-----------------|------|------|
| [US-016](../user-story-016/README.md) | `ImportRulesJsonUI.tsx` | ModalDialogBase移行（アクセシビリティ完全対応） |
| [US-017](../user-story-017/README.md) | `ImportRulesJsonInteractor.ts` | I/Oバッチ最適化（Dexie bulk操作） |
| [US-018](../user-story-018/README.md) | `ImportRulesJsonInputData.ts` 他 | UseCase/Controller InputData注入パターン統一 |
| [US-020](../user-story-020/README.md) | `IRewriteRuleRepository.ts` 他 | ID保持リストア（createWithId実装） |
| [US-021](../user-story-021/README.md) | `ImportRulesJsonInteractor.ts` | previewImport() id フィールドのバリデーション強化 |

## 開発フロー

### Phase 0: 設計・user-storiesドキュメント作成（PR#394 完了）

機能実装に先立ち、Clean Architecture準拠の設計ドキュメント一式を作成した。
設計ドキュメント完成後、user-storiesドキュメント（アローダイアグラム含む）を整備した。

#### 設計ドキュメント（00〜03）

- [ ] [00-overview.md](../../design/pages/rule-list/features/import-rules-json/00-overview.md) — 機能概要・検証レベル定義
- [ ] [01-class-design.md](../../design/pages/rule-list/features/import-rules-json/01-class-design.md) — クラス設計（4層CA構成）
- [ ] [02-sequence.puml](../../design/pages/rule-list/features/import-rules-json/02-sequence.puml) — シーケンス図（previewImport / confirmImport フロー）
- [ ] [03-directory-structure.md](../../design/pages/rule-list/features/import-rules-json/03-directory-structure.md) — ディレクトリ構造
- [ ] [e2e-test-strategy.md](../../design/pages/rule-list/features/import-rules-json/e2e-test-strategy.md) — E2Eテスト戦略書

#### user-storiesドキュメント作成（アローダイアグラム含む）

- [ ] [04-network-diagram.puml](./04-network-diagram.puml) — タスク依存ネットワーク図（アローダイアグラム）
- [ ] [README.md](./README.md) — ユーザーストーリードキュメント（受け入れ条件・開発フロー・子タスク定義）

---

### Phase 1: E2E 1シナリオ実装（PR#394 完了）

4層Clean Architectureに従いインポート機能の最小実装を行い、E2E正常フロー1シナリオを実装した。

#### 第2層: application-business-rules

- [x] IImportRulesJsonUseCase（Input Port インターフェース）
- [x] IImportRulesJsonPresenter（Output Port インターフェース）
- [x] ImportRulesJsonInputData / OutputData / PreviewOutputData / ErrorOutputData（DTO群）
- [x] ImportRulesJsonInteractor の実装（previewImport / confirmImport — バリデーションL1〜L5）

#### 第3層: interface-adapters

- [x] IImportRulesJsonController（Controllerインターフェース、ADR-005準拠）
- [x] ImportRulesJsonController の実装
- [x] IImportRulesJsonControllerFactory（Factoryインターフェース、ADR-005準拠）
- [x] ImportRulesJsonControllerFactory の実装
- [x] ImportRulesJsonPresenter の実装（3コールバック構成: onPreview / onSuccess / onError）

#### 第4層: frameworks-and-drivers

- [x] ImportButton / UploadIcon UIコンポーネントの実装
- [x] ImportRulesJsonUI UIコンポーネントの実装（確認ダイアログ統合）
- [x] useImportRulesJson カスタムフックの実装（ファイル選択・プレビュー・確定・エラーハンドリング）
- [x] RulesApp.tsx にインポートボタンを統合
- [x] container.ts に DI 登録を追加（ImportRulesJsonControllerFactory）

#### E2Eテスト

- [x] E2Eテスト戦略書の作成
- [x] E2Eテスト実装（正常系 1 シナリオ: `normal-flow.spec.ts`）

---

### Phase 2: CA準拠リファクタリング — ブラウザAPI抽象化（PR#394 完了）

ブラウザ固有APIをClean Architecture準拠でFrameworks & Drivers層に分離した。

#### Blob計算のF&D層委譲

- [ ] `ImportRulesJsonInputData` に `byteSize` フィールドを追加（Blob計算をInteractorから除去）
- [ ] `useImportRulesJson.ts` でBlobバイトサイズを計算しInputDataに注入
- [ ] `ImportRulesJsonInteractor` から `Blob` API直接利用を除去

#### JSON.parseのF&D層委譲

- [ ] `IJsonParser` port interface を定義（application-business-rules層）
- [ ] `JsonParser.ts` をF&D層に実装（`frameworks-and-drivers/Json/JsonParser.ts`）
- [ ] `ImportRulesJsonInteractor` を `IJsonParser` 経由に変更（CA準拠）

#### FCC・型整理

- [ ] `ImportRulesJsonInteractor` で `RewriteRules` FCC（FormattedCollectionClass）を使用（`pendingRules` 型変更）
- [ ] DI登録を `container.ts` に追加（JsonParser）

---

### Phase 3: CA準拠リファクタリング — ブラウザAPIモジュール化（PR#394 完了）

`useImportRulesJson.ts` に残存していたブラウザ固有API（FileReader・Blob）をF&D層モジュールとして抽出した。

- [ ] `IFileTextReader` port interface を定義（application-business-rules層）
- [ ] `FileTextReader.ts` をF&D層に実装（FileReader APIをラップ）
- [ ] `IFileSizeValidator` port interface を定義
- [ ] `FileSizeValidator.ts` をF&D層に実装（ファイルサイズ検証）
- [ ] `IByteSizeCalculator` port interface を定義
- [ ] `BlobByteSizeCalculator.ts` をF&D層に実装（Blob byteSize計算）
- [ ] `useImportRulesJson.ts` を上記インターフェース経由に変更
- [ ] `container.ts` にDI登録を追加（3モジュール）
- [ ] DIコンテナ完全性テスト（`interface-registration-completeness.test.ts`）に3件追加

---

### Phase 4: EBR層バリデーション強化（PR#394 完了）

ファイルサイズ検証ロジックをフレームワーク非依存のEnterprise Business Rules層に移動し、UIバリデーションを除去した。

- [ ] `IFileSizeValidator` の実装をEBR層に移動（フレームワーク非依存のバイト数比較ロジック）
- [ ] `ImportRulesJsonInteractor` でファイルサイズ上限チェック（`byteSize > MAX_FILE_SIZE_BYTES`）を実施
- [ ] `useImportRulesJson.ts`（UI層）のファイルサイズバリデーションを除去（EBR層に一本化）

---

### Phase 5: EBR層バリデーション拡張 — バージョン/スキーマチェック（PR#394 完了）

JSONスキーマ検証・バージョンチェックをEBR層（Interactor）に集約し、JsonParserの検証を強化した。

- [ ] `ImportRulesJsonInteractor` にバージョンフィールド検証を追加（EBR層で実施）
- [ ] `ImportRulesJsonInteractor` にJSONスキーマ構造チェックを追加（EBR層で実施）
- [ ] `JsonParser.ts` のバリデーション強化（parse前後の型ガード）
- [ ] 型定義の共有化（`ImportRulesJsonInteractor` と `JsonParser` 間の型整合）

---

### Phase 6: ユニットテスト網羅・不具合修正（PR#394 完了）

各フェーズの実装に対応するユニットテストを整備し、CI/CDで通過を確認した。
本PRで新規作成・修正した全モジュールを以下に洗い出す。

#### 第2層: application-business-rules

**Port interfaces（インターフェース定義のみ・ランタイム実装なし・ユニットテスト不要）**

- [ ] `IImportRulesJsonUseCase` — Input Port インターフェース（実装: `ImportRulesJsonInteractor`）
- [ ] `IImportRulesJsonPresenter` — Output Port インターフェース（実装: `ImportRulesJsonPresenter`）
- [ ] `IFileTextReader` — Service Port インターフェース（実装: `FileTextReader`、DI完全性テストで検証済み）
- [ ] `IFileSizeValidator` — Service Port インターフェース（実装: `FileSizeValidator`、DI完全性テストで検証済み）
- [ ] `IByteSizeCalculator` — Service Port インターフェース（実装: `BlobByteSizeCalculator`、DI完全性テストで検証済み）
- [ ] `IJsonParser` — Service Port インターフェース（実装: `JsonParser`）

**実装クラス・ユニットテスト**

- [ ] `ImportRulesJsonInteractor` ユニットテスト（previewImport / confirmImport — 全バリデーションケース）
- [ ] `ImportRulesJsonInputData` ユニットテスト（コンストラクタ検証）
- [ ] `ImportRulesJsonOutputData` / `ImportRulesJsonPreviewOutputData` / `ImportRulesJsonErrorOutputData` ユニットテスト（コンストラクタ検証）

#### 第1層: enterprise-business-rules

- [ ] `ImportFileSize` value-object ユニットテスト（ファイルサイズ上限定数・比較ロジック）

#### 第3層: interface-adapters

**インターフェース定義（ユニットテスト不要）**

- [ ] `IImportRulesJsonController` — Controller インターフェース（ADR-005準拠）
- [ ] `IImportRulesJsonControllerFactory` — Factory インターフェース（ADR-005準拠、DI完全性テストで検証済み）

**実装クラス・ユニットテスト**

- [ ] `ImportRulesJsonController` / `ImportRulesJsonPresenter` ユニットテスト
- [ ] `ImportRulesJsonControllerFactory` ユニットテスト（`create` メソッド検証）

#### 第4層: frameworks-and-drivers

**ユニットテスト実施**

- [ ] `JsonParser.ts` ユニットテスト（型ガード・エラーケース）
- [ ] `FileTextReader` / `FileSizeValidator` / `BlobByteSizeCalculator` ユニットテスト

**E2Eテストで検証済み（ユニットテスト対象外）**

- [ ] `ImportRulesJsonUI` UIコンポーネント（E2E正常系シナリオで検証済み → Phase 7）
- [ ] `useImportRulesJson.ts` カスタムフック（E2E正常系シナリオで検証済み → Phase 7）

#### インフラ: DI登録完全性

- [ ] `interface-registration-completeness.test.ts` に `IImportRulesJsonControllerFactory` / `IFileTextReader` / `IFileSizeValidator` / `IByteSizeCalculator` を追加（CI修正）

#### 全体確認

- [ ] ユニットテスト全通過（`npx vitest --run`）・Lint全通過

---

### Phase 7: 結合テスト・UI実装・E2Eテスト網羅（PR#394 完了）

UI実装とE2Eテストを実施し、CI/CDによる全テスト自動実行で動作を確認した。

- [ ] `ImportRulesJsonUI.tsx` UIコンポーネント実装（確認ダイアログ統合、Phase 1 で実施）
- [ ] `useImportRulesJson.ts` カスタムフック実装（Phase 1 で実施）
- [ ] E2Eテスト正常系 1 シナリオ実装（`normal-flow.spec.ts`、Phase 1 で実施）
- [ ] CI/CDによる全テスト（ユニット + E2E）自動実行・通過確認

---

### 子タスク（別PR対応）

- [ ] [US-016](../user-story-016/README.md): ModalDialogBase移行（アクセシビリティ完全対応）
- [ ] [US-017](../user-story-017/README.md): I/Oバッチ最適化（Dexie bulk操作）
- [ ] [US-018](../user-story-018/README.md): UseCase/Controller InputData注入パターン統一
- [ ] [US-020](../user-story-020/README.md): ID保持リストア（createWithId実装）
- [ ] [US-021](../user-story-021/README.md): previewImport() id フィールドのバリデーション強化

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
