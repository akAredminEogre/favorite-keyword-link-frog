---
codd:
  node_id: "design:design-src-interface-adapters-mappers-rewriterulemapper-toentity"
  type: design
---

# RewriteRuleMapper.toEntity() テスト戦略

## 目的

RewriteRuleDTOからRewriteRuleエンティティへの変換を行う。
全6プロパティ（id, oldString, newString, urlPattern, isRegex, isActive）を正しく変換する。

## テスト分類

### 1. プロパティ変換

全プロパティが正しく変換されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 全プロパティ変換 | 6プロパティ全てが正しく変換される | Mapperの基本責務確認 |

**対応テスト**: `normal-cases.test.ts`

## 網羅性チェック

- [x] 全プロパティの変換（6プロパティ）
- [x] 戻り値がRewriteRuleインスタンスであること
- [ ] boolean値の個別パターン → 不要（プロパティ変換で網羅）
- [ ] 異常系（null/undefinedプロパティ） → 不要（RewriteRuleDTOインターフェースで型制約）
- [ ] 境界値 → 不要（文字列・数値の境界はMapper責務外）

## テストファイル構成

```text
tests/unit/interface-adapters/mappers/RewriteRuleMapper/toEntity/
└── normal-cases.test.ts       # プロパティ変換（1ケース）
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

### モック対象

- **IRewriteRuleMessagingPort**: コンストラクタインジェクション用のダミーモック
  - `toEntity()` は MessagingPort を使用しないため、呼び出しは発生しない
  - インターフェース準拠のため `getAll()`, `getById()`, `updateActive()` をダミー定義

### モックファイル構成

インターフェース配下にモックファクトリを配置（複数テストで共有）:

```text
tests/unit/interface-adapters/ports/IRewriteRuleMessagingPort/mocks/
└── createMockRewriteRuleMessagingPort.ts    # モックファクトリ
```
