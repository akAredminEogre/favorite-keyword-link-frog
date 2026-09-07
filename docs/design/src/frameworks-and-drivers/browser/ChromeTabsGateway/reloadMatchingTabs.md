---
codd:
  node_id: "design:design-src-frameworks-and-drivers-browser-chrometabsgateway-reloadmatchingtabs"
  type: design
---

# ChromeTabsGateway.reloadMatchingTabs() テスト戦略

## 目的

指定されたルールのURLパターンにマッチするタブをリロードする。
Chrome Tabs APIを使用してタブを取得し、`Tabs`クラスでフィルタリングとリロードを行う。

## テストコード実装: 不要

本メソッドはテストコードの実装が不要である。

> **参照**: [frameworks-and-drivers テストガイドライン](../../../../../coding-standards/tests/unit/frameworks-and-drivers.md)
>
> frameworks-and-driversのロジックそのものが動作することを確認するテストは不要（任意）:
> - 並列処理
> - 非同期処理
> - フレームワークやライブラリの動作確認
> - 外部サービスとの連携確認

### 不要な理由

#### 1. 外部APIの薄いラッパーである

```typescript
async reloadMatchingTabs(rule: RewriteRule): Promise<void> {
  const chromeTabs = await chrome.tabs.query({});
  const tabs = new Tabs(chromeTabs);
  const matchingTabs = tabs.filterByRule(rule);
  await matchingTabs.reloadAll();
}
```

このメソッドは以下の処理を順番に呼び出すのみ:
1. `chrome.tabs.query({})` - Chrome API呼び出し
2. `new Tabs(chromeTabs)` - Tabsインスタンス生成
3. `tabs.filterByRule(rule)` - フィルタリング
4. `matchingTabs.reloadAll()` - リロード実行

独自のロジックを持たず、既存の責務を組み合わせているだけである。

#### 2. 依存するクラスは既にテスト済み

| 依存 | テスト状況 |
|------|-----------|
| `Tabs.constructor()` | テスト済み |
| `Tabs.filterByRule()` | テスト済み |
| `Tabs.reloadAll()` | 間接的にテスト済み（filterByRule等のテストで使用） |

本メソッドで使用する`Tabs`クラスのメソッドはテストでカバーされている。

#### 3. Chrome APIのモックは価値が低い

- `chrome.tabs.query()`をモックしてもChrome APIの実際の挙動は保証されない
- 統合テスト/E2Eテストで実際のブラウザ環境でテストすべき範囲である
- モックベースのテストは実装の詳細に依存し、脆弱になりやすい

#### 4. Gateway層の責務

Gateway層は外部システム（Chrome API）との境界を担う。この層のテストは:
- **単体テスト**: モックを使うと実装詳細に依存し、価値が低い
- **E2Eテスト**: 実際のブラウザ環境で動作確認すべき

## 網羅性チェック

- [ ] 単体テスト → 不要（Chrome APIの薄いラッパーであり、依存クラスはテスト済み）
- [ ] 異常系テスト → 不要（エラーは呼び出し元に伝播、Gateway層でハンドリングしない）
- [x] Tabsクラスのテストで間接的にカバー
- [x] E2Eテストで実際の動作を確認

## テストファイル構成

```text
（テストファイルなし - 実装不要）
```

## 備考

本メソッドの動作確認は、toggle-rule-active機能のE2Eテストで行う。
