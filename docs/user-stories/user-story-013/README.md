---
codd:
  node_id: "req:user-stories-user-story-013-readme"
  type: requirement
---

# User Story 013: CLAUDE.mdリファクタリング

## ストーリー

> CLAUDE.mdが適切に分割・整理され、開発者が必要な情報に素早くアクセスできる

## 概要

現在のCLAUDE.mdは約525行と巨大で、複数の責務が混在している。ファイルを適切に分割し、責務ごとに整理することで、可読性と保守性を向上させる。

## 背景

### 現状の課題

1. **ファイルサイズが巨大**: 525行あり、必要な情報を見つけるのに時間がかかる
2. **責務の混在**: 以下の異なる責務が1ファイルに混在している
   - タスク別チェックリスト（新規メソッド追加、既存メソッド修正など）
   - プロジェクト概要（技術スタック、アーキテクチャ）
   - 開発コマンド（make, docker compose）
   - アーキテクチャ詳細（Clean Architecture層、DI）
   - テスト要件（戦略書、構造、標準）
   - Claude Code Web専用ワークフロー
   - トラブルシューティング
3. **言語の混在**: 日本語と英語が混在している
4. **重複**: 一部の情報（例: テスト戦略書への参照）が複数箇所に記載されている

### 目標

- CLAUDE.mdをエントリポイントとして最小限の情報のみ残す
- 詳細情報は`docs/claude/`配下に分割して配置する
- 各セクションの責務を明確にする
- 必要な情報への導線を整理する

## 関連ドキュメント

- `.AI/docs/editing-guide.md` - ドキュメント編集ガイド
- `docs-rules/` - 各種ドキュメントルール

## 現状分析

このユーザーストーリーはドキュメントのリファクタリングが中心であり、既存アプリケーションロジックの修正は発生しない。そのため分類A〜Eの差分分析は対象外とする。

### 対象ファイル

| ファイル | 現在の行数 | 対応方針 |
|---------|----------|---------|
| CLAUDE.md | 約525行 | エントリポイントとして最小化（約100行以下目標） |

### 分割先候補

| 分割先 | 内容 |
|-------|------|
| `docs/claude/project-overview.md` | プロジェクト概要、技術スタック |
| `docs/claude/development-commands.md` | 開発コマンド（make, docker compose） |
| `docs/claude/architecture.md` | Clean Architecture詳細、DI |
| `docs/claude/testing.md` | テスト要件、戦略書、構造 |
| `docs/claude/git-workflow.md` | Git操作、ブランチ戦略、PR |
| `docs/claude/claude-code-web.md` | Claude Code Web専用ワークフロー |
| `docs/claude/troubleshooting.md` | トラブルシューティング |

## 開発戦略

### Phase 1: 分割ファイル作成

- [ ] `docs/claude/` ディレクトリ作成
- [ ] `project-overview.md` 作成（Project Overview、Project-Specific Rules）
- [ ] `development-commands.md` 作成（Common Development Commands、Git Worktree）
- [ ] `architecture.md` 作成（Architecture Overview、Import Path Rules、OO Design Rules）
- [ ] `testing.md` 作成（Testing Requirements全体）
- [ ] `git-workflow.md` 作成（Git Workflow）
- [ ] `claude-code-web.md` 作成（Claude Code Web専用ワークフロー）
- [ ] `troubleshooting.md` 作成（Troubleshooting、WXT Framework Specifics）

### Phase 2: CLAUDE.md最小化

- [ ] CLAUDE.mdをエントリポイント形式にリファクタリング
  - タスク別チェックリストは維持（頻繁に参照されるため）
  - 各詳細セクションは分割先へのリンクに置換
  - 目標: 約100行以下

### Phase 3: 検証

- [ ] 全リンクの動作確認
- [ ] 情報の重複がないことを確認
- [ ] 必要な情報への導線が明確であることを確認
- [ ] CLAUDE.mdをmarkdownlintとchecklinksの対象に追加

### 対象外

- `.clinerules/` 配下のワークフロー定義の変更
- `docs-rules/` 配下のルール変更

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
