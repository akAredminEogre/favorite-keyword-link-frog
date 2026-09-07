---
codd:
  node_id: "design:design-pages-rule-list-features-import-rules-json-01-class-design"
  type: design
---

# クラス設計

## 制御フロー

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                     frameworks-and-drivers/ (第4層)                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/pages/rules/RulesApp.tsx (View)                                 │ │
│  │     - ルール一覧画面のトップコンポーネント                           │ │
│  │     - useImportRulesJson(onImportSuccess) でインポート用 state を取得 │ │
│  │     - ImportRulesJsonUI に onImportClick / isImporting /             │ │
│  │       importError / importSuccess / dismiss 系ハンドラを props で渡す │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/components/organisms/ImportRulesJsonUI/ImportRulesJsonUI.tsx    │ │
│  │     - ImportButton + 成功/エラー用 ToastNotification を統合する      │ │
│  │     - isImporting / importError / importSuccess を props で受け取る │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/components/atoms/ImportButton/ImportButton.tsx                  │ │
│  │     - アップロードアイコン付きボタンを表示                            │ │
│  │     - disabled 時（インポート中）はグレーアウト                      │ │
│  │     - クリックで hidden <input type="file" accept=".json"> を発火    │ │
│  │     - onChange 後に input.value をリセットし同一ファイル再選択を許容  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/hooks/useImportRulesJson.ts                                     │ │
│  │     - container から IImportRulesJsonControllerFactory を解決        │ │
│  │     - useMemo 内で factory.create(onSuccess, onError) を 1 回だけ呼ぶ │ │
│  │     - onSuccess/onError コールバック内で isImporting / importError /  │ │
│  │       importSuccess の state を更新、成功時は onRulesChanged を呼ぶ   │ │
│  │     - handleFileSelect が Controller.importRulesJson(file) を呼ぶ    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     interface-adapters/ (第3層)                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ factories/ImportRulesJsonControllerFactory                         │ │
│  │ (ADR-005: ReactコールバックをPresenterに注入するためのFactory)       │ │
│  │                                                                    │ │
│  │  - repository / jsonParser / fileTextReader を保持                  │ │
│  │  - create(onSuccess, onError) を呼ぶと内部で                        │ │
│  │    * IImportRulesJsonPresenter を実装する無名オブジェクトを生成     │ │
│  │    * ImportRulesJsonInteractor を new                               │ │
│  │    * importRulesJson(file) のみを持つ無名                            │ │
│  │      IImportRulesJsonController を返す                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ※ 他機能（Delete / Export / ToggleRuleActive）は Controller / Presenter  │
│    を独立クラスとして定義しているが、本機能はコードベース規模の観点から       │
│    Factory 内部の無名オブジェクトとして集約している。                        │
└──────────────────────────────────────────────────────────────────────────┘
                │                                │
                │ ImportRulesJsonInputData        │ IImportRulesJsonPresenter
                │ (file: File)                    │   .present(outputData)
                ▼                                │   .presentError(errorData)
┌──────────────────────────────────────────────────────────────────────────┐
│                   application-business-rules/ (第2層)                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ interactors/ImportRulesJsonInteractor                            │   │
│  │   - IImportRulesJsonUseCase を実装                                │   │
│  │   - 同ファイル内で IImportRulesJsonPresenter (Output Port) を定義  │   │
│  │                                                                  │   │
│  │ importRulesJson(inputData)                                       │   │
│  │   try {                                                          │   │
│  │     new ImportFileSize(file.size)          // A. サイズ検証       │   │
│  │     jsonString = fileTextReader.readAsText(file)   // B. 読み取り  │   │
│  │     parsed = jsonParser.parseAsObject(jsonString)  // C. JSON解析  │   │
│  │     new RulesJsonVersionSchema(parsed)     // D. version/schema   │   │
│  │     collection = new ImportRulesCollection(parsed.rules) // E. 件数 │ │
│  │     validatedRules = collection.toArray()                        │   │
│  │     currentRules  = repository.getAll()     // F. 現在件数         │   │
│  │     previousCount = currentRules.toArray().length                 │   │
│  │     repository.replaceAll(validatedRules)   // G. 原子的置換       │   │
│  │     presenter.present(                                            │   │
│  │       new ImportRulesJsonOutputData(                              │   │
│  │         validatedRules.length, previousCount))                    │   │
│  │   } catch (error) {                                               │   │
│  │     presenter.presentError(                                       │   │
│  │       ImportRulesJsonErrorOutputData.fromError(error))            │   │
│  │   }                                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    enterprise-business-rules/ (第1層)                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ entities/RewriteRule/RewriteRule.ts                              │   │
│  │   - ルールエンティティ（既存）                                      │   │
│  │   - static fromParams(id, params) が createRuleId(id) を通して     │   │
│  │     ID バリデーションを行う（不正 id: InvalidRuleIdError）          │   │
│  │ value-objects/ImportFileSize.ts                                  │   │
│  │   - コンストラクタで 5MB 超過を検査（ImportFileSizeError）          │   │
│  │ value-objects/RulesJsonVersionSchema.ts                          │   │
│  │   - version/rules の有無・型検査（InvalidRulesJsonSchemaError）     │   │
│  │   - version == "1.0" 検査（UnsupportedRulesJsonVersionError）      │   │
│  │ value-objects/ImportRulesCollection.ts                           │   │
│  │   - 0件（EmptyRulesCollectionError）/ 上限超過                     │   │
│  │     （RulesCollectionCountExceededError）を検査                    │   │
│  │   - 各要素を RewriteRule.fromParams() で構築                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

## クラス一覧（src 配下のプロダクションコード）

本セクションは src 配下の **実装クラス・インターフェース・エラー型** を層別に記載します。
E2E テスト関連のクラスは含めません。

### enterprise-business-rules (第1層)

| クラス / 型 | ファイル | 責務 |
|-----------|---------|------|
| RewriteRule | `entities/RewriteRule/RewriteRule.ts` | ルールエンティティ（既存）。`static fromParams(id, params)` でインポート入力を検証付きで構築する（`createRuleId(id)` による ID 検査を含む） |
| ImportFileSize | `value-objects/ImportFileSize.ts` | ファイルサイズの Value Object。定数 `MAX_IMPORT_FILE_SIZE_BYTES`（5MB）を保持。コンストラクタで `isExceedingLimit()` を呼び、超過時に `ImportFileSizeError` を throw する |
| ImportFileSizeError | `errors/ImportFileSizeError.ts` | ファイルサイズ超過エラー。メッセージ文字列（「ファイルサイズが上限（5MB）を超えています」）を EBR 層で保持 |
| RulesJsonVersionSchema | `value-objects/RulesJsonVersionSchema.ts` | スキーマ／バージョン検証 VO。コンストラクタで `isValidSchema()` → `isSupportedVersion()` を連続実行し、失敗時に対応エラーを throw する |
| InvalidRulesJsonSchemaError | 同上（同ファイル内宣言） | version/rules フィールドの欠落または型不正エラー |
| UnsupportedRulesJsonVersionError | 同上（同ファイル内宣言） | 未対応バージョンエラー（`"1.0"` 以外） |
| ImportRulesCollection | `value-objects/ImportRulesCollection.ts` | インポート対象のルール集合 VO。定数 `MAX_IMPORT_RULES_COUNT`（1000件）を保持。コンストラクタで 0件／上限超過を検査し、各要素を `RewriteRule.fromParams(id, params)` で構築する |
| EmptyRulesCollectionError | 同上（同ファイル内宣言） | ルール 0件エラー |
| RulesCollectionCountExceededError | 同上（同ファイル内宣言） | ルール件数上限超過エラー |
| InvalidRuleIdError | `errors/InvalidRuleIdError.ts` | Branded Type 由来の不正 ID エラー（`RewriteRule.fromParams` 内の `createRuleId` が throw する。本機能のインポート時にも発生し得る） |

### application-business-rules (第2層)

| クラス / 型 | ファイル | 責務 |
|-----------|---------|------|
| ImportRulesJsonInputData | `dto/input/ImportRulesJsonInputData.ts` | 入力 DTO。`file: File` のみを保持 |
| ImportRulesJsonOutputData | `dto/output/ImportRulesJsonOutputData.ts` | 成功時出力 DTO。`importedCount` / `previousCount` を保持 |
| ImportRulesJsonErrorOutputData | `dto/output/ImportRulesJsonErrorOutputData.ts` | エラー出力 DTO。`error` / `errorType ('parse' \| 'validation' \| 'storage')` / `message`（getter）を保持。`static fromError(error)` が Strategy Map によりエラー種別を `errorType` に写像する（未知のエラーは `StorageImportError` でラップ） |
| InvalidJsonImportError | `errors/ImportRulesJsonErrors.ts` | 「不正なJSONファイルです」 |
| InvalidSchemaImportError | 同上（同ファイル内宣言） | 「JSONスキーマが不正です（versionとrulesが必要です）」 |
| StorageImportError | 同上（同ファイル内宣言） | 「インポート処理中にエラーが発生しました: {cause}」。既知のエラー写像に無いものはここに集約する |
| JsonSyntaxError | `errors/JsonParserErrors.ts` | JSON 構文不正（`JsonParser.parse(AsObject)` が SyntaxError を包み直して throw） |
| JsonStructureError | 同上（同ファイル内宣言） | JSON ルートが非オブジェクト／配列／null のエラー（`parseAsObject` のみ使用） |
| IImportRulesJsonUseCase | `ports/input/IImportRulesJsonUseCase.ts` | Input Port。`importRulesJson(inputData): Promise<void>` を定義 |
| IImportRulesJsonPresenter | `interactors/ImportRulesJsonInteractor.ts`<br>（同ファイル内宣言） | Output Port。`present(output)` / `presentError(error)` の 2 メソッド構成。**他機能（Export/Delete/Toggle）の Presenter 型が `ports/output/` に定義されるのに対し、本機能は Interactor と同一ファイル内で宣言しており、`ports/output/` には配置されない** |
| IRewriteRuleRepository | `ports/gateway/IRewriteRuleRepository.ts` | Gateway Interface。`getAll()` / `replaceAll(rules)` を含む全 CRUD メソッドを定義。本機能では `getAll()` + `replaceAll(rules)` を使用 |
| IJsonParser | `ports/services/IJsonParser.ts` | Service Port。`parse<T>(jsonString)` / `parseAsObject(jsonString)` の 2 メソッド。本機能の Interactor は `parseAsObject` を使用 |
| IFileTextReader | `ports/services/IFileTextReader.ts` | Service Port。`readAsText(file): Promise<string>` |
| ImportRulesJsonInteractor | `interactors/ImportRulesJsonInteractor.ts` | UseCase 実装（`IImportRulesJsonUseCase`）。依存: `IRewriteRuleRepository`・`IImportRulesJsonPresenter`・`IJsonParser`・`IFileTextReader`。バリデーション→読み取り→JSON解析→一括置換→通知を 1 フェーズで実行 |

### interface-adapters (第3層)

| クラス / 型 | ファイル | 責務 |
|-----------|---------|------|
| IImportRulesJsonController | `factories/IImportRulesJsonControllerFactory.ts`<br>（同ファイル内宣言） | Controller インターフェース。`importRulesJson(file): Promise<void>` のみ。**Delete/Export/Toggle と違い、独立した `controllers/` ファイルを持たず、Factory 定義ファイル内で併置される** |
| ImportSuccessCallback / ImportErrorCallback | 同上 | `(formattedMessage: string) => void` 型のエイリアス。Factory の create 引数型 |
| IImportRulesJsonControllerFactory | 同上 | Controller を生成する Factory のインターフェース（ADR-005） |
| ImportRulesJsonControllerFactory | `factories/ImportRulesJsonControllerFactory.ts` | Factory 実装。`create(onSuccess, onError)` で以下を生成する:<br>(1) `IImportRulesJsonPresenter` を実装する無名オブジェクト（`onSuccess`/`onError` コールバックを呼び出すだけの薄いラッパー）<br>(2) `ImportRulesJsonInteractor` を new<br>(3) `importRulesJson(file)` のみを持つ **無名 Controller** を return |
| RewriteRuleMapper | `mappers/RewriteRuleMapper.ts` | Entity ↔ DTO 変換（既存）。**本機能のページコンテキストでは使用しない**。Popup / 一般の CRUD ルートで利用される |

> **本機能で独立 Controller / Presenter クラスを持たない理由**<br>
> Factory が生成するインスタンスは `importRulesJson` 1 メソッドのみの薄い Adapter であり、Presenter も `onSuccess/onError` への委譲のみを行う。独立クラスにするより Factory 内部に集約した方が記述量と配線コストが小さいため、現実装では無名オブジェクトで構成している。

### frameworks-and-drivers (第4層)

| クラス / 型 | ファイル | 責務 |
|-----------|---------|------|
| ImportButton | `ui/components/atoms/ImportButton/ImportButton.tsx` | UI コンポーネント。hidden `<input type="file" accept=".json">` を内包し、ボタンクリックで発火。`disabled` で操作制御。onChange 後に value をリセットし同一ファイル再選択を許容 |
| UploadIcon | `ui/components/atoms/ImportButton/UploadIcon.tsx` | ImportButton 用の SVG アイコン |
| ToastNotification | `ui/components/atoms/ToastNotification.tsx` | トースト通知（既存） |
| ImportRulesJsonUI | `ui/components/organisms/ImportRulesJsonUI/ImportRulesJsonUI.tsx` | Organism。ImportButton + 成功/エラーの 2 つの ToastNotification を統合。`onImportClick` / `isImporting` / `importError` / `importSuccess` / `onDismissError` / `onDismissSuccess` を props で受け取る |
| RulesApp | `ui/pages/rules/RulesApp.tsx` | View。`useImportRulesJson(onRulesChanged)` を呼び ImportRulesJsonUI に state と dismiss 系ハンドラを渡す。成功時は `refreshKey` を進めて一覧再取得 |
| useImportRulesJson | `ui/hooks/useImportRulesJson.ts` | カスタムフック。Controller を useMemo で 1 回だけ生成。`isImporting` / `importError` / `importSuccess` の state と `handleFileSelect` / `dismissImportError` / `dismissImportSuccess` を返す |
| JsonParser | `Json/JsonParser.ts` | `IJsonParser` の実装。`JSON.parse` をラップし構文不正を `JsonSyntaxError`、非オブジェクト/配列/null を `JsonStructureError` に変換する |
| FileTextReader | `File/FileTextReader.ts` | `IFileTextReader` の実装。`FileReader.readAsText` を Promise ラップしブラウザ API 依存を F&D 層に閉じ込める |
| DexieRewriteRuleRepository | `persistence/DexieRewriteRuleRepository.ts` | `IRewriteRuleRepository` の実装（既存）。**ページコンテキストの DI では本クラスが直接使用される**。`replaceAll(rules)` は Dexie のトランザクション内で `clear()` → `bulkAdd()` を原子的に実行し、失敗時は自動ロールバックする |

## アーキテクチャ補足

### 責務分離の原則

| コンポーネント | 責務 | 備考 |
|---------------|------|------|
| IRewriteRuleRepository | データ永続化のみ | `replaceAll(rules)`（原子的置換）を追加。本機能はページコンテキストで DexieRewriteRuleRepository を直接呼ぶ |
| ImportRulesJsonInteractor | ワークフロー調整 | 検証→読み取り→解析→件数検証→取得→置換→通知 |
| EBR Value Objects | ドメインルールの表現 | サイズ上限・スキーマ／バージョン検証・ルール件数検査をコンストラクタで強制（不正入力はエラー throw） |
| Presenter（無名実装） | View 通知のみ | onSuccess/onError コールバックへの委譲 |
| View (RulesApp) | ボタン状態管理 | `isImporting` による重複防止（`ImportButton.disabled`） |
| Hook (useImportRulesJson) | 状態管理・エントリポイント | handleFileSelect が Controller を呼び、onSuccess/onError で state を更新 |

### 1フェーズ制御フロー

インポートはファイル選択から完了まで 1 フェーズで実行される（プレビュー確認なし）:

```text
Phase 1: ファイル選択 → バリデーション → 読み取り → 解析 → 一括置換 → 通知
  ImportButton クリック
    → hidden <input type="file"> 発火
    → useImportRulesJson.handleFileSelect(file)
    → Controller.importRulesJson(file)
    → Interactor.importRulesJson(inputData)
        A. new ImportFileSize(file.size)                   // 5MB 検査
        B. fileTextReader.readAsText(file)                 // F&D 経由
        C. jsonParser.parseAsObject(jsonString)            // F&D 経由
        D. new RulesJsonVersionSchema(parsed)              // schema/version 検査
        E. new ImportRulesCollection(parsed.rules)         // 件数＋各要素検証
        F. repository.getAll()                             // previousCount 取得
        G. repository.replaceAll(validatedRules)           // 原子的置換
        → Presenter.present(OutputData) or .presentError(ErrorOutputData)
    → Hook(onSuccess): isImporting=false + successToast + onRulesChanged()
    → Hook(onError):   isImporting=false + errorToast
```

### Presenter 設計（2 コールバック構成）

ADR-005 Factory パターン準拠。エクスポートと同様の 2 コールバック構成（プレビュー廃止により整合）:

```typescript
// interactors/ImportRulesJsonInteractor.ts 内で定義
export interface IImportRulesJsonPresenter {
  present(output: ImportRulesJsonOutputData): void;           // onSuccess
  presentError(error: ImportRulesJsonErrorOutputData): void;  // onError
}
```

Factory は create() の度に以下の無名実装を生成する:

```typescript
const presenter: IImportRulesJsonPresenter = {
  present(output) {
    onSuccess(`${output.importedCount}件のルールをインポートしました`);
  },
  presentError(errorData) {
    onError(errorData.message);
  },
};
```

### IRewriteRuleRepository インターフェース変更あり（replaceAll 追加）

インポート処理は `replaceAll` による原子的置換で実現する:

```text
getAll()          → 全件取得（previousCount 算出用）
replaceAll(rules) → 全件原子的置換（Dexie.transaction('rw') + clear + bulkAdd）
```

Chrome 拡張のルール件数規模での一貫性を保証するため、`delete/create` ループの代わりにトランザクション保護付きの `replaceAll` を採用。

### エラーハンドリングの責務配置

| 層 | 責務 |
|----|------|
| EBR Value Object（`ImportFileSize` / `RulesJsonVersionSchema` / `ImportRulesCollection`） | ドメイン不変条件の違反を該当エラー型で throw する |
| F&D `JsonParser` | ブラウザ `SyntaxError` を `JsonSyntaxError` に、非オブジェクトを `JsonStructureError` に変換する |
| Interactor | 上記 throw を `try/catch` で捕捉し、`ImportRulesJsonErrorOutputData.fromError(error)` を介して Presenter へ渡す |
| Presenter | `errorData.message` を `onError` コールバックに渡す |
| Hook → View | `importError` state に反映しエラートーストを表示 |

### エラーメッセージ設計

`ImportRulesJsonErrorOutputData.fromError` の Strategy Map により、実装レベルの例外は以下のユーザー向けメッセージへ写像される:

| エラー種別（実装） | 写像先エラー / errorType | 表示メッセージ |
|------|-----|------|
| `JsonSyntaxError` | `InvalidJsonImportError` / `'parse'` | 「不正なJSONファイルです」 |
| `JsonStructureError` | `InvalidSchemaImportError` / `'validation'` | 「JSONスキーマが不正です（versionとrulesが必要です）」 |
| `ImportFileSizeError` | そのまま / `'validation'` | 「ファイルサイズが上限（5MB）を超えています ({bytes} bytes)」 |
| `InvalidRulesJsonSchemaError` | `InvalidSchemaImportError` / `'validation'` | 「JSONスキーマが不正です（versionとrulesが必要です）」 |
| `UnsupportedRulesJsonVersionError` | そのまま / `'validation'` | 「未対応のバージョンです: X.X」 |
| `EmptyRulesCollectionError` | そのまま / `'validation'` | 「インポートするルールがありません」 |
| `RulesCollectionCountExceededError` | そのまま / `'validation'` | 「ルール件数が上限（1000件）を超えています」 |
| `InvalidRuleIdError` | そのまま / `'validation'` | InvalidRuleIdError の message 文字列 |
| 上記以外 | `StorageImportError` ラップ / `'storage'` | 「インポート処理中にエラーが発生しました: {cause.message}」 |

### エクスポート機能との対称性

| 観点 | エクスポート（PR#393） | インポート（本機能） |
|------|----------------------|-------------------|
| ボタン名 | エクスポート | インポート |
| アイコン | DownloadIcon | UploadIcon |
| Atom | ExportButton | ImportButton |
| Hook | useExportRulesJson | useImportRulesJson |
| Controller 配置 | 独立クラス（`controllers/ExportRulesJsonController`） | **Factory 内の無名オブジェクト** |
| Presenter 配置 | 独立クラス + Output Port（`presenters/` + `ports/output/`） | **Factory 内の無名オブジェクト + Interactor ファイル内の Output Port** |
| Interactor | ExportRulesJsonInteractor | ImportRulesJsonInteractor |
| Presenter コールバック | onSuccess, onError | onSuccess, onError |
| Repository 操作 | `getAll()` | `getAll()`, `replaceAll()` |

## クラス図

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       enterprise-business-rules/                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RewriteRule (entities/RewriteRule/RewriteRule.ts)                   │   │
│  │ ─────────────────────────────────────────────────────────────────── │   │
│  │ + id: RuleId (branded)                                              │   │
│  │ + oldString / newString / urlPattern / isRegex / isActive           │   │
│  │ + static fromParams(id: unknown, params: RewriteRuleParams)         │   │
│  │   → createRuleId(id) が不正値に対し InvalidRuleIdError を throw      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ImportFileSize (value-objects/ImportFileSize.ts)                    │   │
│  │ ─────────────────────────────────────────────────────────────────── │   │
│  │ - byteSize: number                                                  │   │
│  │ + isExceedingLimit(): boolean                                       │   │
│  │ [const] MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024                │   │
│  │ コンストラクタで超過時 ImportFileSizeError を throw                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RulesJsonVersionSchema (value-objects/RulesJsonVersionSchema.ts)    │   │
│  │ ─────────────────────────────────────────────────────────────────── │   │
│  │ - data: Record<string, unknown>                                     │   │
│  │ + isValidSchema(): boolean                                          │   │
│  │ + isSupportedVersion(): boolean                                     │   │
│  │ [const] SUPPORTED_RULES_JSON_VERSION = "1.0"                        │   │
│  │ 同ファイル宣言: InvalidRulesJsonSchemaError,                         │   │
│  │                 UnsupportedRulesJsonVersionError                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ImportRulesCollection (value-objects/ImportRulesCollection.ts)      │   │
│  │ ─────────────────────────────────────────────────────────────────── │   │
│  │ - _rules: RewriteRule[]                                             │   │
│  │ + toArray(): RewriteRule[]                                          │   │
│  │ [const] MAX_IMPORT_RULES_COUNT = 1000                               │   │
│  │ 同ファイル宣言: EmptyRulesCollectionError,                           │   │
│  │                 RulesCollectionCountExceededError                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ImportFileSizeError (errors/ImportFileSizeError.ts)                 │   │
│  │ InvalidRuleIdError (errors/InvalidRuleIdError.ts)                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       application-business-rules/                           │
│  ┌────────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │ ImportRulesJsonInputData   │  │ <<interface>>                          │ │
│  │ ─────────────────────────  │  │ IImportRulesJsonUseCase                │ │
│  │ + file: File               │  │ + importRulesJson(inputData): Promise │ │
│  └────────────────────────────┘  └───────────────────▲──────────────────┘ │
│                                                      │ implements           │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ImportRulesJsonInteractor                                            │ │
│  │ ─────────────────────────────────────────────────────────────────── │ │
│  │ - repository: IRewriteRuleRepository                                 │ │
│  │ - presenter:  IImportRulesJsonPresenter                              │ │
│  │ - jsonParser: IJsonParser                                            │ │
│  │ - fileTextReader: IFileTextReader                                    │ │
│  │ ─────────────────────────────────────────────────────────────────── │ │
│  │ + importRulesJson(inputData): Promise<void>                          │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ ← 同一ファイル内宣言                  │
│  │ <<interface>> IImportRulesJsonPresenter                              │    │
│  │ + present(output: ImportRulesJsonOutputData): void                   │    │
│  │ + presentError(error: ImportRulesJsonErrorOutputData): void          │    │
│  └────────────────────────────────────┘                                      │
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐    │
│  │ ImportRulesJsonOutputData    │  │ ImportRulesJsonErrorOutputData   │    │
│  │ ──────────────────────────── │  │ ────────────────────────────────│    │
│  │ + importedCount: number      │  │ + error: unknown                 │    │
│  │ + previousCount: number      │  │ + errorType: 'parse'             │    │
│  │                              │  │             | 'validation'       │    │
│  │                              │  │             | 'storage'          │    │
│  │                              │  │ + message: string (getter)       │    │
│  │                              │  │ + static fromError(error)        │    │
│  │                              │  │   Strategy Map で errorType 決定 │    │
│  └──────────────────────────────┘  └──────────────────────────────────┘    │
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐    │
│  │ <<interface>>                │  │ <<interface>>                    │    │
│  │ IJsonParser                  │  │ IFileTextReader                  │    │
│  │ + parse<T>(s): T             │  │ + readAsText(file): Promise<str> │    │
│  │ + parseAsObject(s):          │  │                                  │    │
│  │   Record<string, unknown>    │  │                                  │    │
│  └──────────────────────────────┘  └──────────────────────────────────┘    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ <<interface>> IRewriteRuleRepository                                 │  │
│  │ ────────────────────────────────────────────────────────────────── │  │
│  │ + create / update / delete / getAll / getById / getRulesMatchingUrl │  │
│  │ + replaceAll(rules): Promise<void>   // 本機能で追加                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  errors:                                                                    │
│    JsonSyntaxError / JsonStructureError (JsonParserErrors.ts)               │
│    InvalidJsonImportError / InvalidSchemaImportError / StorageImportError   │
│      (ImportRulesJsonErrors.ts)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          interface-adapters/                                │
│                                                                             │
│  ┌────────────────────────────────────┐  ┌────────────────────────────┐    │
│  │ <<interface>>                      │  │ <<interface>>              │    │
│  │ IImportRulesJsonControllerFactory  │  │ IImportRulesJsonController │    │
│  │ ────────────────────────────────── │  │ ────────────────────────── │    │
│  │ + create(onSuccess, onError):      │  │ + importRulesJson(         │    │
│  │   IImportRulesJsonController       │  │   file: File): Promise     │    │
│  └──────────▲─────────────────────────┘  └──────────▲─────────────────┘    │
│             │ implements             (※Factory内の無名実装が返される) │    │
│  ┌──────────┴─────────────────────────┐                                     │
│  │ ImportRulesJsonControllerFactory   │                                     │
│  │ ────────────────────────────────── │                                     │
│  │ - repository / jsonParser /        │                                     │
│  │   fileTextReader                   │                                     │
│  │ ────────────────────────────────── │                                     │
│  │ + create(onSuccess, onError):      │                                     │
│  │   1. 無名 Presenter オブジェクト   │                                     │
│  │      （present / presentError）     │                                     │
│  │   2. new ImportRulesJsonInteractor │                                     │
│  │      (repo, presenter, jp, ftr)    │                                     │
│  │   3. 無名 Controller               │                                     │
│  │      { importRulesJson(file) => … }│                                     │
│  └────────────────────────────────────┘                                     │
│                                                                             │
│  ※ 独立 Controller / Presenter クラスは存在しない                           │
│     （Delete/Export/Toggle とは異なる配置。詳細は「クラス一覧」脚注参照）     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          frameworks-and-drivers/                            │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │ ImportButton                │    │ ImportRulesJsonUI            │        │
│  │ ─────────────────────────── │    │ ─────────────────────────── │        │
│  │ + onFileSelect: (f) => void │    │ + onImportClick: (f) => void │        │
│  │ + disabled?: boolean        │    │ + isImporting: boolean       │        │
│  │ （hidden <input file> 内包）│    │ + importError / importSuccess│        │
│  └─────────────────────────────┘    │ + onDismissError/Success     │        │
│  ┌─────────────────────────────┐    └─────────────────────────────┘        │
│  │ UploadIcon / ToastNotification / RulesApp / useImportRulesJson    │     │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │ JsonParser (IJsonParser)    │    │ FileTextReader              │        │
│  │ - parse / parseAsObject     │    │ (IFileTextReader)           │        │
│  └─────────────────────────────┘    └─────────────────────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DexieRewriteRuleRepository (IRewriteRuleRepository)                 │   │
│  │  + replaceAll(rules) は Dexie.transaction('rw') で                   │   │
│  │    clear() → bulkAdd() を原子的に実行                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 影響ドキュメント

- [ルール一覧 UI設計](../../ui.md) - インポートボタンの追加

## 関連ドキュメント

- [ルールJSONエクスポート機能](../export-rules-json/) - 対称機能
- [ルール削除機能](../delete-rule/) - 先行機能(同様のアーキテクチャ)
- [ADR-001: Clean Architecture with Presenter Pattern](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)
- [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)
- [ADR-005: ReactコールバックをPresenterに注入するためのFactoryパターン採用](../../../../../adr/005-factory-pattern-for-react-callback-injection.md)
