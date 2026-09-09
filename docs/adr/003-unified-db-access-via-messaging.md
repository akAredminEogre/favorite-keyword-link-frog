---
codd:
  node_id: "governance:adr-003-unified-db-access-via-messaging"
  type: governance
---

# ADR-003: DB アクセスを messaging 経由に統一し DTO を使用

## ステータス

採用

## コンテキスト

### IndexedDB アクセス制約

Chrome 拡張機能では、複数のコンテキスト（Background Script、Rules Page、Content Script）が存在し、それぞれ IndexedDB へのアクセス可否が異なる：

| コンテキスト | IndexedDB 直接アクセス | messaging 経由 |
|-------------|----------------------|----------------|
| Background Script | ✅ 可能 | - |
| Rules Page (別タブ) | ✅ 可能 | ✅ 可能 |
| Popup | ✅ 可能 | ✅ 可能 |
| Content Script | ❌ 不可 | ✅ 必須 |

Rules Page や Popup は技術的には IndexedDB に直接アクセスできるが、Content Script は messaging 経由でのみ DB にアクセスできる。

### JSON シリアライズ制約

messaging ではデータは JSON シリアライズされて送信される。これにより以下の制約が生じる：

| 送信データ | シリアライズ後 |
|-----------|--------------|
| プリミティブ（string, number, boolean） | ✅ そのまま保持 |
| Plain Object | ✅ そのまま保持 |
| クラスインスタンス | ⚠️ プロパティのみ保持（メソッド消失） |
| 関数 | ❌ 送信不可 |

クラスインスタンスを送信すると、受信側ではメソッドが消失した plain object となり、メソッド呼び出しがエラーになる。

## 決定

### DB アクセスの統一

**すべてのコンテキストからの DB アクセスは messaging 経由で Background Script に集約する。**

技術的に直接アクセス可能な場合でも、messaging を使用する。

DTO の使用規約と定義基準については ADR-002 を参照。

### 変換責務

Entity と DTO の変換は専用の Mapper クラスで行う。Mapper は変換に加え、MessagingService への通信も担当する。これにより Repository は DTO を意識せずに済む。

#### 依存性逆転の適用

Mapper（interface-adapters 層）が MessagingService（frameworks-and-drivers 層）を直接参照することを避けるため、Port インターフェースを導入する（ADR-002 参照）。

| コンポーネント | 層 | 責務 |
|---------------|-----|------|
| `ChromeRuntimeRewriteRuleRepository` | frameworks-and-drivers | Mapper への委譲のみ（DTO を意識しない） |
| `RewriteRuleMapper` | interface-adapters | Entity ↔ DTO 変換 + IRewriteRuleMessagingPort 経由で通信 |
| `IRewriteRuleMessagingPort` | interface-adapters | MessagingService の抽象化（Port） |
| `RewriteRuleMessagingService` | frameworks-and-drivers | IRewriteRuleMessagingPort を実装、proxy-service 経由で DTO を送受信 |
| `RewriteRuleProxyService` | frameworks-and-drivers | proxy-service として定義、Background Script で実行 |
| `DexieRewriteRuleRepository` | frameworks-and-drivers | DTO ↔ DB レコード 変換 |

**注意**: `RewriteRuleProxyService` の実装詳細（実装注入パターン）については ADR-002 を参照。

#### Mapper + Port 導入の理由

1. **依存性逆転の原則**: interface-adapters → frameworks-and-drivers の直接依存を回避
2. **Repository の単純化**: Repository は Entity のみを扱い、DTO 変換を知らない
3. **単一責任の原則**: Repository はデータアクセスの調整のみ
4. **テスタビリティ**: Mapper のテストで IRewriteRuleMessagingPort をモック可能
5. **Clean Architecture との整合性**: Entity が DTO を知らない設計、依存は内向きに保たれる
6. **再利用性**: 同じ変換が複数箇所で必要な場合に再利用可能

## 理由

### 採用理由

**DB アクセス統一**:
1. **一貫性**: すべてのコンテキストで同じパターンを使用
2. **単一責任**: DB アクセスロジックが Background Script に集約
3. **データ整合性**: 単一の DB アクセスポイントにより競合を回避
4. **拡張性**: chrome.tabs API 等の Background 限定 API との連携が容易
5. **テスト容易性**: messaging をモックすることで各コンテキストを独立してテスト可能

**DTO 使用**:
1. **技術的制約への対応**: JSON シリアライズの制約を明示的に扱う
2. **明確な境界**: messaging 層でのデータ変換責務を明確化
3. **軽量な通信**: 必要なデータのみ送信することで通信量を削減
4. **エラー防止**: 受信側でメソッド呼び出しエラーを防止

### トレードオフ

- Rules Page / Popup は直接アクセスより若干のオーバーヘッドが発生
- 送信側でエンティティから DTO への変換が必要
- 受信側で DTO からエンティティへの再構築が必要

## 影響ドキュメント

このADRが変更された場合、以下のドキュメントも更新が必要：
- 各機能の設計ドキュメントのうち、`01-class-design.md`、`02-sequence.puml`

## 関連ドキュメント

- [ADR-001: Clean Architecture with Presenter Pattern](./001-clean-architecture-with-presenter-pattern.md)
- [ADR-002: メッセージングに @webext-core を採用](./002-messaging-with-webext-core.md)
- [Toggle Rule Active 設計](../design/pages/rule-list/features/toggle-rule-active/)
