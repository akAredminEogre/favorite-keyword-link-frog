---
codd:
  node_id: "design:design-src-frameworks-and-drivers-ui-hooks-usedeleterule-hook"
  type: design
---

# useDeleteRule() テスト戦略

## 目的

ルール削除に関するState管理とロジック（削除確認フロー制御）をRulesAppから切り出したカスタムフック。
`deletingIds`, `deleteTargetId`, `deleteError` のState管理と、`handleDelete`, `confirmDelete`, `cancelDelete`, `dismissDeleteError` のロジックを提供する（エラー通知のリセットは `dismissDeleteError` の責務）。

## テスト分類

### 1. handleDelete（削除確認ダイアログ表示）

削除ボタン押下時に確認ダイアログを表示するためのState更新を検証。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 正常系 | handleDeleteでdeleteTargetIdが設定される | 確認ダイアログ表示のトリガー |
| 重複防止 | deletingIds内のruleIdでhandleDeleteが無視される | 削除中ルールの二重削除防止 |
| エラークリア | handleDeleteでdeleteErrorがクリアされる | 前回エラーの非表示化 |

**対応テスト**: `handleDelete.test.ts`

### 2. confirmDelete（削除実行）

確認ダイアログで「削除」を押下した際の削除実行フローを検証。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 正常系 | confirmDeleteでdeleteController.deleteRuleが呼ばれる | 削除実行の基本フロー |
| State更新 | confirmDelete中にdeletingIdsにruleIdが含まれる | UI上で削除中表示 |
| State復帰 | confirmDelete完了後にdeletingIdsからruleIdが除去される | 削除完了後のUI復帰 |
| ダイアログ閉じ | confirmDeleteでdeleteTargetIdがnullになる | 確認ダイアログの非表示化 |
| null防止 | deleteTargetIdがnullの場合は何も実行されない | null状態での誤実行防止 |
| 重複防止 | deletingIds内のruleIdでconfirmDeleteが無視される | 二重実行防止 |
| エラー時復帰 | deleteRuleが例外を投げてもdeletingIdsからruleIdが除去される | try/finallyによるState復帰保証 |

**対応テスト**: `confirmDelete.test.ts`

### 3. cancelDelete（削除キャンセル）

確認ダイアログで「キャンセル」を押下した際の動作を検証。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 正常系 | cancelDeleteでdeleteTargetIdがnullになる | 確認ダイアログの非表示化 |
| null安全性 | deleteTargetIdが既にnullの場合も安全に呼べる | 境界値・初期状態での誤動作防止 |
| 状態復帰 | cancelDelete後にhandleDeleteで新しいIDを設定できる | キャンセル後の再操作が正常に動作すること |

**対応テスト**: `cancelDelete.test.ts`

### 4. deleteController（コントローラ生成）

Factory経由でコントローラが正しく生成され、コールバックが機能することを検証。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 成功コールバック | onSuccessコールバックが呼ばれたときonDeleteSuccessが呼ばれる | 親コンポーネントへの成功通知 |
| エラーコールバック | onErrorコールバックが呼ばれたときdeleteErrorが設定される | エラーToast表示のトリガー |

**対応テスト**: `deleteController.test.ts`

### 5. 戻り値（インターフェース）

フックが返すオブジェクトの構造を検証。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 構造 | 必要なプロパティがすべて含まれる | 利用側との契約 |

**対応テスト**: `return-value.test.ts`

## 網羅性チェック

- [x] handleDeleteの正常系・重複防止・エラークリア
- [x] confirmDeleteの正常系・State遷移・null/重複防止
- [x] cancelDeleteの正常系
- [x] deleteController生成と成功/エラーコールバック
- [x] 戻り値の構造
- [ ] deleteControllerのメモ化 → 対象外（useMemoの内部実装はReactが保証）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/ui/hooks/useDeleteRule/
├── mocks/
│   └── createMockDeleteRuleControllerFactory.ts
├── test-helpers.ts
├── handleDelete.test.ts
├── confirmDelete.test.ts
├── cancelDelete.test.ts
├── deleteController.test.ts
└── return-value.test.ts
```

## モック戦略

### 使用するモック

| 依存関係 | モック理由 | モック対応 |
| -------- | ---------- | ---------- |
| IDeleteRuleControllerFactory | DIコンテナ依存を排除 | 新規作成（`tests/unit/frameworks-and-drivers/ui/hooks/useDeleteRule/mocks/`） |
| IDeleteRuleController | 実際の削除処理を実行させない | 新規作成（Factory内で生成） |
| container.resolve | DIコンテナ呼び出しをモック化 | vi.mock使用 |

### テストヘルパー

共通のセットアップ・クリーンアップロジックを集約したテストヘルパー:

**参照**: `tests/unit/frameworks-and-drivers/ui/hooks/useDeleteRule/test-helpers.ts`
