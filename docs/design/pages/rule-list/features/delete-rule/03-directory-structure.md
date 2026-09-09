---
codd:
  node_id: "design:design-pages-rule-list-features-delete-rule-03-directory-structure"
  type: design
---

# ディレクトリ構造設計

## 詳細構造

### 第1層: enterprise-business-rules/

```text
src/enterprise-business-rules/
└── entities/                                    ← Entity
    └── RewriteRule/
        └── RewriteRule.ts                       ← matchesUrl() 使用
```

### 第2層: application-business-rules/

```text
src/application-business-rules/
├── ports/
│   ├── input/                                   ← Input Port (Interface)
│   │   └── IDeleteRuleUseCase.ts
│   ├── output/                                  ← Output Port (Interface)
│   │   └── IDeleteRulePresenter.ts
│   └── gateway/                                 ← Gateway Interface (Interactorが依存)
│       ├── IRewriteRuleRepository.ts            ← delete() 追加
│       └── ITabsGateway.ts
├── interactors/                                 ← Use Case Interactor
│   └── DeleteRuleInteractor.ts
└── dto/                                         ← Data Transfer Objects
    ├── input/
    │   └── DeleteRuleInputData.ts
    └── output/
        ├── DeleteRuleOutputData.ts
        └── DeleteRuleErrorOutputData.ts         ← エラー出力DTO
```

### 第3層: interface-adapters/

```text
src/interface-adapters/
├── controllers/                                 ← Controller
│   ├── IDeleteRuleController.ts                 ← Controllerインターフェース(ADR-005参照)
│   └── DeleteRuleController.ts
├── presenters/                                  ← Presenter
│   └── DeleteRulePresenter.ts
├── factories/                                   ← Factory(ADR-005参照)
│   ├── IDeleteRuleControllerFactory.ts          ← Factoryインターフェース(Reactコールバック注入用、ADR-005参照)
│   └── DeleteRuleControllerFactory.ts           ← Factory実装(ADR-005参照)
├── ports/                                       ← Port(Mapperが依存、ADR-002参照)
│   └── IRewriteRuleMessagingPort.ts             ← delete() 追加
└── mappers/                                     ← Mapper(ADR-002、ADR-003参照)
    └── RewriteRuleMapper.ts                     ← delete() 追加
```

### 第4層: frameworks-and-drivers/

```text
src/frameworks-and-drivers/
├── ui/                                          ← View (React)
│   ├── components/
│   │   ├── atoms/
│   │   │   └── DeleteButton/
│   │   │       └── DeleteButton.tsx
│   │   ├── molecules/
│   │   │   ├── ToastNotification/
│   │   │   │   └── ToastNotification.tsx
│   │   │   └── RuleTableRow/
│   │   │       └── RuleTableRow.tsx             ← DeleteButton 追加
│   │   └── organisms/
│   │       └── ConfirmDialog/
│   │           └── ConfirmDialog.tsx            ← 確認ダイアログ(モーダルUI、organisms層)
│   └── pages/
│       └── rules/
│           └── RulesApp.tsx
├── persistence/                                 ← Repository 実装
│   ├── indexeddb/
│   │   └── DexieRewriteRuleRepository.ts        ← delete() 追加
│   └── ChromeRuntimeRewriteRuleRepository.ts    ← delete() 追加
├── messaging/                                   ← メッセージング層(ADR-002参照)
│   ├── RewriteRuleMessagingService.ts           ← IRewriteRuleMessagingPort 実装(delete() 追加)
│   ├── RewriteRuleProxyService.ts               ← IRewriteRuleProxyService 定義 + proxy-service(delete() 追加)
│   ├── RewriteRuleProxyServiceImpl.ts           ← 実装注入パターン(ADR-002参照、delete() 追加)
│   └── dto/                                     ← メッセージング用DTO(ADR-002、ADR-003参照)
│       ├── RewriteRuleDTO.ts                    ← メッセージング用ルールDTO
│       └── request-dto/                         ← リクエストDTO
│           ├── GetByIdRequestDTO.ts             ← 削除対象ルール取得要求(タブリロード判定用){ id }
│           └── DeleteRuleRequestDTO.ts          ← 削除要求 { id }
├── browser/                                     ← ブラウザ操作 Gateway 実装
│   └── ChromeTabsGateway.ts
└── di/                                          ← DI Container
    └── container.ts
```
