---
codd:
  node_id: "req:user-stories-us-auto-copilot-review-testing"
  type: requirement
---

# ユーザーストーリー: Auto Copilot Review スクリプト テストコード・テスト戦略書

## ストーリー

> CI/CDパイプラインの品質を維持するため、Auto Copilot Reviewで実装されたスクリプト群のユニットテストを整備し、各スクリプトの動作を検証できる状態にする

## 対象スクリプト

PR#397 で実装されたスクリプト:

| ファイル | 役割 |
|--------|------|
| `scripts/ci/auto-copilot-review/get-pr.js` | head SHA からオープンPRを取得し `pr_number` を出力 |
| `scripts/ci/auto-copilot-review/check-copilot.js` | Copilotレビューが依頼済み/完了済みか確認し `skip` を出力 |
| `scripts/ci/auto-copilot-review/check-threads.js` | GraphQLで未解決レビュースレッドを全件取得し `has_unresolved` を出力 |
| `scripts/ci/auto-copilot-review/request-review.js` | Copilotレビューをリクエスト |

---

## テスト戦略書

### テスト方針

**ユニットテストに集中する。** 各スクリプトは `actions/github-script@v7` から `{ github, context, core }` を注入されて動作するため、依存関係をモックすることで完全に単体テスト可能。

### テスト対象の観点

#### 1. 正常系（Happy Path）
- 期待するAPIレスポンスに対して正しい出力値（`core.setOutput`）が設定されること
- 成功メッセージが適切に出力されること（`core.info`）

#### 2. 境界値・エッジケース
- PRが0件の場合、複数件の場合
- ページネーション: 2ページ以上にわたるデータの全件取得
- 空配列・nullを含むAPIレスポンス

#### 3. Null安全性（optional chaining）
- `requested_reviewers` 内の要素が `null` の場合
- レビューオブジェクトの `user` が `null` の場合
- これらがエラーなく動作することを確認する

#### 4. エラーハンドリング
- `get-pr.js`: APIエラー → `core.error` + 空文字出力（致命的でない）
- `check-copilot.js`: APIエラー → エラーをスロー（ワークフロー失敗として扱う）
- `check-threads.js`: APIエラー → エラーをスロー（ワークフロー失敗として扱う）
- `request-review.js`: APIエラー → `core.warning` のみ（非致命的・ワークフロー継続）

#### 5. ページネーション（check-threads.js）
- 1ページ目の `hasNextPage=true` 時に2回目のAPIコールが行われること
- 2回目のコールに正しい `cursor` が引き継がれること
- 全ページのスレッドを集計した上で `unresolved_count` が計算されること

### テストツール

- **テストフレームワーク**: Jest
- **モック**: `jest.fn()` による GitHub API のモック
- **環境変数**: `process.env.PR_NUMBER` を `beforeEach` でセット、`afterEach` でクリーンアップ

### テストファイル構成

```text
scripts/ci/auto-copilot-review/
├── get-pr.js
├── check-copilot.js
├── check-threads.js
├── request-review.js
└── __tests__/
    ├── get-pr.test.js          # 5テストケース
    ├── check-copilot.test.js   # 6テストケース
    ├── check-threads.test.js   # 8テストケース
    └── request-review.test.js  # 3テストケース
```

### テスト実行方法

```bash
# プロジェクトルートで実行
npx jest scripts/ci/auto-copilot-review/__tests__ --verbose

# ウォッチモード
npx jest scripts/ci/auto-copilot-review/__tests__ --watch
```

> **前提**: `package.json` に Jest の設定が必要。現時点でプロジェクトに Jest が未設定の場合は以下を実行:
> ```bash
> npm install --save-dev jest
> ```

---

## E2Eテスト方針

### 背景

`auto-copilot-review.yml` は `workflow_run` イベント（CI完了）でトリガーされる。このイベントは外部ワークフローの結果に依存するため、通常の `push` や `pull_request` イベントとは異なりテストが難しい。

### E2Eテスト戦略

#### アプローチ1: workflow_dispatchによる手動トリガー（推奨）

`workflow_dispatch` トリガーを開発用に追加し、手動で実行できるようにする:

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
  # 開発・テスト用（本番では削除）
  workflow_dispatch:
    inputs:
      target_sha:
        description: 'Head SHA to test with'
        required: true
```

#### アプローチ2: テスト用PRを使ったE2E検証手順

1. テスト用ブランチ（例: `test/e2e-auto-copilot-review`）を作成
2. ダミーのコミットをpushしてCI（push trigger workflow）を実行
3. CIが `success` で完了すると `auto-copilot-review.yml` がトリガーされる
4. GitHub ActionsのUIで以下を確認:
   - `get-pr` ステップ: PR番号が正しく取得できているか
   - `check-threads` ステップ: スレッド数が正しいか
   - `check-copilot` ステップ: `skip` の判定が正しいか
   - `Request Copilot review` ステップ: レビュー依頼が成功するか

#### アプローチ3: act（ローカル実行ツール）

[nektos/act](https://github.com/nektos/act) を使ってローカルでworkflow_runをシミュレート:

```bash
# workflow_runイベントをシミュレート
act workflow_run -e .github/test-events/workflow-run-success.json
```

テストイベントJSONの例:
```json
{
  "workflow_run": {
    "conclusion": "success",
    "head_sha": "<実際のPRのhead SHA>"
  }
}
```

### E2Eテスト確認項目チェックリスト

- [ ] CIが成功したPRに対してCopilotレビューが自動リクエストされる
- [ ] 未解決レビュースレッドがあるPRではレビューリクエストがスキップされる
- [ ] 既にCopilotがレビュー済みのPRでは重複リクエストが発生しない
- [ ] `concurrency` グループにより並行実行が適切にキャンセルされる

---

## 受け入れ基準

- [ ] 4スクリプト全てのユニットテストファイルが存在する
- [ ] 各テストファイルは正常系・エラー系・境界値を網羅している
- [ ] `npx jest scripts/ci/auto-copilot-review/__tests__` でテストが実行できる（Jestインストール後）
- [ ] E2Eテスト方針が文書化されており、手動検証の手順が明確である
