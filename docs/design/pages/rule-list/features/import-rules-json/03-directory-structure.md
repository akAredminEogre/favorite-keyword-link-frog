---
codd:
  node_id: "design:design-pages-rule-list-features-import-rules-json-03-directory-structure"
  type: design
---

# ディレクトリ構造設計

> ⚠️ **整合性注記（CodeRabbit PR#405 指摘対応）**
> 本ファイルの一部記述は**初期計画時のフル設計**を反映しており、実装フェーズで採用された**よりリーンな確定設計**（`00-overview.md` / `01-class-design.md` および実装コードを正とする）と差異がある。**現行の正は `00-overview.md` / `01-class-design.md` + `src/` 実装**であり、相違時はそちらを優先すること。具体的な未採用項目:
> - **Controller / Presenter は独立クラスではなく Factory 内の無名オブジェクト**（`ImportRulesJsonControllerFactory` に集約）。`interface-adapters/controllers/{I,}ImportRulesJsonController.ts` および `interface-adapters/presenters/ImportRulesJsonPresenter.ts`、`ports/output/IImportRulesJsonPresenter.ts` は**未作成**（Presenter IF は Interactor 同一ファイル内定義）。
> - **`IFileSizeValidator` / `IByteSizeCalculator` / `FileSizeValidator` / `BlobByteSizeCalculator` は本PRでは未実装**（ファイルサイズ検証は EBR 層 `ImportFileSize` value-object に集約）。これらの抽出は将来 user-story（US-022 等）の別PRスコープ。
> - **プレビュー確認なし・1フェーズ一括上書き**（`importRulesJson(inputData)` 単一メソッド。`previewImport` / `confirmImport` や確認ダイアログは存在しない）。`ImportRulesJsonUI` は ToastNotification 統合であり「確認ダイアログ統合」ではない。

<!-- 本ドキュメントは機能実装に伴うディレクトリ構造の設計ドキュメントです。
     ADR（Architecture Decision Record）ではなく、実装ガイド・補足資料として機能します。
     docs/design 配下に配置しているのは、同機能の他設計ドキュメント（00-overview.md, 01-class-design.md 等）との
     一元管理のためです。アーキテクチャ上の意思決定は docs/adr/ の各 ADR を参照してください。
     関連ADR: ADR-001（クリーンアーキテクチャ層構造）, ADR-005（ControllerFactory パターン） -->

## 詳細構造

### 第1層: enterprise-business-rules/

```text
src/enterprise-business-rules/
└── entities/                                    ← Entity
    └── RewriteRule/
        └── RewriteRule.ts                       ← 既存、変更なし
```

### 第2層: application-business-rules/

```text
src/application-business-rules/
├── ports/
│   ├── input/                                   ← Input Port (Interface)
│   │   └── IImportRulesJsonUseCase.ts           ← NEW
│   ├── output/                                  ← Output Port (Interface)
│   │   └── IImportRulesJsonPresenter.ts         ← NEW
│   ├── services/                                ← Service Port (Interface)
│   │   ├── IJsonParser.ts                       ← NEW (JSON.parseの抽象化)
│   │   ├── IFileTextReader.ts                   ← NEW (FileReader APIの抽象化)
│   │   ├── IFileSizeValidator.ts                ← NEW (File.size APIの抽象化)
│   │   └── IByteSizeCalculator.ts               ← NEW (Blob APIの抽象化)
│   └── gateway/                                 ← Gateway Interface (Interactorが依存)
│       └── IRewriteRuleRepository.ts            ← 既存、変更なし(getAll/create/deleteを使用)
├── interactors/                                 ← Use Case Interactor
│   └── ImportRulesJsonInteractor.ts             ← NEW
└── dto/                                         ← Data Transfer Objects
    ├── input/
    └── output/
        ├── ImportRulesJsonOutputData.ts           ← NEW
        └── ImportRulesJsonErrorOutputData.ts      ← NEW
```

### 第3層: interface-adapters/

```text
src/interface-adapters/
├── controllers/                                 ← Controller
│   ├── IImportRulesJsonController.ts            ← NEW (Controllerインターフェース, ADR-005参照)
│   └── ImportRulesJsonController.ts             ← NEW
├── presenters/                                  ← Presenter
│   └── ImportRulesJsonPresenter.ts              ← NEW
├── factories/                                   ← Factory(ADR-005参照)
│   ├── IImportRulesJsonControllerFactory.ts     ← NEW (Factoryインターフェース, ADR-005参照)
│   └── ImportRulesJsonControllerFactory.ts      ← NEW (Factory実装, ADR-005参照)
├── ports/                                       ← Port(Mapperが依存, ADR-002参照)
│   └── IRewriteRuleMessagingPort.ts             ← 既存、変更なし
└── mappers/                                     ← Mapper(ADR-002、ADR-003参照)
    └── RewriteRuleMapper.ts                     ← 既存、変更なし
```

### 第4層: frameworks-and-drivers/

```text
src/frameworks-and-drivers/
├── ui/                                          ← View (React)
│   ├── components/
│   │   ├── atoms/
│   │   │   └── ImportButton/                    ← NEW (Atomコンポーネント)
│   │   │       ├── ImportButton.tsx             ← NEW (hidden inputを内包)
│   │   │       ├── ImportButton.module.css      ← NEW (Atomはカプセル化・再利用性のためCSSモジュール採用)
│   │   │       └── UploadIcon.tsx               ← NEW (DownloadIconとの対)
│   │   └── organisms/
│   │       └── ImportRulesJsonUI/               ← NEW (Organismコンポーネント)
│   │           └── ImportRulesJsonUI.tsx        ← NEW (ImportButton + 確認ダイアログ統合; ダイアログオーバーレイはpropsによる動的レイアウトのためインラインスタイル採用)
│   ├── hooks/                                   ← React Custom Hooks
│   │   └── useImportRulesJson.ts               ← NEW
│   └── pages/
│       └── rules/
│           └── RulesApp.tsx                     ← 既存、ImportRulesJsonUI統合
├── File/                                        ← ブラウザファイルAPI実装
│   ├── FileTextReader.ts                        ← NEW (FileReader.readAsTextのラッパー)
│   ├── FileSizeValidator.ts                     ← NEW (File.sizeチェックのラッパー)
│   └── BlobByteSizeCalculator.ts               ← NEW (Blob APIによるバイト計算のラッパー)
├── persistence/                                 ← Repository 実装
│   ├── indexeddb/
│   │   └── DexieRewriteRuleRepository.ts        ← 既存、変更なし
│   └── ChromeRuntimeRewriteRuleRepository.ts    ← 既存、変更なし
├── messaging/                                   ← メッセージング層(ADR-002参照)
│   ├── RewriteRuleMessagingService.ts           ← 既存、変更なし
│   ├── RewriteRuleProxyService.ts               ← 既存、変更なし
│   ├── RewriteRuleProxyServiceImpl.ts           ← 既存、変更なし
│   └── dto/                                     ← メッセージング用DTO(ADR-002、ADR-003参照)
│       └── RewriteRuleDTO.ts                    ← 既存、変更なし
└── di/                                          ← DI Container
    └── container.ts                             ← 既存、ImportRulesJsonControllerFactory登録追加
```

## 新規実装ファイル一覧（src配下）

| ファイル | 層 | 概要 |
|---------|------|------|
| `src/application-business-rules/ports/input/IImportRulesJsonUseCase.ts` | 第2層 | UseCase Input Port インターフェース |
| `src/application-business-rules/ports/output/IImportRulesJsonPresenter.ts` | 第2層 | Presenter Output Port インターフェース |
| `src/application-business-rules/interactors/ImportRulesJsonInteractor.ts` | 第2層 | UseCaseの実装。バリデーション・一括上書きを1フェーズで実行 |
| `src/application-business-rules/dto/output/ImportRulesJsonOutputData.ts` | 第2層 | 出力DTO（importedCount / previousCount） |
| `src/application-business-rules/dto/output/ImportRulesJsonErrorOutputData.ts` | 第2層 | エラーDTO（error / errorType / message） |
| `src/interface-adapters/controllers/IImportRulesJsonController.ts` | 第3層 | Controller インターフェース（ADR-005） |
| `src/interface-adapters/controllers/ImportRulesJsonController.ts` | 第3層 | Controller 実装 |
| `src/interface-adapters/factories/IImportRulesJsonControllerFactory.ts` | 第3層 | Factory インターフェース（ADR-005） |
| `src/interface-adapters/factories/ImportRulesJsonControllerFactory.ts` | 第3層 | Factory 実装 |
| `src/interface-adapters/presenters/ImportRulesJsonPresenter.ts` | 第3層 | Presenter 実装（3コールバック） |
| `src/frameworks-and-drivers/ui/components/atoms/ImportButton/ImportButton.tsx` | 第4層 | インポートボタンUIコンポーネント |
| `src/frameworks-and-drivers/ui/components/atoms/ImportButton/ImportButton.module.css` | 第4層 | インポートボタンスタイル |
| `src/frameworks-and-drivers/ui/components/atoms/ImportButton/UploadIcon.tsx` | 第4層 | アップロードアイコン（DownloadIconと対） |
| `src/frameworks-and-drivers/ui/components/organisms/ImportRulesJsonUI/ImportRulesJsonUI.tsx` | 第4層 | ImportButton + 確認ダイアログ統合Organism |
| `src/frameworks-and-drivers/ui/hooks/useImportRulesJson.ts` | 第4層 | カスタムHook（状態管理・FileオブジェクトをControllerへ委譲） |
| `src/application-business-rules/ports/services/IJsonParser.ts` | 第2層 | JSON解析 Service Port インターフェース |
| `src/application-business-rules/ports/services/IFileTextReader.ts` | 第2層 | FileReader API Service Port インターフェース |
| `src/application-business-rules/ports/services/IFileSizeValidator.ts` | 第2層 | File.size API Service Port インターフェース |
| `src/application-business-rules/ports/services/IByteSizeCalculator.ts` | 第2層 | Blob API Service Port インターフェース |
| `src/frameworks-and-drivers/Json/JsonParser.ts` | 第4層 | IJsonParserの実装。JSON.parseをラップ |
| `src/frameworks-and-drivers/File/FileTextReader.ts` | 第4層 | IFileTextReaderの実装。FileReader.readAsTextをラップ |
| `src/frameworks-and-drivers/File/FileSizeValidator.ts` | 第4層 | IFileSizeValidatorの実装。File.sizeチェックをラップ |
| `src/frameworks-and-drivers/File/BlobByteSizeCalculator.ts` | 第4層 | IByteSizeCalculatorの実装。Blob APIによるバイト計算をラップ |

## 既存修正ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/frameworks-and-drivers/ui/pages/rules/RulesApp.tsx` | ImportRulesJsonUI コンポーネントを統合。isImportingフラグ追加 |
| `src/frameworks-and-drivers/di/container.ts` | ImportRulesJsonControllerFactory を DI コンテナに登録 |
---

## ドキュメント対象範囲（ガイドライン）

> **このドキュメントはプロダクションコード（`src/` 配下）の設計書です。**
> E2E テストファイル（`tests/e2e/` 配下）は対象外です。
> テストコードのディレクトリ構造は [e2e-test-strategy.md](./e2e-test-strategy.md) を参照してください。
>
> **新規ファイル一覧を記載する際は、`src/` 配下のファイルのみを記載し、E2E テストファイルは含めないこと。**
