# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

**frog-frame-front** は、DOMエレメントを操作するWXTフレームワーク製のChrome拡張機能プロジェクトです。Clean ArchitectureおよびDomain-Driven Design（DDD）パターンに基づいて設計されています。

- **主要技術スタック**: TypeScript、React、WXT（Chrome拡張機能フレームワーク）
- **アーキテクチャ**: Clean Architecture + DDD
- **DIコンテナ**: awilix（createContainer による手動登録）
- **テスト**: Vitest（ユニットテスト）、Playwright（E2Eテスト）
- **開発環境**: Dockerベースの開発環境

## プロジェクト固有のルールとワークフロー

### コーディング規約

- **`docs/coding-standards/`** - コアコーディング規約（テスト規約・モック配置ルール等）
- **`.clinerules/02-workflow-automation/`** - 自動化ワークフロー定義

**注意**: このプロジェクトで作業する際は、詳細なガイダンスのために `.clinerules/` ファイルを必ず参照してください。

## 共通開発コマンド

→ セットアップ手順・利用可能なコマンド一覧は [README.md](README.md) を参照

### タスク完了前の確認

→ 詳細は [.AI/testing-requirements.md](.AI/testing-requirements.md) を参照

## タスク別チェックリスト

### 新規メソッド/クラスを追加する場合・既存メソッドを修正する場合

→ 詳細は [.AI/testing-requirements.md](.AI/testing-requirements.md) を参照

### docs/・docs/design/ 配下のドキュメントを作成・編集する場合・ADRを作成・編集する場合

→ 詳細は [.AI/docs/editing-guide.md](.AI/docs/editing-guide.md) を参照

### E2E specファイルを分割・統合・リネームする場合

→ 詳細は [.AI/tests/e2e/consistency-maintenance-guideline.md](.AI/tests/e2e/consistency-maintenance-guideline.md) を参照

### CLAUDE.mdを編集する場合

→ 詳細は [.AI/docs/claude-md-editing-guide.md](.AI/docs/claude-md-editing-guide.md) を参照

## アーキテクチャ概要

→ 詳細は [.AI/architecture.md](.AI/architecture.md) を参照

## インポートパスルール

**重要**: 全インポートは設定済みエイリアスを使った絶対パスを使用すること。

→ 詳細は [.AI/import-paths.md](.AI/import-paths.md) を参照

## オブジェクト指向設計ルール（ThoughtWorksアンソロジー）

→ 詳細は [.AI/oo-design-rules.md](.AI/oo-design-rules.md) を参照

## テスト要件

→ 詳細は [.AI/testing-requirements.md](.AI/testing-requirements.md) を参照

## WXTフレームワーク詳細

→ 詳細は [.AI/wxt-framework.md](.AI/wxt-framework.md) を参照

## 開発フロー

→ 詳細は [.AI/development-flow.md](.AI/development-flow.md) を参照

- スケルトン実装フェーズ廃止・E2E 1パターン実装直行
- 並行開発: [.AI/parallel-branch-development.md](.AI/parallel-branch-development.md)

## Gitワークフロー

→ 詳細は [README.md の「開発ワークフロー」セクション](README.md#開発ワークフロー) を参照

- **Git Worktree（並行開発）**: [docs/GIT_WORKTREE.md](docs/GIT_WORKTREE.md) を参照（`make wt-dev`・`make wt-disable`・`make wt-remove`）

## PR運用

→ 詳細は [.AI/pr-policy.md](.AI/pr-policy.md) を参照

## Claude Code Web専用ワークフロー

→ 詳細は [.AI/claude-code-web-workflow.md](.AI/claude-code-web-workflow.md) を参照

## トラブルシューティング

→ 詳細は [.AI/troubleshooting.md](.AI/troubleshooting.md) を参照

## codd（CoDD: Coherence-Driven Development）使用規約

本リポには codd-dev（PyPI 3.37.0）の brownfield 計装が導入されている（設定: `codd/codd.yaml`）。

### 実行場所

- codd コマンドは**正本クローンのルートでのみ実行すること**
- `worktrees/` 配下では実行しない（`codd/scan/`・`codd/reports/` は git 管理外のため、worktree 側で実行するとグラフが分裂する）

### 許可コマンド（読み取り・検証系のみ）

- `codd scan` / `codd validate` / `codd impact` / `codd verify`

### 禁止コマンド（生成・改変系）

- `codd scaffold` / `codd generate` / `codd repair` / `codd fix` / `codd implement` / `codd extract --ai` / `codd hooks`（git hook 導入）等の生成・改変系コマンドは**実行禁止**
- 理由: 既存ファイルを上書きする恐れがある（例: `vitest.config.ts` の WSL 対策 `pool: forks` / `maxForks: 2` が scaffold の owned_files 上書きで失われる）
