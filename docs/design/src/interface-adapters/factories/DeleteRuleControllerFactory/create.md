---
codd:
  node_id: "design:design-src-interface-adapters-factories-deleterulecontrollerfactory-create"
  type: design
---

# DeleteRuleControllerFactory.create() テスト戦略

## 目的

Reactコールバック（onSuccess, onError）を受け取り、Presenter/Interactor/Controllerを生成して返す。
Factoryの責務は「DIの世界」と「Reactの世界」の境界を橋渡しすること（ADR-005参照）。

## テスト分類

### 1. 正常系（Controllerの生成と統合動作）

create()がIDeleteRuleControllerを返し、削除処理が正しく連携することを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 基本パターン | create()がIDeleteRuleControllerを返す | Factoryの基本責務 |
| 成功時コールバック | 削除成功時にonSuccessコールバックが呼ばれる | Presenter→View連携の確認 |
| エラー時コールバック | 削除失敗時にonErrorコールバックが呼ばれる | エラー通知連携の確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. コールバック引数の検証

コールバックに正しい引数が渡されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 成功時引数 | onSuccessにdeletedRuleIdが渡される | Presenterの出力仕様 |
| エラー時引数 | onErrorにフォーマット済みエラーメッセージが渡される | Presenterでメッセージ構築（ADR-001準拠） |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

## 網羅性チェック

- [x] create()がIDeleteRuleControllerを返すこと
- [x] 成功時にonSuccessコールバックが呼ばれること
- [x] 成功時コールバックにdeletedRuleIdが渡されること
- [x] エラー時にonErrorコールバックが呼ばれること
- [x] エラー時コールバックにフォーマット済みメッセージが渡されること（Presenter層で構築）
- [ ] Factoryの内部実装（Presenter/Interactor生成順序）→ 不要（実装詳細、振る舞いで検証）

### 統合テスト的アプローチの理由

Factoryは複数クラスを組み立てる責務を持つため、生成されたControllerの動作を通じて検証する。
個々のクラス（Presenter/Interactor）の詳細な動作は各クラスの単体テストでカバー済み。

## テストファイル構成

```text
tests/unit/interface-adapters/factories/DeleteRuleControllerFactory/create/
└── normal-cases.test.ts       # 生成と統合動作確認（配列ベース）
```

## モック戦略

RepositoryとGatewayをモック化し、Factoryの責務（クラス生成と連携）をテストする。

### 使用するモック

| 依存関係 | モック理由 | モック対応 |
| -------- | ---------- | ---------- |
| IRewriteRuleRepository | DB操作の回避、成功/失敗シナリオの制御 | `tests/unit/application/ports/IRewriteRuleRepository/mocks/` |
| ITabsGateway | Chrome API依存の回避 | `tests/frameworks-and-drivers/browser/ChromeTabsGateway/mocks/` |

### コールバックのモック

| 対象 | モック方法 | 理由 |
|-----|-----------|------|
| onSuccess | vi.fn() | 呼び出しと引数の検証 |
| onError | vi.fn() | 呼び出しと引数の検証 |

### テストデータ

- ruleId: 任意の正の整数を使用
- RewriteRule: モックRepositoryから返却するダミーエンティティ
