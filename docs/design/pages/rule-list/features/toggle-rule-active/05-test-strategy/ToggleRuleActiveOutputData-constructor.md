---
codd:
  node_id: "design:design-pages-rule-list-features-toggle-rule-active-05-test-strategy-toggleruleactiveoutputdata-constructor"
  type: design
---

# ToggleRuleActiveOutputData.constructor() テスト戦略

## 目的

ルール有効/無効切り替えの出力データ（更新後のRewriteRule）を保持するDTOを生成する。

## テスト分類

### 1. 正常系（インスタンス生成）

様々なisActive状態のRewriteRuleでインスタンスを生成できることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| isActive=true | 有効なルールを保持 | 基本パターン（有効化後） |
| isActive=false | 無効なルールを保持 | 基本パターン（無効化後） |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] isActive=true/false両パターンでインスタンス生成
- [x] toggledRuleが正しく保持されること
- [x] toggledRuleのプロパティ（id, isActive）が正しく参照できること
- [ ] 読み取り専用性 → TypeScriptの型システムで保証（ランタイムテスト不要）
- [ ] 異常系 → 不要（Interactorが有効なRewriteRuleを渡すことを保証）

## テストファイル構成

```text
tests/unit/application-business-rules/dto/output/ToggleRuleActiveOutputData/constructor/
└── normal-cases.test.ts       # インスタンス生成（2ケース、配列ベース）
```
