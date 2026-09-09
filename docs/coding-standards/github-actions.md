---
codd:
  node_id: "governance:coding-standards-github-actions"
  type: governance
---

# GitHub Actions コーディングガイドライン

## 概要

`.github/workflows/` 配下に配置する GitHub Actions ワークフローファイルの記述ルール。
Copilotレビュー等で繰り返し指摘されるパターンを事前に防ぐことを目的とする。

---

## 改行コード

- 改行コードは **LF（`\n`）のみ** を使用すること
- CRLF（`\r\n`）は禁止
- `.gitattributes` に `*.yml text eol=lf` を設定し、自動変換を防ぐこと

### 適用シナリオ

1. **Windowsで編集した場合**: エディタがCRLFで保存することがある。コミット前に `file .github/workflows/*.yml` で改行コードを確認すること
2. **新規ワークフロー作成時**: テンプレートをWindowsからコピーするとCRLFが混入する可能性がある。作成直後に確認すること

### eslint-rule

GitHub Actions YAMLはESLintの対象外。`.editorconfig` および `.gitattributes` で機械的に強制すること。

---

## ページネーション

- GitHub API の `.list` 系エンドポイントを使用する際は、必ずページネーションを実装すること
- `per_page: 100` を指定するか、`paginate` メソッドを使用して全件取得を保証すること
- デフォルト取得件数（30件）に依存した実装は禁止

### 適用シナリオ

1. **PRのコメント一覧を取得する場合**: コメントが30件を超えるPRでは、ページネーションなしだと未解決スレッドを見落とす可能性がある
2. **リポジトリのPR一覧を取得する場合**: アクティブなPRが30件を超えるリポジトリではデフォルト取得で件数が不足する

### eslint-rule

GitHub Actions YAMLおよびスクリプト内のAPIコールはESLintの対象外。コードレビューで確認すること。

---

## Null / Undefined 安全性

- オブジェクトのプロパティアクセスには **オプショナルチェーン（`?.`）** を使用すること
- 配列・文字列操作では `undefined` になりうる値にデフォルト値（`?? []`、`?? ''` 等）を設定すること
- `null` および `undefined` チェックを省略した直接アクセスは禁止

### 適用シナリオ

1. **GraphQL レスポンスのネストされたフィールドにアクセスする場合**: `nodes` や `edges` がnullになりうるため、オプショナルチェーンが必要
2. **APIレスポンスの配列をループ処理する場合**: レスポンスが空配列ではなくnullを返す場合があるため、デフォルト値を設定すること

### eslint-rule

GitHub Actions内スクリプトはESLintの対象外。コードレビューで確認すること。

---

## エラーハンドリング

- API呼び出しや外部コマンド実行は **`try-catch` でラップ** すること
- エラー内容をログに出力し、後続ステップが状態を把握できるようにすること
- エラー発生時の終了コードを明示的に設定し、ワークフローの成否が正確に伝わるようにすること

### 適用シナリオ

1. **GitHub API呼び出しが失敗した場合**: ネットワーク障害やレート制限によるエラーをキャッチし、ワークフローが無音で失敗しないようにする
2. **外部スクリプトを `run:` ステップで実行する場合**: スクリプト内で例外が発生した場合にエラーメッセージをstderrに出力し、デバッグを容易にする

### eslint-rule

GitHub Actions YAMLはESLintの対象外。コードレビューで確認すること。

---

## Permissions 設定

- ワークフロー全体または各ジョブに **`permissions:` を明示的に設定** すること
- 最小権限原則に従い、必要なスコープのみ `read` または `write` を付与すること
- 不要なスコープは `none` にするか省略すること（デフォルトで制限される設定が前提）
- Pull Request の内容を読む場合は `pull-requests: read`、コメント投稿には `pull-requests: write` が必要

### 適用シナリオ

1. **GraphQL API でPRのレビュースレッドを参照する場合**: `contents: read` および `pull-requests: read` が必要。不足すると403エラーとなる
2. **`octokit/request-action` でコメントを投稿する場合**: `pull-requests: write` が必要。ワークフローレベルに `read-all` を設定しているだけでは書き込み権限が付与されない

### eslint-rule

GitHub Actions YAMLはESLintの対象外。`.github/workflows/*.yml` のレビュー時にPermissionsセクションの存在を確認すること。

---

## ファイル末尾改行

- すべてのワークフローファイルは **末尾に改行を1行** 入れること（POSIX標準）
- 末尾改行なしのファイルはPOSIX非準拠であり、一部のツールで警告が発生する
- エディタの「末尾改行を自動追加」設定を有効にすること

### 適用シナリオ

1. **新規ワークフローを作成した場合**: ファイル最終行の後に改行が存在することを保存前に確認すること
2. **既存ファイルをコピーして編集した場合**: コピー元に末尾改行がない場合、そのまま引き継がれる可能性がある

### eslint-rule

GitHub Actions YAMLはESLintの対象外。`.editorconfig` に `insert_final_newline = true` を設定することで機械的に強制できる。

---

## GitHub Actions 式での `${{ }}` 使用制限

- `if:` 条件式の中では **`${{ }}` を使用しない** こと
- `if:` はデフォルトで式として評価されるため `${{ }}` は冗長であり、Copilotレビューで指摘される
- コンテキスト変数（`github.event_name`、`steps.xxx.outputs.yyy` 等）は `${{ }}` なしで直接参照すること
- `${{ }}` が必要なのは `run:` ステップや `with:` パラメータなど、式として評価されない箇所のみ

### 適用シナリオ

1. **ジョブのskip条件を `if:` で記述する場合**: `${{ github.event_name == 'push' }}` ではなく `github.event_name == 'push'` と記述する
2. **前のステップの出力に基づいて条件分岐する場合**: `${{ steps.check.outputs.result == 'true' }}` ではなく `steps.check.outputs.result == 'true'` と記述する

### eslint-rule

GitHub Actions YAMLはESLintの対象外。コードレビューおよびCopilotレビューで確認すること。
