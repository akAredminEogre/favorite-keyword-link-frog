---
codd:
  node_id: "design:design-pages-rule-list-features-delete-rule-integration-test-strategy"
  type: design
---

# ルール削除機能 結合テスト戦略

## 目的

DeleteRuleInteractorを中心とした、ルール削除機能の結合テストを定義する。
Repository、TabsGateway、Presenterの連携動作を検証する。

## テストスコープ

### 対象レイヤー

```text
入力: ruleId
  ↓
DeleteRuleInteractor.execute(inputData)
  ├→ Repository.getById(ruleId)          # URLパターン取得
  ├→ Repository.delete(ruleId)           # ルール削除
  ├→ [TabsGateway.reloadMatchingTabs() - モック]
  └→ Presenter.present(outputData)
       ↓
出力: callback(deletedRuleId)
```

### 実コンポーネント（モックしない）

| レイヤー | コンポーネント | 理由 |
|---------|---------------|------|
| Application | DeleteRuleInteractor | 結合テストの中心、ビジネスロジックの連携を検証 |
| Infrastructure | RewriteRuleRepository | 実際のDB操作（fake-indexeddb）で永続化を検証 |

### モック対象

| コンポーネント | 理由 |
|---------------|------|
| TabsGateway | Chrome API依存、テスト環境で動作不可 |
| Presenter | コールバック呼び出しを検証するため`vi.fn()`で直接生成 |

## テスト分類

### 1. 正常系テスト

ルール削除 → DB永続化確認の一連フローを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 基本削除 | ルールID指定で削除、getById で取得失敗を確認 | 物理削除が正常に動作することを確認 |
| 削除後一覧 | 削除後に getAll で該当ルールが含まれないことを確認 | 一覧表示から消えることを確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. データ整合性テスト

削除操作が他のデータに影響しないことを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 他ルール不変 | ルールA削除後、ルールBが正常に取得できる | 削除が他データに影響しないことを確認 |
| 全件数確認 | 削除前後で件数が1減少することを確認 | 複数削除や削除漏れがないことを確認 |

**対応テスト**: `data-integrity.test.ts`

### 3. Presenter出力テスト

削除結果がPresenterに正しく通知されることを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 成功通知 | 削除成功時にpresent()が呼ばれる | UIへの成功通知を確認 |
| 削除ID通知 | OutputDataに削除されたruleIdが含まれる | UIが該当行を削除できることを確認 |

**対応テスト**: `presenter-output.test.ts`

### 4. エラー系テスト

異常ケースの動作を検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 存在しないID | 存在しないruleIdでpresentError()が呼ばれる | エラーハンドリングが機能することを確認 |
| Repository例外 | Repository.delete()が例外発生時にpresentError()が呼ばれる | DB障害時のエラー通知を確認 |

**対応テスト**: `error-cases.test.ts`

### 5. 部分的成功テスト

削除成功・タブリロード失敗のケースを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 削除成功+リロード失敗 | ルールは削除され、presentError()でリロード失敗を通知 | 部分的成功の正しい取り扱いを確認 |

**対応テスト**: `partial-success.test.ts`

## 網羅性チェック

- [x] 正常系（削除成功）
- [x] 異常系（存在しないID）
- [x] 異常系（Repository例外）
- [x] 部分的成功（削除成功+リロード失敗）
- [x] データ整合性（他ルールへの影響なし）
- [x] Presenter出力（成功/エラー通知）

## テストファイル構成

```plaintext
tests/integration/delete-rule/
├── setup.ts                       # fake-indexeddbセットアップ
├── helpers/
│   └── createTestRule.ts          # テストデータ生成ヘルパー
├── normal-cases.test.ts           # 正常系テスト
├── data-integrity.test.ts         # データ整合性テスト
├── presenter-output.test.ts       # Presenter出力テスト
├── error-cases.test.ts            # エラー系テスト
└── partial-success.test.ts        # 部分的成功テスト
```

## モック戦略

### モック対象

| 対象 | モック方法 | 理由 |
|------|-----------|------|
| TabsGateway | 共有モックを使用 | ブラウザタブ操作のモック（リロード成功/失敗をシミュレート） |
| Presenter | `vi.fn()` で直接生成 | コールバック呼び出しを検証するため |

### モックしない対象

- Repository: 実際のインメモリDB（fake-indexeddb）を使用して結合動作を検証

### モックの実装方針

#### TabsGateway

既存の共有モックを使用する:

```plaintext
tests/frameworks-and-drivers/browser/ChromeTabsGateway/
└── createMockTabsGateway.ts
```

統合テストからは上記の共有モックをimportして使用する。

#### Presenter

モックファイルは作成せず、テストコード内で `vi.fn()` を使用してコールバックを直接生成する:

| コールバック | 用途 |
|-------------|------|
| `present = vi.fn()` | 成功時の通知検証 |
| `presentError = vi.fn()` | エラー時の通知検証 |

#### テストヘルパー

テストデータ生成などの共有ユーティリティは `helpers/` サブディレクトリに配置する。

## テストデータ設計

### 初期データ

削除対象ルール:

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| id | `1` | 削除対象のルールID |
| urlPattern | `https://example.com/*` | URLパターン |
| isActive | `true` | 有効状態 |

他ルール（整合性検証用）:

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| id | `2` | 削除されないルールID |
| urlPattern | `https://other.com/*` | URLパターン |
| isActive | `true` | 有効状態 |

### 期待結果

| 入力 | 操作後の状態 | DB状態 | コールバック引数 |
|------|-------------|--------|-----------------|
| `1` | 削除完了 | getById で取得失敗 | `{ deletedRuleId: 1 }` |
| `999` | エラー | 変更なし | `presentError()` が呼ばれる |
| 削除 + TabsGateway失敗 | 削除完了 + エラー通知 | getById で取得失敗 | `presentError()` でリロード失敗を通知 |
