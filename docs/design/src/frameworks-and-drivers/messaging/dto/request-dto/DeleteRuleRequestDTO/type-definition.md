---
codd:
  node_id: "design:design-src-frameworks-and-drivers-messaging-dto-request-dto-deleterulerequestdto-type-definition"
  type: design
---

# DeleteRuleRequestDTO 型定義テスト戦略

## 目的

ルール削除リクエストのメッセージング用DTOの型を定義する。
Rules PageからBackground Scriptへの削除要求を送信する際に使用する。

## 実装形態

TypeScript `interface` として実装。

```typescript
export interface DeleteRuleRequestDTO {
  id: number;
}
```

### プロパティ名の設計判断

他のRequest DTOとの一貫性を優先して `id` を採用。

| DTO | プロパティ名 |
|-----|------------|
| `GetByIdRequestDTO` | `id: number` |
| `UpdateRuleActiveRequestDTO` | `id: number` |
| `DeleteRuleRequestDTO` | `id: number` |

## テスト方針

### ランタイムテスト: 不要

**理由**:

1. **interfaceはコンパイル時のみ存在**: TypeScriptのinterfaceはトランスパイル後のJavaScriptコードに残らない
2. **型チェックはコンパイラが担当**: 型の不整合はTypeScriptコンパイラ(`tsc`)がコンパイル時に検出する
3. **ランタイムロジックなし**: interfaceは純粋な型定義であり、実行時に検証すべきビジネスロジックを持たない

### コンパイル時検証

以下の項目はTypeScriptコンパイラにより自動検証される:

| 検証項目 | 検証方法 |
|---------|---------|
| id プロパティの存在 | 型チェック |
| id の型が number | 型チェック |
| 必須プロパティの欠落 | コンパイルエラー |

## 網羅性チェック

- [x] 型定義の正確性 → TypeScriptコンパイラで検証
- [ ] ランタイムテスト → 不要（interfaceのため）
- [ ] 境界値テスト → 不要（型制約のみ、値の検証はUseCase層の責務）
- [ ] 異常系テスト → 不要（型で制約）

## テストファイル構成

テストファイルなし（interfaceのためランタイムテスト不要）

## モック戦略

モック不要（テストなし）

## 関連ドキュメント

- [クラス設計](../../../../../../pages/rule-list/features/delete-rule/01-class-design.md)
- [ADR-002: メッセージングに @webext-core を採用](../../../../../../../adr/002-messaging-with-webext-core.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../../../adr/003-unified-db-access-via-messaging.md)

## 使用箇所

> **注記**: 以下の使用箇所は設計上の計画です。現在はスケルトン実装（Phase 1）であり、実際の処理はPhase 2以降で実装されます。

- `RewriteRuleMapper`: 削除リクエストDTO `{ id }` を生成してMessagingServiceに渡す（P2-M5で実装予定）
- `RewriteRuleMessagingService`: proxy-service経由でBackground Scriptに送信（P2-M4で実装予定）
- `DexieRewriteRuleRepository`: Background Script側で受信し、削除処理を実行（P2-R1で実装予定）
