---
codd:
  node_id: "doc:git-worktree"
  type: document
---

# Git Worktree Guide

<!-- Note: When updating this document, also sync relevant sections in CLAUDE.md -->

Git worktreeは、同じリポジトリの複数のブランチを同時にチェックアウトできる機能です。これにより、ブランチの切り替えなしで複数の機能を並行開発できます。

## シェル関数の設定（推奨）

便利なworktree移動コマンドを使用するため、以下をシェル設定ファイルに追加してください：

```bash
# ~/.bashrcまたは~/.zshrcに追加
source /path/to/frog-frame-front/scripts/main.sh
```

これにより以下のコマンドが使用可能になります：

### ナビゲーションコマンド
- `wt-cd <branch>` - 指定したworktreeディレクトリに移動
- `wt-cd-current` - 現在のworktreeディレクトリに移動（内部で`wt-cd`を使用）

### シェルラッパーコマンド（Tab補完対応）

`make`コマンドの短縮版として、以下のシェル関数が使用できます。**BashとZsh両方でTab補完が有効**です。

| コマンド | 説明 | Tab補完対象 |
|---------|------|-------------|
| `wt-add <branch>` | worktree作成 | 全ブランチ（ローカル/リモート） |
| `wt-init <branch>` | worktree初期化 | 全ブランチ（ローカル/リモート） |
| `wt-remove <branch>` | worktree削除 | 既存worktree |
| `wt-dev <branch>` | 開発サーバー起動 | 既存worktree |

#### 使用例

```bash
# Tab補完でブランチを選択してworktree作成
wt-add feat<TAB>  # → wt-add feature-branch

# Tab補完でブランチを選択してworktree初期化
wt-init feat<TAB>  # → wt-init feature-branch

# Tab補完で既存worktreeを選択して開発開始
wt-dev feat<TAB>  # → wt-dev feature-branch

# Tab補完で既存worktreeを選択して削除
wt-remove feat<TAB>  # → wt-remove feature-branch
```

#### makeコマンドとの対応

| シェルラッパー | 対応するmakeコマンド |
|---------------|---------------------|
| `wt-add feature-x` | `make wt-add BRANCH=feature-x` |
| `wt-init feature-x` | `make wt-init BRANCH=feature-x` |
| `wt-remove feature-x` | `make wt-remove BRANCH=feature-x` |
| `wt-dev feature-x` | `make wt-dev BRANCH=feature-x` |

Tab補完により、長いブランチ名を入力する手間が省けます。

## 利点

- **並行開発**: 複数のブランチで同時に作業可能
- **コンテキスト切り替えの削減**: stash/切り替えの手間なし
- **独立した作業環境**: 各worktreeは独立したnode_modules、ビルドキャッシュを持つ
- **コードレビュー効率化**: PRレビュー中も別ブランチで開発継続可能

## ディレクトリ構造

```text
frog-frame-front/           # メインワークツリー（developブランチ）
├── worktrees/              # worktreeディレクトリ（.gitignoreで除外）
│   ├── feature-A/          # feature-Aブランチのworktree
│   ├── feature-B/          # feature-Bブランチのworktree
│   └── hotfix-123/         # hotfix-123ブランチのworktree
└── ...
```

## Makeコマンド

### 基本コマンド

#### worktree一覧表示

```bash
make wt-list
```

#### 新規worktree作成

```bash
# 既存ブランチをworktreeとして追加
make wt-add BRANCH=feature-branch

# 新しいブランチを作成してworktreeとして追加
make wt-add BRANCH=new-feature-branch
```

`wt-add`コマンドは以下の処理を実行します：
- worktreeディレクトリの作成
- ブランチの作成/チェックアウト
- 設定ファイル（.env、matchUrl.ts）のコピー

**注**: Docker環境のセットアップやnpm installは行いません。開発を開始するには`wt-init`または`wt-dev`を実行してください。

#### worktree初期化

```bash
# worktreeの開発環境を初期化（Docker、npm install、wxt prepare）
make wt-init BRANCH=feature-branch
```

`wt-init`コマンドは以下の処理を実行します：
- worktreeが存在しない場合は自動的に`wt-add`を実行
- Docker環境の切り替え（docker-compose.override.yml、.env.worktreeの作成）
- npm install の実行
- WXT準備（npx wxt prepare）の実行

#### worktree削除

```bash
make wt-remove BRANCH=feature-branch
```

#### 不要なworktree参照を削除

```bash
make wt-prune
```

### 開発コマンド

#### worktreeで開発サーバー起動

```bash
# worktreeの開発サーバーを起動（自動的に他のコンテナを停止）
make wt-dev BRANCH=feature-branch

# 別のworktreeに切り替え
make wt-dev BRANCH=other-branch
```

`wt-dev`コマンドは以下を自動実行します：
- **worktreeが初期化されていない場合は自動的に`wt-init`を実行**（worktreeが存在しない場合は`wt-add`も実行）
- 他のworktreeのDockerコンテナを自動停止
- ポート3000の競合回避
- 指定されたworktreeディレクトリで独立した開発環境を起動

#### Dockerコンテナ管理

```bash
# worktreeのDockerコンテナを停止
make wt-down

# worktreeのDockerコンテナを起動
make wt-up

# Storybookを起動（メインリポジトリ・worktree両方で動作）
make storybook
```

注：`make storybook`は自動的に環境を検出し、worktreeモードでは`.env.worktree`の設定を使用します。

### ナビゲーション・シェルラッパーコマンド

#### 現在のworktree確認

```bash
# 現在アクティブなworktreeを表示
make wt-current
```

#### シェルラッパーコマンド（Tab補完対応）

シェル関数の設定が必要です（「シェル関数の設定」セクション参照）。

```bash
# Tab補完でブランチを選択してworktree作成
wt-add feature-branch

# Tab補完で既存worktreeを選択して開発開始
wt-dev feature-branch

# Tab補完で既存worktreeを選択して削除
wt-remove feature-branch

# worktreeディレクトリへ移動
wt-cd feature-branch  # 特定のworktreeへ移動
wt-cd-current         # 現在のworktreeへ移動
```

## 使用例

### 例1: 新機能開発中にバグ修正

```bash
# メインでfeature-Aを開発中
# 緊急バグ修正のためhotfixブランチで開発開始（自動でwt-add、wt-initも実行）
make wt-dev BRANCH=hotfix-critical-bug
# ... バグ修正作業 ...

# 元のfeature-Aブランチに戻る
make wt-dev BRANCH=feature-A

# 作業完了後、worktreeを削除
make wt-remove BRANCH=hotfix-critical-bug
```

### 例2: 複数機能の切り替え開発

```bash
# feature-Aで開発開始（自動でwt-add、wt-initも実行）
make wt-dev BRANCH=feature-A
# ... 機能A開発 ...

# feature-Bに切り替え（自動的にfeature-Aの環境を停止、feature-Bをwt-add、wt-init）
make wt-dev BRANCH=feature-B
# ... 機能B開発 ...

# 再度feature-Aに戻る（すでに初期化済みなのでそのまま起動）
make wt-dev BRANCH=feature-A
```

### 例3: レビュー中の並行開発

```bash
# 現在PR中のfeature-reviewでレビュー対応作業開始
make wt-dev BRANCH=feature-review
# ... レビュー修正 ...

# 新機能開発に切り替え
make wt-dev BRANCH=feature-next
# ... 新機能開発 ...

# またレビュー対応に戻る
make wt-dev BRANCH=feature-review
```

## 注意事項

1. **推奨コマンド**: 開発には`make wt-dev`を使用してください（自動でwt-add、wt-initを実行し、ポート競合も回避）
2. **段階的なセットアップ**: 必要に応じて`wt-add`（worktree作成のみ）と`wt-init`（Docker環境セットアップ）を個別に実行できます
3. **ディスク容量**: 各worktreeはnode_modulesを持つため、ディスク容量に注意してください
4. **worktreeディレクトリ**: `worktrees/`ディレクトリは`.gitignore`で除外されています
5. **自動化された切り替え**: `wt-dev`コマンドにより他のコンテナ停止・環境切り替え・開発サーバー起動が自動化されています
6. **内部ヘルパー関数**: `_`で始まるコマンド（例：`_wt-setup-env`）は内部使用のみで、直接実行しないでください

## 簡単ワークフロー（まとめ）

**開発開始（これだけでOK）**：
```bash
make wt-dev BRANCH=your-branch
# worktreeが存在しない場合は自動作成、他のworktreeを停止して開発サーバーを起動
```

**worktree切り替え（日常使用）**：
```bash
make wt-dev BRANCH=other-branch
# 自動的に他のworktreeを停止して、指定したworktreeの開発サーバーが起動
```

**通常モードに戻る**：
```bash
make wt-disable
# worktreeモードを無効化して、メインリポジトリのソースコードで開発サーバーを起動
```

**不要になったらクリーンアップ**：
```bash
make wt-remove BRANCH=your-branch
```

## コマンドリファレンス

### Makeコマンド

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `wt-list` | すべてのworktreeを一覧表示 | `make wt-list` |
| `wt-add` | 新しいworktreeを作成（ファイルコピーのみ） | `make wt-add BRANCH=feature-x` |
| `wt-init` | worktreeの開発環境を初期化（Docker、npm install） | `make wt-init BRANCH=feature-x` |
| `wt-remove` | worktreeを削除 | `make wt-remove BRANCH=feature-x` |
| `wt-prune` | 不要なworktree参照を削除 | `make wt-prune` |
| `wt-current` | 現在アクティブなworktreeを表示 | `make wt-current` |
| `wt-dev` | worktreeで開発サーバーを起動（未初期化の場合は自動初期化） | `make wt-dev BRANCH=feature-x` |
| `wt-disable` | worktreeモードを無効化、メインリポジトリに戻る | `make wt-disable` |
| `wt-down` | worktreeのDockerコンテナを停止 | `make wt-down` |
| `wt-up` | worktreeのDockerコンテナを起動 | `make wt-up` |

### シェルラッパーコマンド（Tab補完対応）

シェル関数設定後（`source scripts/main.sh`）に使用可能。

| コマンド | 説明 | Tab補完対象 |
|---------|------|-------------|
| `wt-add <branch>` | worktree作成 | 全ブランチ（ローカル/リモート） |
| `wt-init <branch>` | worktree初期化（Docker、npm install） | 全ブランチ（ローカル/リモート） |
| `wt-remove <branch>` | worktree削除 | 既存worktree |
| `wt-dev <branch>` | 開発サーバー起動 | 既存worktree |
| `wt-cd <branch>` | worktreeディレクトリへ移動 | 既存worktree |
| `wt-cd-current` | 現在のworktreeへ移動 | - |

## 直接gitコマンドを使用する場合

```bash
# worktree一覧
git worktree list

# worktree追加（既存ブランチ）
git worktree add worktrees/branch-name branch-name

# worktree追加（新規ブランチ）
git worktree add -b new-branch worktrees/new-branch

# worktree削除
git worktree remove worktrees/branch-name

# 不要な参照を削除
git worktree prune
```

## トラブルシューティング

### worktreeを追加できない

```text
fatal: 'branch-name' is already checked out at '/path/to/repo'
```

同じブランチを複数のworktreeでチェックアウトすることはできません。別のブランチ名を使用してください。

### worktreeを削除できない

```bash
# 強制削除
git worktree remove worktrees/branch-name --force
```

### 古いworktree参照が残っている

```bash
make wt-prune
```
