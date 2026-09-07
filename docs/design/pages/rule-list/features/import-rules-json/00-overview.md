---
codd:
  node_id: "design:design-pages-rule-list-features-import-rules-json-00-overview"
  type: design
---

# ルールJSONインポート機能 設計概要

<!-- 本ドキュメントは docs-rules/design/00-overview.md で定義された機能概要ドキュメント形式に従います。
     ADR（Architecture Decision Record）については docs/adr/ を参照してください。
     関連ADR: ADR-001, ADR-005 （本ドキュメント末尾の「関連ドキュメント」セクション参照） -->

## 機能概要

ルール一覧画面において、JSONファイルから全ルールを一括でインポートできる機能を追加する。
エクスポート機能（PR#393）の完全な逆操作であり、バックアップからのリストアや PC 間の設定移行を主なユースケースとする。

## ユーザーストーリー

> ルール一覧でJSONファイルからルールをインポートできる

## トリガー

| アクター | 画面 | トリガー |
|---------|------|---------|
| ユーザー | ルール一覧(rules) | インポートボタンをクリック → ファイル選択 → インポート実行 |

※ システムイベントによる自動トリガーはなし

## 機能要件

### インポート（1フェーズ: 一括上書き、プレビュー確認なし）

- ルール一覧画面のエクスポートボタン隣にインポートボタンを表示する
- **ルールが0件の場合もインポートボタンを表示する**（空状態からのインポートに対応）
- インポートボタンクリック時にファイル選択ダイアログを表示する（`<input type="file" accept=".json">`）
- ファイル選択後、確認ダイアログなしで直接バリデーション → 一括置換を実行する
- インポート実行後、全既存ルールを削除して JSON のルールで置換する（Dexie.transaction('rw') による原子的 replaceAll）
- インポート処理中の重複実行を `isImporting` フラグで防止する（`ImportButton.disabled` に反映）

### インポート方式（一括上書き）

- 全既存ルールを削除してから、JSONファイルのルールで置換する
- インポートJSONのIDが存在する場合はそのIDを使用する（リストアユースケース）
- IDが存在しない場合はDB側で自動採番する（外部JSONインポートユースケース）

### JSONフォーマット（エクスポートと互換）

- エクスポート機能が出力するJSON形式と互換性を持つ
  ```json
  {
    "version": "1.0",
    "exportedAt": "2026-02-23T10:30:00+09:00",
    "rules": [
      { "id": 1, "oldString": "...", "newString": "...", "urlPattern": "...", "isRegex": false, "isActive": true }
    ]
  }
  ```

### バリデーション

インポート処理では以下の順序で検証を行い、いずれかで失敗した場合は即座にエラートーストで通知する（原子的置換は実行されない）:

| レベル | 検証内容 | 表示メッセージ |
|--------|---------|----------------|
| L0 | ファイルサイズ（5MB 上限） | 「ファイルサイズが上限（5MB）を超えています ({N} bytes)」 |
| L1 | JSON 構文 | 「不正なJSONファイルです」 |
| L2 | スキーマ（version/rules の有無・型） | 「JSONスキーマが不正です（versionとrulesが必要です）」 |
| L3 | バージョン（"1.0" 以外） | 「未対応のバージョンです: X.X」 |
| L4 | ルール件数 0件 | 「インポートするルールがありません」 |
| L5 | ルール件数上限（1000件） | 「ルール件数が上限（1000件）を超えています」 |
| L6 | rules 配列エントリの構造（オブジェクトであること・必須フィールド oldString/newString/urlPattern/isRegex の有無と型。isActive は省略可・指定時は真偽値） | 「rules配列に不正なエントリが含まれています: {entry}」 |
| L7 | ルール id の重複（id 指定ありのエントリのみ対象） | 「インポートJSON内のルールIDが重複しています: {ids}」 |
| L8 | 各ルールの id 整合性（branded type・0 は未採番予約値と衝突するため拒否・id 未指定は自動採番のため対象外） | InvalidRuleIdError の message（例: 整数でない / NaN / Infinity / 0 等） |
| L9 | Storage 例外（原子的置換時） | 「インポート処理中にエラーが発生しました: {cause.message}」 |

### セキュリティ

- ファイルサイズ上限: 5MB（DoS 対策）。`ImportFileSize` Value Object のコンストラクタで強制
- ルール件数上限: 1000件（DB 圧迫対策）。`ImportRulesCollection` Value Object のコンストラクタで強制

### エラーハンドリング

- バリデーション失敗時はトースト通知でユーザーに通知する（プレビュー表示なし）
- インポート処理失敗時はトースト通知でユーザーに通知する

## 影響ドキュメント

- [ルール一覧 UI設計](../../ui.md) - インポートボタンの追加

## 関連ドキュメント

- [ルールJSONエクスポート機能](../export-rules-json/) - 対称機能（エクスポートの逆操作）
- [ルール削除機能](../delete-rule/) - 先行機能(同様のアーキテクチャ)
- [ADR-001: Clean Architecture with Presenter Pattern](../../../../../adr/001-clean-architecture-with-presenter-pattern.md)
- [ADR-002: メッセージングに @webext-core を採用](../../../../../adr/002-messaging-with-webext-core.md)
- [ADR-003: DB アクセスを messaging 経由に統一し DTO を使用](../../../../../adr/003-unified-db-access-via-messaging.md)
- [ADR-005: ReactコールバックをPresenterに注入するためのFactoryパターン採用](../../../../../adr/005-factory-pattern-for-react-callback-injection.md)
