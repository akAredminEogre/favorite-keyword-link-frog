---
codd:
  node_id: "governance:development-flow-parallel-branch-development-index"
  type: governance
---

# ブランチ並行開発ガイド

このドキュメントは git worktree を活用した複数担当者による
frog-frame-front の並行開発手順を定義する。

## 概要

git worktree を活用し、複数の担当者に**ユニット単位**の作業を並行割り当てする。

```text
統合担当者
├── 担当者1: feat/unit-A (git worktree add worktrees/feat/unit-A feat/unit-A)
├── 担当者2: feat/unit-B (git worktree add worktrees/feat/unit-B feat/unit-B)
└── 担当者3: feat/unit-C (git worktree add worktrees/feat/unit-C feat/unit-C)
```

## ユニット分割の原則

| 分割基準 | 説明 |
|----------|------|
| **クラス単位** | 1クラス（Repository, UseCase, Presenter等）を1ユニットとする |
| **レイヤー単位** | enterprise-business-rules / application-business-rules / interface-adapters / frameworks-and-drivers を独立割当可（[ADR-001](../../adr/001-clean-architecture-with-presenter-pattern.md)参照） |
| **テスト単位** | 実装ユニットにテストを対で割り当てる |

### 依存関係に注意すること

- 依存するユニットが未完成の場合はインターフェース（`interface`）を先に確定させる
- インターフェース確定後に各ユニットの実装を並行開始する
- 依存関係: 各ユーザーストーリーのアローダイアグラムに従うこと（[新機能開発フロー](../new-feature/index.md)参照）

## 統合担当者の段取り手順

### Step 1: ブランチ戦略決定

```bash
# ベースブランチから各ユニットブランチを作成
git -C /path/to/frog-frame-front checkout develop
git -C /path/to/frog-frame-front pull origin develop
git -C /path/to/frog-frame-front checkout -b feat/unit-A
git -C /path/to/frog-frame-front checkout develop
git -C /path/to/frog-frame-front checkout -b feat/unit-B
```

### Step 2: 各担当者にタスクを割り当て

```yaml
# タスク割当例
task_id: task_XXX
target_repo: frog-frame-front
target_branch: feat/unit-A
working_dir: /path/to/frog-frame-front/worktrees/feat/unit-A
unit: UserRepository（InfrastructureLayer実装）
interface_contract: docs/design/pages/.../01-class-design.md
```

### Step 3: 各担当者のworktree起動指示

```bash
# 担当者に実行させるコマンド（worktree作成のみ、Docker不使用）
git worktree add worktrees/feat/unit-A feat/unit-A
# working_dirが worktrees/feat/unit-A になる
```

## 担当者の作業手順

### 初期化

```bash
# worktreeが存在しない場合は作成
git worktree add worktrees/feat/unit-A feat/unit-A
# → worktrees/feat/unit-A/ に独立した作業環境が作られる
```

### 作業ディレクトリ

```text
frog-frame-front/
├── worktrees/
│   └── feat/
│       ├── unit-A/   ← 担当者1の作業ディレクトリ
│       ├── unit-B/   ← 担当者2の作業ディレクトリ
│       └── unit-C/   ← 担当者3の作業ディレクトリ
```

### テスト方針（Docker不使用）

各担当者はDockerを使わずに開発する。ユニットテスト・Lintはworktreeディレクトリ内で直接実行可能:

```bash
cd worktrees/feat/unit-A/host-frontend-root/frontend-src-root

# 依存関係のインストール（worktree初回のみ）
npm ci

# ユニットテストのみローカル実行（Docker不要）
npx vitest run path/to/unit.test.ts

# Lint実行
npx eslint . --ext .ts,.tsx,.js,.jsx
npx stylelint 'src/**/*.css'
```

E2Eテスト・Docker使用は統合時（マージ後）にCI/CDが実行する。テスト実行方針の詳細は [testing-policy](../testing-policy/index.md) を参照。

### コミット・プッシュ

```bash
# 各担当者は自分のユニットブランチにpush（worktreeルートで作業）
cd worktrees/feat/unit-A
git add host-frontend-root/frontend-src-root/src/path/to/unit.ts host-frontend-root/frontend-src-root/tests/path/to/unit.test.ts
git commit -m "feat(unit-A): implement UserRepository"
git push origin feat/unit-A
```

## 統合・マージ手順（統合担当者）

### 1. 各ユニットのPRを確認

各担当者のブランチをPRでレビュー（`develop` へのPR）。

### 2. 依存順にマージ

```text
feat/unit-domain → feat/unit-infra → feat/unit-app → feat/unit-ui
```

インターフェースが一致していれば同時マージも可。

### 3. 統合後テスト

```bash
# developブランチでCI/CDが全テスト実行
# ローカルでの確認はCIが通るまで待機
```

## 注意事項

1. **node_modules重複**: 各worktreeは独自のnode_modulesを持つ。ディスク容量注意。
2. **Docker同時起動不可**: `make wt-dev` は他のworktreeを自動停止するため、同時Docker起動は不可。並行開発ではDockerを使わない方針を徹底する。
3. **worktree後片付け**: 完了後は `git worktree remove worktrees/feat/unit-A` でクリーンアップ。

## 関連ドキュメント

- git worktree操作: [docs/GIT_WORKTREE.md](../../GIT_WORKTREE.md)
- 開発フロー: [.AI/development-flow.md](../../../.AI/development-flow.md)
- テスト要件: [.AI/testing-requirements.md](../../../.AI/testing-requirements.md)
