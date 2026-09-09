---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-messaging"
  type: governance
---

# メッセージング層 コーディング規約

## 適用シナリオ

1. **Background ScriptとContent Script間でデータをやり取りするクラスを新規作成する場合**: `@webext-core/proxy-service`を使用するクラスは`ProxyService`サフィックスを付ける。例えば、RewriteRuleのCRUD操作をBackground経由で行うクラスは`RewriteRuleProxyService`とする
2. **Background ScriptからContent Scriptへ一方向メッセージを送信するクラスを作成する場合**: 送信側は`MessageSender`、受信側は`MessageReceiver`サフィックスを付けて、メッセージの方向と役割を明確にする

## 命名規約

### メッセージングクラス

メッセージングクラスの命名は、使用するライブラリと役割に応じて以下のパターンを使用する。

| 種別 | 命名パターン | 例 | 用途 |
|------|-------------|-----|------|
| proxy-service | `{Entity}ProxyService` | `RewriteRuleProxyService` | Background へのデータ取得・更新 |
| messaging 送信側 | `{Context}MessageSender` | `BackgroundScriptMessageSender` | Background → Content Script への送信 |
| messaging 受信側 | `{Context}MessageReceiver` | `ContentScriptMessageReceiver` | Content Script での受信 |

**理由**:
- `ProxyService`: `@webext-core/proxy-service` を使用していることが明確
- `MessageSender` / `MessageReceiver`: 送受信の役割が一目瞭然

## eslint-rule

`host-frontend-root/frontend-src-root/eslint-rules/clean-architecture/frameworks-and-drivers/messaging/service.js`
