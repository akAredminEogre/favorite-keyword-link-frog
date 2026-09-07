---
codd:
  node_id: "governance:coding-standards-tests-e2e-helper-organization-placement-procedures"
  type: governance
---

# ヘルパー配置手順

新規E2Eテストファイル作成前に実施する確認手順と参照情報。

## 確認手順（必須）

新規E2Eテストファイル作成前に以下を確認：

```bash
# 1. グローバル共通ヘルパーを確認
cat tests/e2e/helpers.ts

# 2. 該当機能のヘルパーを確認（機能ディレクトリが存在する場合）
ls tests/e2e/pages/{page}/features/{feature}/
cat tests/e2e/pages/{page}/features/{feature}/helpers.ts  # 存在する場合
```

## グローバル共通定数（tests/e2e/helpers.ts）

| 定数名 | 値 | 用途 |
|--------|-----|------|
| `DEFAULT_TIMEOUT` | 60000 | 要素の表示・入力待機 |
| `RULES_TABLE_TIMEOUT` | 60000 | ルールテーブル表示待機 |
| `DIALOG_TIMEOUT` | 60000 | ダイアログ待機 |
| `TEST_SERVER_URL` | 環境変数または既定値 | テストサーバーのベースURL |

## グローバル共通ヘルパー関数（tests/e2e/helpers.ts）

| 関数名 | 用途 |
|--------|------|
| `setupConsoleErrorMonitoring` | コンソールエラー監視のセットアップ |
| `assertNoConsoleErrors` | コンソールエラーがないことの確認 |
| `clearAllRules` | 全ルール削除（テストデータクリーンアップ） |
| `reloadAndWaitForTable` | ページリロードしてテーブル表示を待機 |
| `saveRule` | ポップアップからルールを保存 |

## 機能固有ヘルパーの構成例

```plaintext
tests/e2e/pages/rule-list/features/delete-rule/
├── helpers.ts              # 再エクスポートモジュール（import経路の一本化）
├── constants.ts            # 機能固有の定数
├── dialog-operations.ts    # ダイアログ操作ヘルパー
└── rule-operations.ts      # ルールテーブル操作ヘルパー
```

機能固有ヘルパーが複数ファイルに分割される場合、`helpers.ts`で再エクスポートしてimport経路を一本化する。
