---
codd:
  node_id: "governance:development-flow-testing-policy-index"
  type: governance
---

# テスト実行方針

このドキュメントは AI・人間の開発者双方が従うべきテスト実行ルールを定義する。

## ローカルテスト実行方針

| タイミング | 実行すべきテスト |
|-----------|----------------|
| タスク完了前 | 全ユニットテスト通過（`npx vitest --run`） |
| タスク完了前 | Lint 全通過（`npx eslint . --ext .ts,.tsx,.js,.jsx` / `npx stylelint 'src/**/*.css'`） |
| タスク完了前 | Markdownlint 全通過（`npx markdownlint-cli2 'docs/**/*.md' 'docs-rules/**/*.md' '.claude/**/*.md' '.clinerules/**/*.md' '.AI/**/*.md' '.github/**/*.md' '*.md'`） |
| PR作成後 | CI/CDが全テスト（ユニット + E2E）を自動実行（確認はCIログを参照） |
| E2E確認 | CI/CD で確認。ローカル実行は任意 |

Dockerコマンドに依存しないテスト・Lintは、タスク完了前にローカルで全て通過させること。E2Eテストのローカル実行は不要（CI/CDに委譲）。

> **実行ディレクトリ**: 上記の `npx` コマンドは `host-frontend-root/frontend-src-root/` で実行すること（`package.json` の配置先）。

## Dockerの使用方針

- Dockerコンテナの使用は実際の挙動確認が必要な場合のみ（最小限）
- 並行開発時: 各担当者はDockerを使わずに開発する（ユニットテスト＋Lint のみ）
- worktree開発環境の一括起動（Docker + devサーバ + 他worktree停止を含む）: `make wt-dev BRANCH=branch-name`（必要な場合のみ）

## テストフレームワーク

- **ユニットテスト**: Vitest（happy-dom使用）（`tests/` 配下の `**/*.test.ts`）
- **E2Eテスト**: Playwright（`tests/e2e/` 配下の `**/*.spec.ts`）
- 全テスト実行: `make testall`（テストのみ）または `make testlint`（テスト＋リント包括）

## テスト戦略書

テストコードを書く前に、テスト戦略書を作成すること。

- **保存先**: `docs/design/src/[layer]/[category]/[ClassName]/[methodName].md`
- **テンプレート**:
  - 単体: `docs-rules/design/05-test-strategy.md`
  - 結合: `docs-rules/design/06-integration-test-strategy.md`
  - E2E: `docs-rules/design/07-e2e-test-strategy/`

## 実装時のタスク順序

新規メソッド追加時は以下の順序で作業すること:

1. テスト戦略書の作成
2. 実装コードの作成
3. テストコードの実装
   - **実装前**: 既存モック検索を実行（[`common-rule/mock-file-placement.md`](../../coding-standards/tests/common-rule/mock-file-placement.md) 参照）
   - **実装後**: テスト戦略書との整合性確認
4. シグネチャ変更時は必ずテスト戦略書を更新

## 関連ドキュメント

- テストコーディング規約: [`docs/coding-standards/tests/`](../../coding-standards/tests/common-rule/index.md)
- E2Eスペックファイル管理: [`.AI/tests/e2e/consistency-maintenance-guideline.md`](../../../.AI/tests/e2e/consistency-maintenance-guideline.md)
