---
codd:
  node_id: "design:design-src-application-business-rules-interactors-toggleruleactiveinteractor-execute"
  type: design
---

# ToggleRuleActiveInteractor.execute() テスト戦略

## 目的

ルールの有効/無効状態をトグルするワークフローを調整する。
Repository経由でルールを取得・更新し、TabsGateway経由でマッチするタブをリロードし、Presenterへ結果を通知する。
エラー発生時はPresenter.presentErrorを呼び出してエラーを通知する。

## テスト分類

### 1. 状態変更（同値分割）

isActiveの状態変更が正しく行われることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| true → false | isActive=trueのルールをfalseに切り替え | 有効→無効の基本パターン |
| false → true | isActive=falseのルールをtrueに切り替え | 無効→有効の基本パターン |

**対応テスト**: `normal-cases.test.ts`

### 2. 依存関係の呼び出し

各依存関係が正しい引数で呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Repository.getById | inputData.ruleIdで呼び出し | 正しいIDでルール取得 |
| Repository.update | トグル後のルールで呼び出し | 更新されたルールの永続化 |
| TabsGateway.reloadMatchingTabs | トグル後のルールで呼び出し | マッチするタブのリロード |
| Presenter.present | OutputDataで呼び出し | 結果の通知 |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

### 3. OutputDataの内容

Presenterに渡されるOutputDataが正しいことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| toggledRule設定 | OutputData.toggledRuleがトグル後のルール | 出力データの正確性 |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

### 4. 異常系（エラーハンドリング）

各依存関係でエラーが発生した場合にpresentErrorが呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Repository.getById失敗 | エラー時にpresentErrorが呼び出される | ルール取得失敗の通知 |
| Repository.update失敗 | エラー時にpresentErrorが呼び出される | ルール更新失敗の通知 |

**対応テスト**: `error-cases.test.ts`

### 5. 部分的成功（タブリロード失敗）

DB更新成功後にタブリロードが失敗した場合の挙動を確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| TabsGateway.reloadMatchingTabs失敗 | presentが先に呼び出され、その後presentErrorが呼び出される | DB更新成功後のタブリロード失敗 |

**対応テスト**: `partial-success-cases.test.ts`

## 網羅性チェック

- [x] isActive=true → falseの切り替え
- [x] isActive=false → trueの切り替え
- [x] Repository.getByIdの呼び出し確認
- [x] Repository.updateの呼び出し確認
- [x] TabsGateway.reloadMatchingTabsの呼び出し確認
- [x] Presenter.presentの呼び出し確認
- [x] OutputDataの内容確認
- [x] 異常系（Repository.getByIdでエラー発生）
- [x] 異常系（Repository.updateでエラー発生）
- [x] 異常系（TabsGateway.reloadMatchingTabsでエラー発生）

### 部分的成功の取り扱い

Repository.update成功後にTabsGateway.reloadMatchingTabsが失敗した場合：
- Presenter.presentが先に呼び出される（UIはトグル後の状態を表示）
- その後Presenter.presentErrorが呼び出される（タブリロード失敗をユーザーに通知）

これにより、データベースは更新されたがタブリロードが失敗した場合でも、UIは正しい状態を表示する。

## テストファイル構成

```text
tests/unit/application-business-rules/interactors/ToggleRuleActiveInteractor/execute/
├── normal-cases.test.ts          # 状態変更確認（配列ベース、2ケース）
├── error-cases.test.ts           # 異常系確認（配列ベース、2ケース）
└── partial-success-cases.test.ts # 部分的成功確認（配列ベース、1ケース）
```

## モック戦略

Interactorの3つの依存関係をモック化してテストする。
責務分離のため、モック生成関数は外部ファイルに配置する。

### モック対象

| 依存関係 | モック方法 | 理由 |
|---------|-----------|------|
| IRewriteRuleRepository | vi.fn()でメソッドをモック | DB/メッセージング層を分離 |
| ITabsGateway | vi.fn()でメソッドをモック | Chrome API層を分離 |
| IToggleRuleActivePresenter | vi.fn()でメソッドをモック | View層を分離 |

### モックファイル構成

```text
tests/unit/application-business-rules/interactors/ToggleRuleActiveInteractor/
└── mocks/
    ├── createMockRepository.ts    # IRewriteRuleRepositoryのモック生成
    ├── createMockTabsGateway.ts   # ITabsGatewayのモック生成
    └── createMockPresenter.ts     # IToggleRuleActivePresenterのモック生成
```

### テストデータ

RewriteRuleエンティティは実インスタンスを使用（withActiveの動作確認のため）。
