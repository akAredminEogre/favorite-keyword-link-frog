---
codd:
  node_id: "design:design-pages-rule-list-features-export-rules-json-01-class-design"
  type: design
---

# クラス設計

## 制御フロー

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                     frameworks-and-drivers/ (第4層)                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/pages/rules/RulesApp.tsx (View)                                 │ │
│  │     - エクスポートボタンクリックを受け取る                            │ │
│  │     - ルール0件時はボタンを無効化                                    │ │
│  │     - isExportingフラグで重複実行を防止                              │ │
│  │     - Controllerを呼び出す                                          │ │
│  │     - Presenterからの成功/エラー通知を反映                           │ │
│  │     - エラー時はトースト通知を表示                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/components/atoms/ExportButton/ExportButton.tsx                  │ │
│  │     - エクスポートアイコン付きボタンを表示                            │ │
│  │     - disabled時(ルール0件 or エクスポート中)はグレーアウト           │ │
│  │     - クリックイベントを親に通知                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     interface-adapters/ (第3層)                          │
│  ┌──────────────────────────┐    ┌──────────────────────────┐          │
│  │ controllers/rule/        │    │ presenters/rule/         │          │
│  │ ExportRulesJson          │    │ ExportRulesJson          │          │
│  │ Controller               │    │ Presenter                │          │
│  │                          │    │                          │          │
│  │ - InputDataを生成         │    │ - OutputDataを受け取る    │          │
│  │ - UseCaseを呼び出す       │    │ - 成功時: ダウンロード    │          │
│  │                          │    │ - 失敗時: エラーを通知    │          │
│  └────────────┬─────────────┘    └──────────▲───────────────┘          │
└───────────────┼──────────────────────────────┼──────────────────────────┘
                │ InputData                    │ OutputData
                ▼                              │
┌──────────────────────────────────────────────────────────────────────────┐
│                   application-business-rules/ (第2層)                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ interactors/rule/ExportRulesJsonInteractor                       │   │
│  │ ※ Rules Pageコンテキストで実行                                     │   │
│  │                                                                  │   │
│  │ - Repositoryから全ルール取得(messaging経由でBackground Scriptへ)  │   │
│  │ - エクスポート用JSON構造を構築(メタデータ+ルール配列)               │   │
│  │ - ファイル名を生成(frog-frame-front-rules-YYYYMMDD_hhmmss.json)   │   │
│  │ - OutputDataを作成してPresenterに渡す                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    enterprise-business-rules/ (第1層)                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ entities/RewriteRule/RewriteRule.ts                               │   │
│  │                                                                  │   │
│  │ - エクスポート対象のルールエンティティ                               │   │
│  │ - IDを含む全属性をエクスポートに使用                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

## クラス一覧

### enterprise-business-rules (第1層)

| クラス | 責務 |
|--------|------|
| RewriteRule | ルールエンティティ。エクスポート対象のIDを含む全属性を保持(既存、変更なし) |

### application-business-rules (第2層)

| クラス | 責務 |
|--------|------|
| ExportRulesJsonInputData | 入力DTO。パラメータなし(全ルールエクスポートのため) |
| ExportRulesJsonOutputData | 出力DTO。エクスポート用JSON文字列とファイル名を保持 |
| ExportRulesJsonErrorOutputData | エラー出力DTO。エラーメッセージを保持 |
| IExportRulesJsonUseCase | Input Port。エクスポート処理のインターフェース |
| IExportRulesJsonPresenter | Output Port。結果通知のインターフェース |
| ExportRulesJsonInteractor | UseCase実装。全ルール取得・JSON構築・Presenter通知を実行 |
| IRewriteRuleRepository | Gateway Interface。ルール永続化(既存、getAll()使用) |

### interface-adapters (第3層)

| クラス | 責務 |
|--------|------|
| IExportRulesJsonController | Controllerのインターフェース。Factoryの戻り値型として使用(ADR-005参照) |
| ExportRulesJsonController | IExportRulesJsonControllerの実装。UseCaseを呼び出す |
| IExportRulesJsonControllerFactory | Controllerを生成するFactoryのインターフェース。ReactコールバックをPresenterに注入(ADR-005参照) |
| ExportRulesJsonControllerFactory | IExportRulesJsonControllerFactoryの実装 |
| ExportRulesJsonPresenter | OutputDataをViewに通知(成功時: ダウンロード実行、エラー時: エラー表示) |
| RewriteRuleMapper | Entity ↔ DTO 変換(既存、getAll()使用) |
| IRewriteRuleMessagingPort | MessagingService の抽象化(既存、getAll()使用) |

### frameworks-and-drivers (第4層)

| クラス | 責務 |
|--------|------|
| ChromeRuntimeRewriteRuleRepository | IRewriteRuleRepositoryの実装。Mapperへの委譲のみ(既存、getAll()使用、ADR-002参照) |
| RewriteRuleMessagingService | IRewriteRuleMessagingPort を実装。proxy-service 経由で DTO を送受信(既存、getAll()使用、ADR-002参照) |
| IRewriteRuleProxyService | proxy-service のインターフェース(既存、ADR-002参照) |
| RewriteRuleProxyService | proxy-service定義(既存、ADR-002参照) |
| RewriteRuleProxyServiceImpl | IRewriteRuleProxyService の実装。Background Script 専用(既存、ADR-002参照) |
| DexieRewriteRuleRepository | IndexedDBデータアクセス(Background Script用、既存、ADR-003参照) |
| ExportButton | UIコンポーネント。エクスポートボタン。disabled propで操作制御 |
| ToastNotification | UIコンポーネント。トースト通知(既存) |
| RulesApp | View。ルール一覧画面。isExportingフラグでエクスポート中の重複実行を防止(既存、変更対象) |
| useExportRulesJson | カスタムフック。useMemoによるController初期化・isExporting状態管理・onSuccessコールバック(Blob生成→ダウンロード実行)を担う |

## アーキテクチャ補足

### 責務分離の原則

| コンポーネント | 責務 | 備考 |
|---------------|------|------|
| IRewriteRuleRepository | データ永続化のみ | 既存のgetAll()を使用 |
| Interactor | ワークフロー調整 | ルール取得→JSON構築→Presenter通知 |
| Presenter | View通知のみ | ダウンロードはReactコールバック経由 |
| View (RulesApp) | ボタン状態管理 | isExportingによる重複防止 |
| Hook (useExportRulesJson) | ファイルダウンロード実行 | onSuccessコールバック内でBlob生成→URL.createObjectURL→aタグクリック→URL.revokeObjectURL |

### エクスポートJSONフォーマット(Interactorの責務)

JSON構造の定義はビジネスロジックであるため、Interactorが構築する。

IDを含む全属性をエクスポートする(バックアップ・リストア用途、00-overview.md準拠)。

### ファイルダウンロードの責務配置

ファイルダウンロードはUI層(Hook)の責務とする:

- Blob生成とダウンロードトリガーはブラウザAPI操作
- Presenterはコールバック(`triggerDownload`)を呼び出してJSON文字列とファイル名を通知する
- このコールバックはHook(`useExportRulesJson`)の`onSuccess`として定義され、Factory経由でPresenterに注入される(ADR-005)
- 実行コンテキストはHook内: Blob生成→URL.createObjectURL→aタグクリック→URL.revokeObjectURL
- シーケンス図上は`Presenter → Hook : triggerDownload`と表現され、HookのonSuccessコールバックが実行される

```text
[エクスポートボタンクリック]
      ↓
[View → Controller → Interactor]
      ↓
[Interactor: 全ルール取得 → JSON構築]
      ↓
[Interactor → Presenter → View]
      ↓
[Hook: Blob生成 → ダウンロード実行]
```

### エラーハンドリングの責務配置

| 層 | 責務 |
|----|------|
| Interactor | 例外をキャッチし、ExportRulesJsonErrorOutputDataを作成してPresenterに渡す |
| Presenter | ErrorOutputDataをViewに通知 |
| View | トースト通知でユーザーに表示 |

### エラーメッセージ設計

| エラー種別 | 発生条件 | 表示メッセージ |
|-----------|---------|---------------|
| ルール取得失敗 | Repository.getAll()が失敗 | 「エクスポート処理中にエラーが発生しました: {error.message}」 |
| ダウンロード失敗 | Blob生成・ダウンロードトリガーが失敗 | 「エクスポート処理中にエラーが発生しました: {error.message}」 |

### Chrome拡張機能のコンテキスト分離

> **参照**: [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
> **参照**: [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)

既存のgetAll()フローを使用する。新規のmessaging追加は不要。

```text
┌─────────────────────────────────────────────────────────────────┐
│ Rules Page                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ RulesApp                                                     ││
│  │   ↓ エクスポートボタンクリック                                  ││
│  │ ExportRulesJsonController → ExportRulesJsonInteractor        ││
│  │                              ↓                              ││
│  │              IRewriteRuleRepository.getAll()                ││
│  │                              ↓                              ││
│  │              ChromeRuntimeRewriteRuleRepository             ││
│  │              (Mapperへの委譲のみ、DTOを意識しない)           ││
│  │                              ↓                              ││
│  │              RewriteRuleMapper                              ││
│  │              (Entity ↔ DTO変換 + IRewriteRuleMessagingPort) ││
│  │                              ↓                              ││
│  │              IRewriteRuleMessagingPort                      ││
│  │                              ↓                              ││
│  │              RewriteRuleMessagingService                    ││
│  │              (IRewriteRuleMessagingPort実装)                ││
│  │                              ↓                              ││
│  │              getRewriteRuleProxyService()                   ││
│  │                                                             ││
│  │ ExportRulesJsonPresenter → RulesApp                        ││
│  │   ↓ 成功: JSONダウンロード実行                                ││
│  │   ↓ 失敗: ToastNotification表示                              ││
│  └──────────────────────────────┬──────────────────────────────┘│
└─────────────────────────────────┼───────────────────────────────┘
                                  │ proxy-service (DTO)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Background Script                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ RewriteRuleProxyService (実装注入パターン)                   ││
│  │       ↓                                                     ││
│  │ DexieRewriteRuleRepository.getAll() (IndexedDB)             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### ドメインロジックの配置原則

> **参照**: [ADR-001: Clean Architecture Presenter付きパターン採用](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)

| ロジック | 配置先 | 実装 |
|---------|--------|------|
| ルールのID含む全属性保持 | `enterprise-business-rules` | `RewriteRule`(既存) |
| エクスポートJSON構築 | `application-business-rules` | `ExportRulesJsonInteractor` |
| ファイルダウンロード | `frameworks-and-drivers` | Hook内のブラウザAPI操作 |

## クラス図

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       enterprise-business-rules/                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RewriteRule                                                         │   │
│  │ ─────────────────────────────────────────────────────────────────── │   │
│  │ + id: number                                                        │   │
│  │ + oldString: string                                                 │   │
│  │ + newString: string                                                 │   │
│  │ + urlPattern: string                                                │   │
│  │ + isRegex: boolean                                                  │   │
│  │ + isActive: boolean                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       application-business-rules/                           │
│                                                                             │
│  ┌─────────────────────────────┐    ┌──────────────────────────────────┐   │
│  │ <<interface>>               │    │ <<interface>>                    │   │
│  │ IExportRulesJsonUseCase     │    │ IExportRulesJsonPresenter        │   │
│  │ ─────────────────────────── │    │ ────────────────────────────── │   │
│  │ + execute(input)            │    │ + present(output)               │   │
│  └──────────▲──────────────────┘    │ + presentError(errorData)       │   │
│             │                       └───────────▲──────────────────────┘   │
│             │ implements                        │ uses                     │
│             │                                   │                          │
│  ┌──────────┴───────────────────────────────────┴───────────┐              │
│  │ ExportRulesJsonInteractor                                │              │
│  │ ──────────────────────────────────────────────────────── │              │
│  │ - repository: IRewriteRuleRepository                     │              │
│  │ - presenter: IExportRulesJsonPresenter                    │              │
│  │ ──────────────────────────────────────────────────────── │              │
│  │ + execute(inputData): Promise<void>                      │              │
│  └──────────────────────────────────────────────────────────┘              │
│                                                                             │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌──────────────────────┐ │
│  │ ExportRulesJson       │  │ ExportRulesJson        │  │ ExportRulesJson     │ │
│  │ InputData             │  │ OutputData             │  │ ErrorOutputData     │ │
│  │ ───────────────────── │  │ ────────────────────── │  │ ─────────────────── │ │
│  │ (パラメータなし)       │  │ + jsonContent: string  │  │ + message: string   │ │
│  │                       │  │ + fileName: string     │  │                     │ │
│  └───────────────────────┘  └────────────────────────┘  └──────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────┐                                           │
│  │ <<interface>>               │                                           │
│  │ IRewriteRuleRepository      │                                           │
│  │ ─────────────────────────── │                                           │
│  │ + getAll(): Promise<Rules>  │                                           │
│  └─────────────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          interface-adapters/                                │
│                                                                             │
│  ┌────────────────────────────────────┐  ┌────────────────────────────┐    │
│  │ <<interface>>                      │  │ <<interface>>              │    │
│  │ IExportRulesJsonControllerFactory  │  │ IExportRulesJsonController │    │
│  │ ────────────────────────────────── │  │ ────────────────────────── │    │
│  │ + create(onSuccess,               │  │ + exportRulesJson()        │    │
│  │   onError): IExportRules...       │  └──────────▲─────────────────┘    │
│  └──────────▲─────────────────────────┘             │ implements           │
│             │ implements                            │                      │
│  ┌──────────┴─────────────────────────┐  ┌──────────┴─────────────────┐    │
│  │ ExportRulesJsonControllerFactory   │  │ ExportRulesJsonController  │    │
│  │ ────────────────────────────────── │  │ ────────────────────────── │    │
│  │ - repository: IRewriteRule...      │  │ - useCase: IExportRules... │    │
│  │ ────────────────────────────────── │  │ ────────────────────────── │    │
│  │ + create(onSuccess,               │  │ + exportRulesJson()        │    │
│  │   onError): IExportRules...       │  └────────────────────────────┘    │
│  └────────────────────────────────────┘                                    │
│                                          ┌────────────────────────────┐    │
│                                          │ ExportRulesJsonPresenter   │    │
│                                          │ ────────────────────────── │    │
│                                          │ - triggerDownload: Func    │    │
│                                          │ - showErrorInView: Func    │    │
│                                          │ ────────────────────────── │    │
│                                          │ + present(outputData)      │    │
│                                          │ + presentError(errorData)  │    │
│                                          └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          frameworks-and-drivers/                            │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │ ExportButton                │    │ ToastNotification           │        │
│  │ ─────────────────────────── │    │ ─────────────────────────── │        │
│  │ + onClick: () => void       │    │ + message: string           │        │
│  │ + disabled?: boolean        │    │ + type: 'error' | ...       │        │
│  └─────────────────────────────┘    │ + isVisible: boolean        │        │
│                                     └─────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 影響ドキュメント

- [ルール一覧 UI設計](../../ui.md) - エクスポートボタンの追加

## 関連ドキュメント

- [ルール削除機能](../delete-rule/) - 先行機能(同様のアーキテクチャ)
- [ルールトグル機能](../toggle-rule-active/) - 先行機能(同様のアーキテクチャ)
- [ADR-001: Clean Architecture with Presenter Pattern](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)
- [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)
- [ADR-005: ReactコールバックをPresenterに注入するためのFactoryパターン採用](../../../../../adr/005-factory-pattern-for-react-callback-injection.md)
