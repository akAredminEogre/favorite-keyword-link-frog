---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-messaging-dto"
  type: governance
---

# メッセージング DTO コーディング規約

## 概要

`@webext-core/proxy-service` を使用したメッセージング用DTOの規約。

> **参照**: [ADR-002: メッセージングに @webext-core を採用](../../../../adr/002-messaging-with-webext-core.md)

## action/type フィールドは不要

`@webext-core/proxy-service` ではメソッド名がアクションの識別子となるため、DTOに `action` や `type` フィールドは不要。

## DTO の設計原則

- DTOは**データのみ**を保持する
- アクション識別子（`action`, `type`）は含めない
- 操作に必要な最小限のフィールドのみ定義する

## 命名規約

| 種別 | 命名パターン | 配置ディレクトリ |
|------|-------------|-----------------|
| リクエストDTO | `{操作名}RequestDTO` | `dto/request-dto/` |
| エンティティDTO | `{Entity}DTO` | `dto/` |

> **参照**: [メッセージング層 コーディング規約](../messaging.md)

## eslint-rule

`host-frontend-root/frontend-src-root/eslint-rules/clean-architecture/frameworks-and-drivers/messaging/dto.js`
