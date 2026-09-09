---
codd:
  node_id: "design:design-pages-rule-list-features-export-rules-json-03-directory-structure"
  type: design
---

# ディレクトリ構造設計

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
│   │   └── IExportRulesJsonUseCase.ts
│   ├── output/                                  ← Output Port (Interface)
│   │   └── IExportRulesJsonPresenter.ts
│   └── gateway/                                 ← Gateway Interface (Interactorが依存)
│       └── IRewriteRuleRepository.ts            ← 既存、getAll()使用
├── interactors/                                 ← Use Case Interactor
│   └── ExportRulesJsonInteractor.ts
└── dto/                                         ← Data Transfer Objects
    ├── input/
    │   └── ExportRulesJsonInputData.ts
    └── output/
        ├── ExportRulesJsonOutputData.ts
        └── ExportRulesJsonErrorOutputData.ts     ← エラー出力DTO
```

### 第3層: interface-adapters/

```text
src/interface-adapters/
├── controllers/                                 ← Controller
│   ├── IExportRulesJsonController.ts            ← Controllerインターフェース(ADR-005参照)
│   └── ExportRulesJsonController.ts
├── presenters/                                  ← Presenter
│   └── ExportRulesJsonPresenter.ts
├── factories/                                   ← Factory(ADR-005参照)
│   ├── IExportRulesJsonControllerFactory.ts     ← Factoryインターフェース(ADR-005参照)
│   └── ExportRulesJsonControllerFactory.ts      ← Factory実装(ADR-005参照)
├── ports/                                       ← Port(Mapperが依存、ADR-002参照)
│   └── IRewriteRuleMessagingPort.ts             ← 既存、getAll()使用
└── mappers/                                     ← Mapper(ADR-002、ADR-003参照)
    └── RewriteRuleMapper.ts                     ← 既存、getAll()使用
```

### 第4層: frameworks-and-drivers/

```text
src/frameworks-and-drivers/
├── ui/                                          ← View (React)
│   ├── components/
│   │   └── atoms/
│   │       └── ExportButton/
│   │           └── ExportButton.tsx
│   ├── hooks/                                   ← React Custom Hooks
│   │   └── useExportRulesJson.ts
│   └── pages/
│       └── rules/
│           └── RulesApp.tsx                     ← 既存、ExportButton追加
├── persistence/                                 ← Repository 実装
│   ├── indexeddb/
│   │   └── DexieRewriteRuleRepository.ts        ← 既存、getAll()使用
│   └── ChromeRuntimeRewriteRuleRepository.ts    ← 既存、getAll()使用
├── messaging/                                   ← メッセージング層(ADR-002参照)
│   ├── RewriteRuleMessagingService.ts           ← 既存、getAll()使用
│   ├── RewriteRuleProxyService.ts               ← 既存、getAll()使用
│   ├── RewriteRuleProxyServiceImpl.ts           ← 既存、getAll()使用
│   └── dto/                                     ← メッセージング用DTO(ADR-002、ADR-003参照)
│       └── RewriteRuleDTO.ts                    ← 既存
└── di/                                          ← DI Container
    └── container.ts                             ← ExportRulesJsonControllerFactory登録追加
```
