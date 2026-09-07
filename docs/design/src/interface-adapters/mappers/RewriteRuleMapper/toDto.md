---
codd:
  node_id: "design:design-src-interface-adapters-mappers-rewriterulemapper-todto"
  type: design
---

# RewriteRuleMapper.toDto() テスト戦略

## 目的

RewriteRuleエンティティからRewriteRuleDTOへの変換を行う（**静的メソッド**）。
全6プロパティ（id, oldString, newString, urlPattern, isRegex, isActive）を正しく変換する。

インスタンス不要で呼び出し可能なため、`RewriteRuleProxyServiceImpl`等からも共通で使用できる。

## テスト分類

### 1. プロパティ変換

全プロパティが正しく変換されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 全プロパティ変換 | 6プロパティ全てが正しく変換される | Mapperの基本責務確認 |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] 全プロパティの変換（6プロパティ）
- [x] 戻り値がRewriteRuleDTO形式のオブジェクトであること
- [ ] boolean値の個別パターン → 不要（プロパティ変換で網羅）
- [ ] 異常系（nullエンティティ） → 不要（TypeScriptの型制約で防止）
- [ ] 境界値 → 不要（文字列・数値の境界はMapper責務外）

## テストファイル構成

```text
tests/unit/interface-adapters/mappers/RewriteRuleMapper/toDto/
└── normal-cases.test.ts       # プロパティ変換（1ケース）
```
