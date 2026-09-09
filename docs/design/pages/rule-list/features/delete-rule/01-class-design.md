---
codd:
  node_id: "design:design-pages-rule-list-features-delete-rule-01-class-design"
  type: design
---

# クラス設計

## 制御フロー

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                     frameworks-and-drivers/ (第4層)                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/pages/rules/RulesApp.tsx (View)                                 │ │
│  │     - ゴミ箱アイコンクリックを受け取る                                │ │
│  │     - 確認ダイアログを表示                                           │ │
│  │     - 確認後、Controllerを呼び出す                                   │ │
│  │     - Presenterからの更新を反映                                      │ │
│  │     - エラー時はトースト通知を表示                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/components/atoms/DeleteButton/DeleteButton.tsx                  │ │
│  │     - ゴミ箱アイコンを表示                                           │ │
│  │     - クリックイベントを親に通知                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ui/components/organisms/ConfirmDialog/ConfirmDialog.tsx            │ │
│  │     - 確認メッセージを表示                                           │ │
│  │     - 「削除」「キャンセル」ボタンを表示                               │ │
│  │     - ユーザーの選択を親に通知                                        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     interface-adapters/ (第3層)                          │
│  ┌──────────────────────────┐    ┌──────────────────────────┐          │
│  │ controllers/rule/        │    │ presenters/rule/         │          │
│  │ DeleteRuleController     │    │ DeleteRulePresenter      │          │
│  │                          │    │                          │          │
│  │ - ruleIdを受け取る        │    │ - OutputDataを受け取る    │          │
│  │ - InputDataに変換         │    │ - 成功時: Viewの状態を更新│          │
│  │ - UseCaseを呼び出す       │    │ - 失敗時: エラーを通知    │          │
│  └────────────┬─────────────┘    └──────────▲───────────────┘          │
└───────────────┼──────────────────────────────┼──────────────────────────┘
                │ InputData                    │ OutputData
                ▼                              │
┌──────────────────────────────────────────────────────────────────────────┐
│                   application-business-rules/ (第2層)                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ interactors/rule/DeleteRuleInteractor                            │   │
│  │ ※ Rules Pageコンテキストで実行                                     │   │
│  │                                                                  │   │
│  │ - InputDataからruleIdを取得                                       │   │
│  │ - Repositoryからルール取得(messaging経由でBackground Scriptへ)    │   │
│  │ - Repositoryで削除(messaging経由でBackground Scriptへ)           │   │
│  │ - ITabsGatewayで該当タブをリロード(Rules Pageで直接実行)          │   │
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
│  │ - matchesUrl(): URLがルールのパターンに一致するか判定              │   │
│  │   (削除後のタブリロード判定に使用)                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

## クラス一覧

### enterprise-business-rules (第1層)

| クラス | 責務 |
|--------|------|
| RewriteRule | ルールエンティティ。`matchesUrl()`でURLマッチング判定(既存、ADR-001参照) |

### application-business-rules (第2層)

| クラス | 責務 |
|--------|------|
| DeleteRuleInputData | 入力DTO。削除対象ルールIDを保持 |
| DeleteRuleOutputData | 出力DTO。削除成功時の削除されたルールIDを保持 |
| DeleteRuleErrorOutputData | エラー出力DTO。エラー発生時のruleIdとエラーメッセージを保持 |
| IDeleteRuleUseCase | Input Port。削除処理のインターフェース |
| IDeleteRulePresenter | Output Port。結果通知のインターフェース |
| DeleteRuleInteractor | UseCase実装。削除処理を実行 |
| IRewriteRuleRepository | Gateway Interface。ルール永続化(既存、delete()メソッド追加) |
| ITabsGateway | Gateway Interface。タブ操作(既存インターフェース、reloadMatchingTabs()使用) |

### interface-adapters (第3層)

| クラス | 責務 |
|--------|------|
| IDeleteRuleController | Controllerのインターフェース。Factoryの戻り値型として使用(ADR-005参照) |
| DeleteRuleController | IDeleteRuleControllerの実装。ユーザー入力をInputDataに変換 |
| IDeleteRuleControllerFactory | Controllerを生成するFactoryのインターフェース。ReactコールバックをPresenterに注入(ADR-005参照) |
| DeleteRuleControllerFactory | IDeleteRuleControllerFactoryの実装 |
| DeleteRulePresenter | OutputDataをViewに通知(成功/エラー) |
| RewriteRuleMapper | Entity ↔ DTO 変換(既存、delete操作追加) |
| IRewriteRuleMessagingPort | MessagingService の抽象化(既存、delete操作追加) |

### frameworks-and-drivers (第4層)

| クラス | 責務 |
|--------|------|
| ChromeRuntimeRewriteRuleRepository | IRewriteRuleRepositoryの実装。Mapperへの委譲のみ(DTOを意識しない)(Rules Page用、既存、delete追加、ADR-002参照) |
| RewriteRuleMessagingService | IRewriteRuleMessagingPort を実装。proxy-service 経由で DTO を送受信(既存、delete追加、ADR-002参照) |
| IRewriteRuleProxyService | proxy-service のインターフェース。RewriteRuleProxyService.ts で定義(既存、delete追加、ADR-002参照) |
| RewriteRuleProxyService | proxy-service として定義。defineProxyService() で register/get 関数を生成(既存、delete追加、ADR-002参照) |
| RewriteRuleProxyServiceImpl | IRewriteRuleProxyService の実装を生成。container 依存のため Background Script 専用(既存、delete追加、ADR-002 実装注入パターン) |
| DexieRewriteRuleRepository | IndexedDBデータアクセス。DTO ↔ DBレコード変換(Background Script用、既存、delete追加、ADR-003参照) |
| ChromeTabsGateway | ITabsGatewayの実装。`rule.matchesUrl()`でマッチング判定後、chrome.tabs APIでリロード(既存、ADR-001参照) |
| DeleteRuleRequestDTO | メッセージング用DTO。削除要求 `{ id }`(ADR-002、ADR-003参照) |
| DeleteButton | UIコンポーネント。ゴミ箱アイコンボタン。DeleteButtonコンポーネントの`disabled` propで操作制御 |
| ConfirmDialog | UIコンポーネント。確認ダイアログ |
| ToastNotification | UIコンポーネント。トースト通知 |
| RulesApp | View。ルール一覧画面。`deletingIds` で競合状態防止を管理(既存、変更対象) |
| RuleTableRow | Molecule。ルール行(既存、DeleteButton追加) |

## アーキテクチャ補足

### 責務分離の原則

本設計では以下の責務分離を徹底する：

| コンポーネント | 責務 | 備考 |
|---------------|------|------|
| IRewriteRuleRepository | データ永続化のみ | タブリロード等の副作用を含まない |
| ITabsGateway | タブ操作のみ | 永続化ロジックを含まない |
| Interactor | ワークフロー調整 | Repository削除後にTabsGatewayを呼び出す |
| View (RulesApp) | 確認ダイアログ表示、`deletingIds`による競合状態防止 | ダイアログはUI層の責務、連続操作を防止 |

これにより、Background Script 側の messaging 経由の delete は純粋なDB操作のみを行い、
タブリロードは Interactor が ITabsGateway を通じて明示的に制御する。

### 確認ダイアログの責務配置

確認ダイアログはUI層(View)の責務とする：
- ダイアログ表示はユーザーインタラクションの一部
- Controller呼び出し前にViewで確認を取る
- Interactorは確認済みの削除要求のみを受け取る

```text
[ゴミ箱クリック]
      ↓
[View: 確認ダイアログ表示]
      ↓ 「削除」選択
[View → Controller → Interactor]
      ↓
[削除処理実行]
```

### エラーハンドリングの責務配置

| 層 | 責務 |
|----|------|
| Interactor | 例外をキャッチし、DeleteRuleErrorOutputDataを作成してPresenterに渡す |
| Presenter | ErrorOutputDataをViewに通知 |
| View | トースト通知でユーザーに表示 |

### Chrome拡張機能のコンテキスト分離

> **参照**: [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
> **参照**: [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)

Rules Page は技術的には IndexedDB に直接アクセス可能だが、ADR-003 の決定に従い、
すべてのコンテキストからの DB アクセスは messaging 経由で Background Script に集約する。

また、ADR-002 に従い、メッセージングではドメインエンティティではなくDTOを送信する。
Entity ↔ DTO の変換と MessagingService への通信は RewriteRuleMapper クラスが担当する。
ChromeRuntimeRewriteRuleRepository は Mapper への委譲のみを行い、DTO を意識しない(ADR-002、ADR-003参照)。

依存性逆転のため、Mapper は IRewriteRuleMessagingPort インターフェースに依存し、
RewriteRuleMessagingService がこれを実装する。RewriteRuleMessagingService は内部で
RewriteRuleProxyService(proxy-service)を使用して Background Script と通信する(ADR-002参照)。

ADR-002 に従い、メッセージングには @webext-core/proxy-service を使用する。
また、proxy-service は実装注入パターンを採用している(詳細は ADR-002 参照)。

```text
┌─────────────────────────────────────────────────────────────────┐
│ Rules Page / Content Script                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ RulesApp                                                     ││
│  │   ↓ ゴミ箱クリック                                            ││
│  │ ConfirmDialog(確認)                                         ││
│  │   ↓ 確認後                                                   ││
│  │ DeleteRuleController → DeleteRuleInteractor                  ││
│  │                              ↓                              ││
│  │              IRewriteRuleRepository.delete()                ││
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
│  │ Interactor → ITabsGateway → ChromeTabsGateway              ││
│  │              (rule.matchesUrl()判定 → chrome.tabs.reload)   ││
│  │                                                             ││
│  │ DeleteRulePresenter → RulesApp                             ││
│  │   ↓ 成功: ルール一覧から削除                                   ││
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
│  │ DexieRewriteRuleRepository.delete() (IndexedDB)             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### ドメインロジックの配置原則

> **参照**: [ADR-001: Clean Architecture Presenter付きパターン採用](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)

| ロジック | 配置先 | 実装 |
|---------|--------|------|
| URLパターンマッチング判定 | `enterprise-business-rules` | `RewriteRule.matchesUrl()` (既存) |
| タブ一覧取得・リロード | `frameworks-and-drivers` | `ChromeTabsGateway`(chrome.tabs API) |
| 削除処理 | `frameworks-and-drivers` | `DexieRewriteRuleRepository.delete()` |

削除後のタブリロードは、削除前に取得したルールの `matchesUrl()` を使用して判定を行う。

## クラス図

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       enterprise-business-rules/                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RewriteRule                                                         │   │
│  │ ─────────────────────────────────────────────────────────────────── │   │
│  │ + matchesUrl(url: string): boolean                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       application-business-rules/                           │
│                                                                             │
│  ┌─────────────────────┐    ┌───────────────────────────┐                  │
│  │ <<interface>>       │    │ <<interface>>             │                  │
│  │ IDeleteRuleUseCase  │    │ IDeleteRulePresenter      │                  │
│  │ ─────────────────── │    │ ───────────────────────── │                  │
│  │ + execute(input)    │    │ + present(output)         │                  │
│  └──────────▲──────────┘    │ + presentError(errorData) │                  │
│             │               └───────────▲───────────────┘                  │
│             │                           │                                  │
│             │ implements                │ uses                             │
│             │                           │                                  │
│  ┌──────────┴───────────────────────────┴──────────┐                       │
│  │ DeleteRuleInteractor                            │                       │
│  │ ─────────────────────────────────────────────── │                       │
│  │ - repository: IRewriteRuleRepository            │                       │
│  │ - tabsGateway: ITabsGateway                     │                       │
│  │ - presenter: IDeleteRulePresenter               │                       │
│  │ ─────────────────────────────────────────────── │                       │
│  │ + execute(inputData): Promise<void>             │                       │
│  └─────────────────────────────────────────────────┘                       │
│                                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────┐  ┌───────────────────────┐ │
│  │ DeleteRule          │  │ DeleteRule               │  │ DeleteRule            │ │
│  │ InputData           │  │ OutputData               │  │ ErrorOutputData       │ │
│  │ ─────────────────── │  │ ──────────────────────── │  │ ───────────────────── │ │
│  │ + ruleId: number    │  │ + deletedRuleId: number  │  │ + ruleId: number      │ │
│  └─────────────────────┘  └──────────────────────────┘  └───────────────────────┘ │
│         ▲                        ▲                        ▲                │
│         │                        │                        │                │
│  Controller が生成         Interactor が生成        Interactor が生成       │
│  (Interactor に渡す)     (Presenter に渡す)     (Presenter に渡す)     │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │ <<interface>>               │    │ <<interface>>               │        │
│  │ IRewriteRuleRepository      │    │ ITabsGateway                │        │
│  │ ─────────────────────────── │    │ ─────────────────────────── │        │
│  │ + getById(id): Promise<Rule>│    │ + reloadMatchingTabs(rule)  │        │
│  │ + delete(id): Promise<void> │    │                             │        │
│  └─────────────────────────────┘    └─────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          interface-adapters/                                │
│                                                                             │
│  ┌───────────────────────────────┐  ┌─────────────────────────────┐        │
│  │ <<interface>>                 │  │ <<interface>>               │        │
│  │ IDeleteRuleControllerFactory  │  │ IDeleteRuleController       │        │
│  │ ───────────────────────────── │  │ ─────────────────────────── │        │
│  │ + create(onSuccess,           │  │ + deleteRule(ruleId)        │        │
│  │   onError): IDeleteRule...    │  └──────────▲──────────────────┘        │
│  └──────────▲────────────────────┘             │ implements                │
│             │ implements                       │                           │
│  ┌──────────┴────────────────────┐  ┌──────────┴──────────────────┐        │
│  │ DeleteRuleControllerFactory   │  │ DeleteRuleController        │        │
│  │ ───────────────────────────── │  │ ─────────────────────────── │        │
│  │ - repository: IRewriteRule... │  │ - useCase: IDeleteRule...   │        │
│  │ - tabsGateway: ITabsGateway   │  │ ─────────────────────────── │        │
│  │ ───────────────────────────── │  │ + deleteRule(ruleId)        │        │
│  │ + create(onSuccess,           │  └─────────────────────────────┘        │
│  │   onError): IDeleteRule...    │                                         │
│  └───────────────────────────────┘  ┌─────────────────────────────┐        │
│                                     │ DeleteRulePresenter         │        │
│                                     │ ─────────────────────────── │        │
│                                     │ - removeRuleFromView: Func  │        │
│                                     │ - showErrorInView: Func     │        │
│                                     │ ─────────────────────────── │        │
│                                     │ + present(outputData)       │        │
│                                     │ + presentError(errorData)   │        │
│                                     └─────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          frameworks-and-drivers/                            │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │ DeleteButton                │    │ ConfirmDialog               │        │
│  │ ─────────────────────────── │    │ ─────────────────────────── │        │
│  │ + onClick: () => void       │    │ + isOpen: boolean           │        │
│  │ + disabled?: boolean        │    │ + message: string           │        │
│  │                             │    │ + onConfirm: () => void     │        │
│  │                             │    │ + onCancel: () => void      │        │
│  └─────────────────────────────┘    └─────────────────────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │ ToastNotification                           │                           │
│  │ ─────────────────────────────────────────── │                           │
│  │ + message: string                           │                           │
│  │ + type: 'error' | 'success' | 'warning'     │                           │
│  │ + isVisible: boolean                        │                           │
│  └─────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 影響ドキュメント

- `docs/design/pages/rule-list/ui.md` - ゴミ箱アイコン列の追加

## 関連ドキュメント

- [ルールトグル機能](../toggle-rule-active/) - 先行機能(同様のアーキテクチャ)
- [ADR-001: Clean Architecture with Presenter Pattern](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)
- [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)
- [ADR-005: ReactコールバックをPresenterに注入するためのFactoryパターン採用](../../../../../adr/005-factory-pattern-for-react-callback-injection.md)
