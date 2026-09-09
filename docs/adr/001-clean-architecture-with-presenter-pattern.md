---
codd:
  node_id: "governance:adr-001-clean-architecture-with-presenter-pattern"
  type: governance
---

# ADR-001: Clean Architecture Presenter付きパターン採用

## ステータス

採用

## コンテキスト

本プロジェクトでは、Clean Architectureを採用しているが、現在のディレクトリ構造は独自の命名を使用している。今後の機能追加（ルールトグル機能など）に際し、Clean Architectureの正式なレイヤー名とPresenter付きパターン（Input Port / Output Port / Presenter）を採用することで、以下を実現したい：

1. アーキテクチャの意図が明確になる
2. 新規参画者が理解しやすい
3. テスト容易性の向上
4. 依存性逆転の原則の徹底

### 参考資料

- [実践クリーンアーキテクチャ - nrslib](https://nrslib.com/clean-architecture/)
- Robert C. Martin「Clean Architecture」

## 決定

### 1. ディレクトリ構造: Clean Architecture 4層の正式名称を使用

```text
src/
├── enterprise-business-rules/   ← 第1層: Enterprise Business Rules (Entities)
├── application-business-rules/  ← 第2層: Application Business Rules (Use Cases)
├── interface-adapters/          ← 第3層: Interface Adapters
└── frameworks-and-drivers/      ← 第4層: Frameworks & Drivers
```

### 2. Presenter付きパターンの採用

**制御の流れ**: View → Controller → Interactor → Presenter → View

**依存関係**（依存性逆転の原則）:
- Controller → Input Port ← Interactor (implements)
- Interactor → Output Port ← Presenter (implements)

```text
【制御の流れ（実線矢印）】

┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│   View   │───►│  Controller  │───►│  Interactor  │───►│  Presenter   │───►│   View    │
│ (操作)   │    │              │    │              │    │              │    │ (表示更新) │
└──────────┘    └──────────────┘    └──────────────┘    └───────────────┘    └───────────┘


【依存関係（破線矢印 = implements）】

               ┌──────────────┐                        ┌───────────────┐
               │  Input Port  │                        │  Output Port  │
               │ <<interface>>│                        │ <<interface>> │
               └──────▲───────┘                        └───────▲───────┘
                      │                                        │
                      │ implements                             │ implements
                      │                                        │
               ┌──────┴───────┐    uses             ┌──────────┴──────┐
               │  Interactor  │───────────────────► │    Presenter    │
               │              │  (Output Port経由)   │                 │
               └──────────────┘                     └─────────────────┘
                      │
                      │ uses
                      ▼
               ┌──────────────┐
               │   Gateway    │
               │ <<interface>>│
               └──────────────┘
```

### 3. 12要素とディレクトリの対応

| # | Clean Architecture要素 | ディレクトリ | 備考 |
|---|----------------------|-------------|------|
| 1 | View | `frameworks-and-drivers/ui/` | React コンポーネント |
| 2 | View Model | （Presenterが直接更新するため省略） | |
| 3 | Controller | `interface-adapters/controllers/` | |
| 4 | Presenter | `interface-adapters/presenters/` | |
| 5 | Input Boundary (Input Port) | `application-business-rules/ports/input/` | |
| 6 | Output Boundary (Output Port) | `application-business-rules/ports/output/` | |
| 7 | Use Case Interactor | `application-business-rules/interactors/` | |
| 8 | Data Access Interface | `application-business-rules/ports/gateway/` | Gateway Interface（Interactorが依存） |
| 9 | Data Access (Repository) | `frameworks-and-drivers/persistence/` | Repository 実装（DB, メッセージング経由等） |
| 10 | Database | IndexedDB (Dexie) | |
| 11 | Entities | `enterprise-business-rules/entities/` | |
| 12 | External Interfaces | `frameworks-and-drivers/browser/`, `frameworks-and-drivers/entrypoints/` | Chrome API ラッパー、background.ts、content.ts |

### 4. 詳細ディレクトリ構造

```text
src/
├── enterprise-business-rules/                   ← 第1層: Enterprise Business Rules
│   ├── entities/                               ← Entity
│   │   └── RewriteRule/
│   │       └── RewriteRule.ts
│   ├── value-objects/                          ← Value Object
│   │   └── RewriteRules.ts
│   └── constants/                              ← 定数
│       └── RegexConstants.ts
│
├── application-business-rules/                  ← 第2層: Application Business Rules
│   ├── ports/
│   │   ├── input/                              ← Input Port (Interface)
│   │   │   └── IToggleRuleActiveUseCase.ts
│   │   ├── output/                             ← Output Port (Interface)
│   │   │   └── IToggleRuleActivePresenter.ts
│   │   └── gateway/                            ← Gateway Interface（Interactorが依存）
│   │       ├── IRewriteRuleRepository.ts
│   │       └── ITabsGateway.ts
│   ├── interactors/                            ← Use Case Interactor
│   │   └── ToggleRuleActiveInteractor.ts
│   └── dto/                                    ← Data Transfer Objects
│       ├── input/
│       │   └── ToggleRuleActiveInputData.ts
│       └── output/
│           └── ToggleRuleActiveOutputData.ts
│
├── interface-adapters/                          ← 第3層: Interface Adapters
│   ├── controllers/                            ← Controller
│   │   └── ToggleRuleActiveController.ts
│   ├── presenters/                             ← Presenter
│   │   └── ToggleRuleActivePresenter.ts
│   ├── factories/                              ← Factory（ADR-005参照）
│   │   └── ToggleRuleActiveControllerFactory.ts
│   ├── ports/                                  ← Port（Mapperが依存、依存性逆転のため）
│   │   └── IRewriteRuleMessagingPort.ts
│   └── mappers/                                ← Mapper
│       └── RewriteRuleMapper.ts
│
└── frameworks-and-drivers/                      ← 第4層: Frameworks & Drivers
    ├── ui/                                     ← View (React)
    │   ├── components/
    │   │   ├── atoms/
    │   │   ├── molecules/
    │   │   └── organisms/
    │   └── pages/
    ├── persistence/                            ← Repository 実装
    │   └── ChromeRuntimeRewriteRuleRepository.ts  ← Content Script用（メッセージング経由）
    ├── messaging/                              ← メッセージング層
    │   ├── RewriteRuleProxyService.ts          ← IRewriteRuleMessagingPort 実装
    │   └── dto/                                ← メッセージング用DTO
    │       ├── RewriteRuleDTO.ts               ← エンティティDTO
    │       └── request-dto/                    ← リクエストDTO
    │           ├── GetByIdRequestDTO.ts
    │           └── UpdateRuleActiveRequestDTO.ts
    ├── browser/                                ← ブラウザ操作 Gateway 実装
    │   └── ChromeTabsGateway.ts
    ├── di/                                     ← DI Container
    └── entrypoints/                            ← WXT Entry Points (CA外への橋)
```

### 5. 依存関係ルール

```text
内側（安定）                                            外側（不安定）
───────────────────────────────────────────────────────────────────────→

┌────────────────────┐   ┌────────────────────┐   ┌──────────────────┐   ┌─────────────────────┐
│ enterprise-business│ ← │application-business│ ← │interface-adapters│ ← │frameworks-and-drivers│
│       -rules       │   │       -rules       │   │                  │   │                     │
└────────────────────┘   └────────────────────┘   └──────────────────┘   └─────────────────────┘

矢印の方向 = 依存の方向
外側から内側への依存のみ許可
```

### 6. ドメインロジックの配置原則

**ドメインエンティティの値を用いた判定・計算・変換は、その結果がビジネス上の意味を持つ場合、`enterprise-business-rules` 層で実装する。**

`frameworks-and-drivers` 層は、ドメインロジックの **呼び出し** と **技術的な入出力** のみを担当する。

#### 適用例

| ロジック | 配置先 | 理由 |
|---------|--------|------|
| URLパターンマッチング判定 | `enterprise-business-rules` | 「ルールがどのURLに適用されるか」はドメイン知識 |
| 有効/無効状態の反転 | `enterprise-business-rules` | エンティティの状態変更 |
| タブ一覧の取得 | `frameworks-and-drivers` | Chrome API（技術的入出力） |
| タブのリロード実行 | `frameworks-and-drivers` | Chrome API（技術的入出力） |

#### 実装パターン

```text
┌─────────────────────────────────────────────────────────────────┐
│ enterprise-business-rules (第1層)                                │
│                                                                 │
│  RewriteRule                                                    │
│  + matchesUrl(url: string): boolean  ← 判定ロジック             │
│  + withActive(isActive): RewriteRule ← 状態変更ロジック          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ 呼び出し
┌─────────────────────────────────────────────────────────────────┐
│ frameworks-and-drivers (第4層)                                   │
│                                                                 │
│  ChromeTabsGateway                                              │
│  + reloadMatchingTabs(rule):                                    │
│      tabs = chrome.tabs.query()        ← 技術的入力             │
│      for tab in tabs:                                           │
│        if rule.matchesUrl(tab.url):    ← ドメインロジック呼出   │
│          chrome.tabs.reload(tab.id)    ← 技術的出力             │
└─────────────────────────────────────────────────────────────────┘
```

#### メリット

- **テスト容易性**: ドメインロジックを Chrome API モックなしで単体テスト可能
- **再利用性**: 同じ判定ロジックを複数の Gateway で使用可能
- **移植性**: ブラウザ変更時（Firefox対応等）もドメインロジックは変更不要

### 7. エラーハンドリングの責務

**エラーハンドリングは Interactor の責務とし、View（UIコンポーネント）では直接エラーハンドリングを行わない。**

#### 制御の流れ

```text
【正常系】
View → Controller → Interactor → Presenter.present(OutputData) → View

【エラー系】
View → Controller → Interactor → (try-catch) → Presenter.presentError(ErrorOutputData) → View
```

#### 責務の分離

| 層 | 責務 |
|----|------|
| Interactor | try-catch でエラーを捕捉し、ErrorOutputData を作成して Presenter に渡す |
| Presenter | ErrorOutputData を View に通知（onError コールバック等） |
| View | エラー状態を表示するのみ（エラーハンドリングロジックは持たない） |

#### View からの呼び出しパターン

View は非同期処理を fire-and-forget で呼び出す。エラーは Interactor → Presenter 経由で通知されるため、View での `.catch` は不要。

```tsx
// ✅ 正しいパターン
onConfirm={() => {
  void confirmDelete();  // fire-and-forget（エラーは Presenter 経由で通知）
}}

// ❌ 誤ったパターン（View でエラーハンドリング）
onConfirm={() => {
  void confirmDelete().catch((e) => setError(e.message));
}}
```

#### メリット

- **責務の明確化**: エラーハンドリングロジックが Interactor に集約される
- **一貫性**: 全ての UseCase で同じエラー処理パターンを適用
- **テスト容易性**: Interactor のエラーハンドリングを単体テストで検証可能
- **View のシンプル化**: View は表示に専念し、ビジネスロジックを持たない

## 理由
- Clean Architectureの導入により、下記のメリットを得る
  - Chrome拡張機能特有の技術的詳細からドメインロジックを分離し、保守性と拡張性を向上させる
  - layerや実装箇所の判断基準を明確にする
  - 設計の一貫性を保ち、AI駆動による設計、実装、テストコード生成を容易にする
- "現場での妥協" という言い訳をせずに、Clean Architectureを理解する

## 影響ドキュメント

このADRが変更された場合、以下のドキュメントも更新が必要：
- [002-messaging-with-webext-core.md](002-messaging-with-webext-core.md)
- [003-unified-db-access-via-messaging.md](003-unified-db-access-via-messaging.md)