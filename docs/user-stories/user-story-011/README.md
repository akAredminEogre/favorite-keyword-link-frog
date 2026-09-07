---
codd:
  node_id: "req:user-stories-user-story-011-readme"
  type: requirement
---

# User Story 011: markdownlint導入

## ストーリー

> Markdownドキュメントの記述ルールをmarkdownlintで自動検証できる

## 概要

現在手動でPRレビュー時に確認しているMarkdown記述ルールを、markdownlintにより自動検証可能にする。これにより規約違反を早期に検出し、レビュー負荷を軽減する。

## 背景

[docs-rules/common/](../../../docs-rules/common/index.md) で定義されている以下の規約は、現在PRレビューで確認している:

| 規約 | markdownlintルール | 備考 |
|-----|-------------------|------|
| コードブロックの言語指定必須 | MD040 | 必須 |
| 許可する言語識別子の制限 | MD040 + `allowed_languages` | 設定で制限 |
| 見出しレベルの階層スキップ禁止 | MD001 | 必須 |
| コードフェンス言語識別子の小文字使用 | - | カスタムルールが必要 |

markdownlintを導入することで、これらを自動検証可能にする。

## 関連規約

- [language-and-style.md](../../../docs-rules/common/language-and-style.md) - コードフェンス言語識別子
- [markdown.md](../../../docs-rules/common/markdown.md) - Markdown記法ルール

## 現状分析

このユーザーストーリーはツール導入と開発環境設定の変更が中心であり、既存アプリケーションロジックの修正は発生しない。そのため分類A〜Eの差分分析は対象外とする。

### 現状

- markdownlint 関連パッケージ: 未インストール
- 設定ファイル(.markdownlint.jsonc): 未作成
- 除外ファイル(.markdownlintignore): 未作成
- 対象 Markdown ファイル(`docs/` 配下): 約 1,247 ファイル(83,555 行) ※ 2026-01-25 時点、以下のようなコマンドで集計
  `find docs -name '*.md' -print0 | xargs -0 wc -l`

## 開発戦略

### Phase 1: 基盤構築

- [x] markdownlint-cli2 パッケージのインストール
- [x] `.markdownlint.jsonc` 設定ファイルの作成(MD001, MD040 + allowed_languages)
- [x] `.markdownlintignore` 除外ファイルの作成
- [x] `host-frontend-root/frontend-src-root/package.json` へのスクリプト追加(`lint:md`, `lint:md:fix`)
- [x] `Makefile` へのコマンド追加

### Phase 2: 既存ドキュメント修正

- [x] 違反箇所の検出(`make lintmd` 実行; フロントエンドコンテナ内での `npm run lint:md` をラップ)
- [x] ルートディレクトリの主要ファイル(README.md, CLAUDE.md)の違反修正
- [x] MD001(見出しレベル階層スキップ)違反の修正 (docs/配下は段階的に修正)
- [x] MD040(言語指定なし/許可外言語)違反の修正 (docs/配下は段階的に修正)

### Phase 2.5: 対象ディレクトリの拡大

以下のディレクトリはmarkdownlint/checklinksの対象外となっている。段階的に対象に追加し、違反を修正する。

- [x] `.AI/` ディレクトリをmarkdownlint対象に追加・違反修正
- [x] `.AI/` ディレクトリをchecklinks対象に追加・違反修正
- [x] `.claude/` ディレクトリをmarkdownlint対象に追加・違反修正
- [x] `.claude/` ディレクトリをchecklinks対象に追加・違反修正
- [x] `.clinerules/` ディレクトリをmarkdownlint対象に追加・違反修正
- [x] `.clinerules/` ディレクトリをchecklinks対象に追加・違反修正
- [x] `.github/` ディレクトリをmarkdownlint対象に追加・違反修正
- [x] `.github/` ディレクトリをchecklinks対象に追加・違反修正

> **Note**: docs/配下には約1,200ファイル以上のMarkdownがあり、すべての違反を一度に修正することは現実的ではない。CIで警告として検出できるようにし、段階的に修正するアプローチを取る。

### Phase 3: CI統合(任意)

- [x] pre-commit フックへの追加検討
- [x] GitHub Actions への追加検討 (警告として実行)

### 対象外

- コードフェンス言語識別子の小文字使用: カスタムルール実装が必要なため、本ユーザーストーリーでは対象外とする(将来の拡張として別ユーザーストーリーで対応)

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
