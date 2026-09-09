---
codd:
  node_id: "design:design-pages-rule-list-features-export-rules-json-00-overview"
  type: design
---

# ルールJSONエクスポート機能 設計概要

## 機能概要

ルール一覧画面において、保存済みの全ルールをJSON形式でファイルにエクスポートできる機能を追加する。

## ユーザーストーリー

> ルール一覧でルールをJSONファイルとしてエクスポートできる

## トリガー

| アクター | 画面 | トリガー |
|---------|------|---------|
| ユーザー | ルール一覧(rules) | エクスポートボタンをクリック |

※ システムイベントによる自動トリガーはなし

## 機能要件

### エクスポート

- ルール一覧画面のテーブル右上にエクスポートボタンを表示する
- エクスポートボタンクリック時に全ルールをJSON形式でダウンロードする
- ルールが0件の場合はエクスポートボタンを無効化（disabled）する
- エクスポート処理中の重複実行を防止する

### JSONフォーマット

- 将来のインポート機能と互換性のある形式とする
- メタデータ（エクスポート日時、バージョン）を含める
- ルールデータにはIDを含む全属性を含める（設計決定: バックアップ・リストア用途のため、ID除外案を経てIDを含む全属性とすることを最終決定）

### ファイル命名

- ファイル名: `frog-frame-front-rules-YYYYMMDD_hhmmss.json`（エクスポート日時を含む。**ローカルタイム**を使用）
- `exportedAt`: ISO 8601形式（ローカルタイム + タイムゾーンオフセット、例: `2026-02-23T10:30:00+09:00`）

### エラーハンドリング

- ルール取得失敗時はトースト通知でユーザーに通知する
- ダウンロード処理失敗時はトースト通知でユーザーに通知する

## 影響ドキュメント

- [ルール一覧 UI設計](../../ui.md) - エクスポートボタンの追加

## 関連ドキュメント

- [ルール削除機能](../delete-rule/) - 先行機能(同様のアーキテクチャ)
- [ルールトグル機能](../toggle-rule-active/) - 先行機能(同様のアーキテクチャ)
- [ADR-001: Clean Architecture with Presenter Pattern](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)
- [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)
- [ADR-005: ReactコールバックをPresenterに注入するためのFactoryパターン採用](../../../../../adr/005-factory-pattern-for-react-callback-injection.md)
