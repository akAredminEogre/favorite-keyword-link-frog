---
codd:
  node_id: "design:design-src-application-business-rules-interactors-deleteruleinteractor-execute"
  type: design
---

# DeleteRuleInteractor.execute() テスト戦略

## 目的

ルールを削除するワークフローを調整する。
Repository経由でルールを取得・削除し、成功をPresenterに通知した後、TabsGateway経由でマッチするタブをリロードする。
エラー発生時はPresenter.presentErrorを呼び出してエラーを通知する。

## テスト分類

### 1. 正常系（基本フロー）

ルールの削除が正常に行われることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 削除成功 | ルールIDを指定して削除が実行される | 基本的な削除操作の確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. 依存関係の呼び出し

各依存関係が正しい引数で呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Repository.getById | inputData.ruleIdで呼び出し | タブリロード判定用にルール取得 |
| Repository.delete | inputData.ruleIdで呼び出し | ルールの削除 |
| Presenter.present | OutputDataで呼び出し | 削除成功の通知 |
| TabsGateway.reloadMatchingTabs | 取得したルールで呼び出し | マッチするタブのリロード |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

### 3. OutputDataの内容

Presenterに渡されるOutputDataが正しいことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| deletedRuleId設定 | OutputData.deletedRuleIdが入力されたruleId | 出力データの正確性 |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

### 4. 異常系（エラーハンドリング）

各依存関係でエラーが発生した場合にpresentErrorが呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Repository.getById失敗 | エラー時にpresentErrorが呼び出される | ルール取得失敗の通知 |
| Repository.delete失敗 | エラー時にpresentErrorが呼び出される | ルール削除失敗の通知 |

**対応テスト**: `error-cases.test.ts`

### 5. 部分的成功（タブリロード失敗）

DB削除成功後にタブリロードが失敗した場合の挙動を確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| TabsGateway.reloadMatchingTabs失敗 | presentが先に呼び出され、その後presentErrorが呼び出される | DB削除成功後のタブリロード失敗 |

**対応テスト**: `partial-success-cases.test.ts`

## 網羅性チェック

- [x] ルール削除成功
- [x] Repository.getByIdの呼び出し確認
- [x] Repository.deleteの呼び出し確認
- [x] Presenter.presentの呼び出し確認
- [x] TabsGateway.reloadMatchingTabsの呼び出し確認
- [x] OutputDataの内容確認
- [x] 異常系（Repository.getByIdでエラー発生）
- [x] 異常系（Repository.deleteでエラー発生）
- [x] 異常系（TabsGateway.reloadMatchingTabsでエラー発生 - 部分的成功）

### 部分的成功の取り扱い

Repository.delete成功後にTabsGateway.reloadMatchingTabsが失敗した場合：
- Presenter.presentが先に呼び出される（UIからルールを削除）
- その後Presenter.presentErrorが呼び出される（タブリロード失敗をユーザーに通知）

これにより、データベースからルールは削除されたがタブリロードが失敗した場合でも、UIは正しい状態（ルール削除済み）を表示する。

## テストファイル構成

```text
tests/unit/application-business-rules/interactors/DeleteRuleInteractor/execute/
├── normal-cases.test.ts          # 正常系確認
├── error-cases.test.ts           # 異常系確認（配列ベース、2ケース）
└── partial-success-cases.test.ts # 部分的成功確認
```

## モック戦略

Interactorの3つの依存関係をモック化してテストする。
責務分離のため、モック生成関数は外部ファイルに配置する。

### 使用するモック

| 依存関係 | モック理由 | モック対応 |
| -------- | ---------- | ---------- |
| IRewriteRuleRepository | DB/メッセージング層を分離 | `tests/unit/application/ports/IRewriteRuleRepository/mocks/` |
| ITabsGateway | Chrome API層を分離 | `tests/frameworks-and-drivers/browser/ChromeTabsGateway/mocks/` |
| IDeleteRulePresenter | View層を分離 | 新規作成（`tests/unit/application-business-rules/interactors/DeleteRuleInteractor/mocks/`） |

### テストデータ

RewriteRuleエンティティは実インスタンスを使用（matchesUrlの動作確認のため）。
