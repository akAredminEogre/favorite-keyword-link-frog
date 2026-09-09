---
codd:
  node_id: "governance:adr-002-messaging-with-webext-core"
  type: governance
---

# ADR-002: メッセージングに @webext-core を採用

## ステータス

採用

## コンテキスト

Chrome 拡張機能では、複数のコンテキスト（Background Script、Rules Page、Popup、Content Script）が存在し、コンテキスト間の通信にはメッセージングが必要となる。

標準の `chrome.runtime.sendMessage` API を使用した場合、以下の課題がある：

1. **MessageHandler の肥大化**: メッセージタイプごとに switch/case が増加
2. **型安全性の欠如**: メッセージの型チェックが手動
3. **ボイラープレート**: Message 型（type + payload）の定義が冗長
4. **コード規約との不整合**: switch 文を避け HashMap を推奨する方針と矛盾

## 決定

**メッセージングに `@webext-core` エコシステムを採用し、通信方向に応じて使い分ける。**

| 通信方向 | ライブラリ | 理由 |
|---------|-----------|------|
| → Background（データ取得） | `@webext-core/proxy-service` | Repository パターンと親和性が高い |
| Background → Content Script（コマンド送信） | `@webext-core/messaging` | 特定タブへの送信をサポート |

### @webext-core/proxy-service

Background Script で実行するサービスを他のコンテキストから透過的に呼び出す（RPC スタイル）。

- `defineProxyService` でサービスを定義
- Background Script で同期的に登録
- 他のコンテキストから通常のメソッド呼び出しと同じ感覚で使用

**適用対象**: Content Script / Popup / Rules Page → Background への通信

### @webext-core/messaging

型安全なイベント駆動型メッセージング。

- `defineExtensionMessaging` でプロトコルを定義
- `sendMessage` で送信、`onMessage` で受信
- 第3引数で `tabId` を指定することで特定タブへの送信が可能

**適用対象**: Background → Content Script への通信

### 命名規約

**命名規約**: [メッセージング層 コーディング規約](../coding-standards/src/frameworks-and-drivers/messaging.md) 参照

### DTO の使用

**メッセージングでは DTO（Plain Object）を使用し、ドメインエンティティを直接送信しない。**

messaging ではデータは JSON シリアライズされて送信されるため、クラスインスタンスを送信すると受信側ではメソッドが消失した plain object となる。この技術的制約に対応するため、DTO を使用する。

### Entity-DTO 変換

**Entity と DTO の相互変換は専用の Mapper クラスで行う。**

Mapper は変換だけでなく、MessagingService への呼び出しも担当する。これにより Repository は DTO を意識せずに済む。

#### 依存性逆転の適用

Clean Architecture の依存ルールを守るため、Mapper（interface-adapters 層）が MessagingService（frameworks-and-drivers 層）を直接参照することを避ける。

```text
[interface-adapters]
  IRewriteRuleMessagingPort (interface)
  RewriteRuleMapper → uses → IRewriteRuleMessagingPort

[frameworks-and-drivers]
  RewriteRuleMessagingService implements IRewriteRuleMessagingPort
  RewriteRuleMessagingService → uses → RewriteRuleProxyService (proxy-service)
```

| コンポーネント | 層 | 責務 |
|---------------|-----|------|
| Repository | frameworks-and-drivers | Mapper への委譲のみ（DTO を意識しない） |
| Mapper | interface-adapters | Entity ↔ DTO 変換 + IRewriteRuleMessagingPort 経由で通信 |
| IRewriteRuleMessagingPort | interface-adapters | MessagingService の抽象化（Port） |
| RewriteRuleMessagingService | frameworks-and-drivers | IRewriteRuleMessagingPort を実装、proxy-service 経由で DTO を送受信 |
| RewriteRuleProxyService | frameworks-and-drivers | proxy-service として定義、Background Script で実行 |

#### 実装注入パターン（proxy-service 向け）

`@webext-core/proxy-service` を使用する場合、Background Script と Content Script の両方で同じモジュールを import する必要がある。しかし、proxy-service 実装が DI コンテナ（container.ts）を静的 import すると、Content Script でモジュールをロードした際に Background 専用の依存関係も一緒にロードされ、問題が発生する。

```text
# 問題のあるパターン
RewriteRuleProxyService.ts
  └── import { container } from 'container.ts'  ← 静的 import

content.ts
  └── import { getRewriteRuleProxyService } from 'RewriteRuleProxyService.ts'
      └── container.ts も一緒にロードされる（副作用）
```

この問題を解決するため、**実装注入パターン**を採用する。

### 実装注入パターンの構成

| コンポーネント | 責務 | container.ts の import |
|--------------|------|----------------------|
| ProxyService定義 | サービスインターフェース定義、`defineProxyService` 呼び出し | なし |
| ProxyServiceImpl | 実際の実装(DI コンテナ経由で Repository 取得) | あり |
| background.ts | 実装を注入し、サービスを登録 | 直接はなし(Impl 経由で間接的にあり) |

### 動作フロー

1. **ProxyService定義**: `setXxxImpl()` で実装を受け取る setter を公開する
2. **background.ts**: Impl を import し、`setXxxImpl()` で注入後、`registerXxxService()` を呼び出す
3. **Content Script**: ProxyService定義のみを import する(container.ts はロードされない)

これにより、Content Script は ProxyService定義を import しても `container.ts` がロードされない。

**実装の詳細**: [RewriteRuleProxyService.ts](../../host-frontend-root/frontend-src-root/src/frameworks-and-drivers/messaging/RewriteRuleProxyService.ts)、[RewriteRuleProxyServiceImpl.ts](../../host-frontend-root/frontend-src-root/src/frameworks-and-drivers/messaging/RewriteRuleProxyServiceImpl.ts) を参照

この分離により以下を実現する：
- **依存性逆転**: interface-adapters → frameworks-and-drivers の直接依存を回避
- **Repository の単純化**: Repository は Entity のみを扱い、DTO 変換を知らない
- **テスタビリティ**: Mapper のテストで IRewriteRuleMessagingPort をモック可能
- **Clean Architecture 準拠**: 依存は内向き（outer → inner）に保たれる

### DTO 定義の基準

DTO の粒度は以下の基準に従う：

| 種別 | 基準 | 説明 |
|------|------|------|
| エンティティ DTO | 1 DTO = 1 エンティティ | エンティティの全プロパティを含む。取得系操作の戻り値に使用 |
| 操作別 DTO | 1 DTO = 1 操作 | 操作に必要な最小限のデータのみ含む。更新系操作の引数に使用 |

**ADR-001 との整合性**: Gateway Interface のメソッドシグネチャと対応させる。

この基準により以下を防止する：

- **肥大化の防止**: 操作別 DTO に不要なデータを含めない
- **乱立の防止**: フィールドごとに DTO を分割しない（操作単位でまとめる）

**命名規約**: [メッセージング層 コーディング規約](../coding-standards/src/frameworks-and-drivers/messaging.md) 参照

## 理由

### 採用理由

1. **WXT 公式推奨**: WXT が推奨するメッセージングライブラリ
2. **型安全**: TypeScript の型推論が自動的に機能
3. **コード規約準拠**: switch 文が不要
4. **適材適所**: データ取得は RPC スタイル、コマンド送信はイベント駆動で自然な表現
5. **全方向の型安全性**: Background → Content Script 通信も型安全

### 使い分けの理由

| ライブラリ | 向いているケース | 理由 |
|-----------|-----------------|------|
| proxy-service | データ取得、CRUD 操作 | `service.getAll()` のような Repository パターンと親和 |
| messaging | コマンド送信、通知 | 特定タブへの送信、イベント駆動が自然 |

### トレードオフ

- 外部ライブラリへの依存が増加（2つ）
- 2つのライブラリの学習コスト
- Background Script での同期的な登録が必須（proxy-service）

## 影響ドキュメント

このADRが変更された場合、以下のドキュメントも更新が必要：

- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](./003-unified-db-access-via-messaging.md) - DTO 定義、変換責務
- 各機能の設計ドキュメントのうち、`01-class-design.md`、`02-sequence.puml`

## 関連ドキュメント

- [ADR-001: Clean Architecture with Presenter Pattern](./001-clean-architecture-with-presenter-pattern.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](./003-unified-db-access-via-messaging.md)
- [@webext-core/proxy-service - npm](https://www.npmjs.com/package/@webext-core/proxy-service)
- [@webext-core/messaging - npm](https://www.npmjs.com/package/@webext-core/messaging)
- [WXT Messaging Guide](https://wxt.dev/guide/essentials/messaging)
