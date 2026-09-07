---
codd:
  node_id: "design:design-src-interface-adapters-controllers-exportrulesjsoncontroller-exportrulesjson"
  type: design
---

# ExportRulesJsonController.exportRulesJson() テスト戦略

## 目的

ルールJSONエクスポートのリクエストを受け取り、ExportRulesJsonInputDataを生成してUseCaseを呼び出す。
Controllerの責務は入力変換とUseCase呼び出しのみで、ビジネスロジックは含まない。

## テスト分類

### 1. 正常系（UseCase呼び出し）

UseCaseのexecuteメソッドが正しく呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 基本パターン | exportRulesJson()でUseCaseのexecuteが1回呼び出される | UseCase委譲の確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. InputData生成

UseCaseに渡されるInputDataが正しく生成されていることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| InputData型 | ExportRulesJsonInputDataインスタンスが渡される | 入力変換の正確性 |

**対応テスト**: `normal-cases.test.ts`（上記と同一テスト内で検証）

## 網羅性チェック

- [x] UseCaseのexecuteが呼び出されること
- [x] ExportRulesJsonInputDataが渡されること
- [ ] 異常系（UseCase側のエラー） → 不要（Controllerはエラーをキャッチせず呼び出し元に伝播）

### 異常系テストが不要な理由

ControllerはUseCase呼び出しのみを担当し、エラーハンドリングの責務を持たない：

1. **責務の分離**: Controllerは入力変換のみ、ビジネスロジックエラーはInteractor層
2. **エラー伝播**: UseCaseからのエラーは呼び出し元（View層）に伝播してUIで処理

### パラメータバリエーションが不要な理由

ExportRulesJsonController.exportRulesJson()は引数を取らない（全ルールエクスポートのため）。
DeleteRuleController.deleteRule(ruleId)のような入力値のバリエーションテストは不要。

## テストファイル構成

```text
tests/unit/interface-adapters/controllers/ExportRulesJsonController/exportRulesJson/
└── normal-cases.test.ts       # UseCase呼び出し確認（1ケース）
```

## モック戦略

UseCaseをモック化し、Controllerの責務（UseCase呼び出し）のみをテストする。

### 使用するモック

> **注意**: 新規モック作成前に既存モックを確認すること。詳細は [mock-file-placement.md](/docs/coding-standards/tests/common-rule/mock-file-placement.md) を参照。

| 依存関係 | モック理由 | モック対応 |
| -------- | ---------- | ---------- |
| IExportRulesJsonUseCase | UseCase呼び出しの検証 | 新規作成（`tests/unit/application-business-rules/ports/input/IExportRulesJsonUseCase/mocks/`） |

### テストデータ

ExportRulesJsonInputDataは実インスタンスを使用（Controllerが生成するため、型の検証に使用）。
