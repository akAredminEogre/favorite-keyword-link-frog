---
codd:
  node_id: "design:design-src-frameworks-and-drivers-persistence-chromeruntimerewriterulerepository-delete"
  type: design
---

# ChromeRuntimeRewriteRuleRepository.delete() テスト戦略

## 目的

指定されたIDのRewriteRuleを削除する。
RewriteRuleMapper経由でBackground Scriptに削除リクエストを委譲する。

ADR-002, ADR-003に準拠: IRewriteRuleMessagingPort → Mapper → Repository

## テスト分類

### 1. 正常系（委譲確認）

Mapperのdeleteメソッドが正しく呼び出されることを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 基本動作 | 指定されたIDでMapperのdeleteが呼ばれる | 委譲パターンの基本確認 |
| 戻り値 | Promiseが正常に解決される | 非同期処理の完了確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. 異常系

Mapperがエラーをスローした場合のエラー伝播を検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| エラー伝播 | Mapperがエラーをスローした場合、そのエラーが伝播する | エラーハンドリングの確認 |

**対応テスト**: `Abend/error-cases.test.ts`

## 網羅性チェック

- [x] Mapper.deleteへの委譲確認
- [x] 引数（id）の正しい伝達
- [x] Promiseの正常解決
- [x] エラー伝播の確認
- [ ] 境界値テスト → 不要（IDはnumber型で特別な境界はない、TypeScriptで型制約）
- [ ] 複数回呼び出し → 不要（冪等性はMapper/Repository下位層で保証）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/persistence/ChromeRuntimeRewriteRuleRepository/delete/
├── normal-cases.test.ts       # 正常系: Mapper委譲確認
└── Abend/
    └── error-cases.test.ts    # 異常系: エラー伝播
```

## モック戦略

> **重要**: [basic-rule.md](../../../../../../docs/coding-standards/tests/unit/common-rule/basic-rule.md) の「モック作成の分離ルール」に従う。

### モック対象

- **IRewriteRuleMessagingPort**: 外部依存（proxy-service経由のBackground通信）をモック化
  - `delete()`: 正常系では成功を返し、異常系ではエラーをスローするよう設定
  - 他メソッド: インターフェース準拠のためダミー定義

### モックファイル構成

既存のモックファクトリを使用:

```text
tests/unit/interface-adapters/ports/IRewriteRuleMessagingPort/mocks/
└── createMockRewriteRuleMessagingPort.ts    # 既存モックファクトリ（delete対応済み）
```
