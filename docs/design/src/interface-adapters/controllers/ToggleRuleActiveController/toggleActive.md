---
codd:
  node_id: "design:design-src-interface-adapters-controllers-toggleruleactivecontroller-toggleactive"
  type: design
---

# ToggleRuleActiveController.toggleActive() テスト戦略

## 目的

ユーザーからのruleIdを受け取り、ToggleRuleActiveInputDataを生成してUseCaseを呼び出す。
Controllerの責務は入力変換とUseCase呼び出しのみで、ビジネスロジックは含まない。

## テスト分類

### 1. 正常系（UseCase呼び出し）

UseCaseのexecuteメソッドが正しく呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 基本パターン | ruleId=1でUseCaseが呼び出される | 最小限の正常系確認 |
| 大きなID | ruleId=999999でUseCaseが呼び出される | 境界値（大きな値）の確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. InputData生成

UseCaseに渡されるInputDataが正しく生成されていることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| ruleId設定 | InputData.ruleIdが引数と一致 | 入力変換の正確性 |

**対応テスト**: `normal-cases.test.ts`（上記と同一テスト内で検証）

## 網羅性チェック

- [x] UseCaseのexecuteが呼び出されること
- [x] InputDataのruleIdが正しく設定されること
- [ ] 異常系（UseCase側のエラー） → 不要（Controllerはエラーをキャッチせず呼び出し元に伝播）
- [ ] ruleIdのバリデーション → 不要（責務外、Interactor層で検証）

### 異常系テストが不要な理由

ControllerはUseCase呼び出しのみを担当し、エラーハンドリングの責務を持たない：

1. **責務の分離**: Controllerは入力変換のみ、ビジネスロジックエラーはInteractor層
2. **エラー伝播**: UseCaseからのエラーは呼び出し元（View層）に伝播してUIで処理
3. **バリデーション**: ruleIdの存在確認はInteractor層でRepository経由で行う

## テストファイル構成

```text
tests/unit/interface-adapters/controllers/ToggleRuleActiveController/toggleActive/
└── normal-cases.test.ts       # UseCase呼び出し確認（配列ベース、2ケース）
```
