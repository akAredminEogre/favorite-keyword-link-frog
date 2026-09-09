---
codd:
  node_id: "design:design-pages-rule-list-features-toggle-rule-active-integration-test-strategy"
  type: design
---

# toggle-rule-active 結合テスト戦略

## 目的

ルールの有効/無効切り替え機能において、UIコンポーネントが呼び出すFactory経由のフロー（Factory → Controller → UseCase → Repository → DB → Presenter）が正しく連携し、DBデータの整合性が保たれることを検証する。

## テストスコープ

### 対象レイヤー

```text
入力: onSuccess, onError, ruleId
  ↓
ToggleRuleActiveControllerFactory.create(onSuccess, onError)
  ↓
IToggleRuleActiveController.toggleActive(ruleId)
  ↓
ToggleRuleActiveInteractor.execute(inputData)
  ├→ DexieRewriteRuleRepository.getById(ruleId)
  ├→ RewriteRule.withActive(!isActive)
  ├→ DexieRewriteRuleRepository.update(toggledRule)
  ├→ [ITabsGateway.reloadMatchingTabs() - モック]
  └→ ToggleRuleActivePresenter.present(outputData)
       ↓
出力: onSuccess(toggledRule) または onError(ruleId, message)
```

### 実コンポーネント（モックしない）

| レイヤー | コンポーネント | 理由 |
|---------|---------------|------|
| Interface Adapters | ToggleRuleActiveControllerFactory | UIが実際に使用するエントリーポイント |
| Interface Adapters | ToggleRuleActiveController | 入力変換の整合性検証 |
| Application | ToggleRuleActiveInteractor | ビジネスロジックの連携検証 |
| Application | ToggleRuleActiveInputData | DTOの構築検証 |
| Application | ToggleRuleActiveOutputData | DTOの出力検証 |
| Infrastructure | DexieRewriteRuleRepository | DB操作の実検証 |
| Infrastructure | IndexedDB (fake-indexeddb) | データ永続化の検証 |
| Enterprise | RewriteRule | ドメインロジック検証 |
| Interface Adapters | ToggleRuleActivePresenter | 出力変換の検証 |

### モック対象

| コンポーネント | 理由 |
|---------------|------|
| ITabsGateway | Chrome Tabs APIに依存するため |

## テスト分類

### 1. 正常系 - 状態切り替え

ルールのisActive状態が正しく反転し、DBに保存されることを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| true → false | isActive=true のルールを false に切り替え | 基本パターン（有効→無効） |
| false → true | isActive=false のルールを true に切り替え | 基本パターン（無効→有効） |

**対応テスト**: `normal-cases.test.ts`

### 2. データ整合性 - DB永続化

Controller → DB までのデータフローが整合していることを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| ID整合性 | 入力ruleIdと保存されたルールのIDが一致 | データの同一性担保 |
| isActive以外不変 | 他プロパティ（oldString, newString等）が変更されない | 副作用の排除 |
| 複数ルール独立 | 他のルールが影響を受けない | データ独立性 |

**対応テスト**: `data-integrity.test.ts`

### 3. 出力整合性 - Presenter経由のコールバック

Presenterを通じてView層に正しいデータが渡されることを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| コールバック呼び出し | updateRuleInViewが呼び出される | View更新の保証 |
| 出力データ整合性 | コールバックに渡されるルールが更新後の状態 | UI表示の正確性 |

**対応テスト**: `presenter-output.test.ts`

### 4. エラー系 - ルール不存在

存在しないルールIDを指定した場合のエラーハンドリングを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 存在しないID | 存在しないruleIdでエラーコールバックが呼ばれる | エラーの正しい伝播 |
| DBへの書き込みなし | エラー時にDBが変更されない | トランザクション的振る舞い |

**対応テスト**: `error-cases.test.ts`

### 5. 部分的成功 - タブリロード失敗

ルール更新成功後にタブリロードが失敗した場合の挙動を検証する（00-overview.md「部分的成功の取り扱い」参照）。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| UI状態維持 | タブリロード失敗時もUIはトグル後の状態を表示 | ルール更新は成功しているため |
| エラー通知 | タブリロード失敗のエラーメッセージが表示される | ユーザーへのフィードバック |
| DB状態確認 | タブリロード失敗してもDBは更新済み | 部分的成功の定義通り |

**対応テスト**: `partial-success.test.ts`

## 機能要件トレーサビリティ

### エラーハンドリング要件（00-overview.md参照）

| 機能要件 | UIの状態 | テストケース | テストファイル |
|---------|---------|-------------|---------------|
| ルール取得失敗 | 変更なし | 存在しないruleIdでエラーコールバック | error-cases.test.ts |
| ルール更新失敗 | 変更なし | ※現在のスコープ外（DBエラーは稀少） | - |
| タブリロード失敗 | トグル後の状態を表示 | TabsGatewayエラー時の挙動検証 | partial-success.test.ts |

### 部分的成功の取り扱い（00-overview.md参照）

| シナリオ | 期待動作 | テストケース | テストファイル |
|---------|---------|-------------|---------------|
| ルール更新成功 + タブリロード失敗 | UIは更新、エラー通知表示 | onSuccess呼び出し + onError呼び出し確認 | partial-success.test.ts |

## 網羅性チェック

- [x] 全入力パターン（true→false, false→true）
- [x] DB永続化の検証
- [x] 出力コールバックの検証
- [x] エラーケース（存在しないID）
- [x] 副作用の範囲（他プロパティ、他ルール不変）
- [x] 部分的成功（タブリロード失敗時のUI状態とエラー通知）
- [ ] 同時実行 → 不要（単一操作のため）
- [ ] 境界値 → 不要（ruleIdは存在判定のみ）

## テストファイル構成

```text
tests/integration/toggle-rule-active/
├── setup.ts                    # 共通セットアップ（fake-indexeddb等）
├── helpers/
│   └── createTestRule.ts         # テストデータ生成ヘルパー
├── normal-cases.test.ts        # 正常系テスト
├── data-integrity.test.ts      # データ整合性テスト
├── presenter-output.test.ts    # Presenter出力テスト
├── error-cases.test.ts         # エラー系テスト
└── partial-success.test.ts     # 部分的成功テスト（タブリロード失敗）

# ITabsGateway モックファイル
# docs/coding-standards/tests/common-rule/ の「モックファイルの配置ルール」に従い、
# モックは tests/integration 配下ではなく tests/frameworks-and-drivers 配下に配置する。
tests/frameworks-and-drivers/browser/ChromeTabsGateway/
├── createMockTabsGateway.ts           # TabsGatewayモック（正常系）
└── createFailingTabsGatewayMock.ts    # TabsGatewayモック（タブリロード失敗用）
```

## モック戦略

### モック対象

| コンポーネント | モック方法 | 理由 |
|---------------|-----------|------|
| ITabsGateway | createMockTabsGateway | Chrome Tabs APIに依存するため、テスト環境では動作不可 |
| onSuccess / onError | vi.fn() | View層への出力を検証するため、コールバック関数をスタブ化 |

### Factory経由のテスト構造

UIコンポーネントと同じ方法でFactoryを使用し、コールバックをスタブとして渡す。

```typescript
// UIと同じフローでテスト
const factory = new ToggleRuleActiveControllerFactory(
  repository,        // 実DB（DexieRewriteRuleRepository）
  mockTabsGateway    // モック（ITabsGateway）
);

const onSuccess = vi.fn();  // UIのsetRules相当
const onError = vi.fn();    // UIのエラー表示相当

const controller = factory.create(onSuccess, onError);
await controller.toggleActive(ruleId);
```

**理由**:
- UIコンポーネントが実際に行う呼び出しパターンと一致
- Factory内部でのPresenter/Controller/Interactor生成ロジックも含めて検証
- View層（React等）は結合テストのスコープ外のため、コールバックはスタブで置き換え

### モックの実装方針

TabsGatewayは `reloadMatchingTabs` メソッドのみをモック化し、呼び出し回数と引数を検証する。

### モックファイル構成

```text
tests/
└── frameworks-and-drivers/
    └── browser/
        └── ChromeTabsGateway/
            └── createMockTabsGateway.ts    # ITabsGateway モックファクトリ
```

## テストデータ設計

### 初期データ

```typescript
// isActive=true のルール
const activeRule = new RewriteRule(
  1,                      // id（DB自動採番）
  'oldString',            // oldString
  'newString',            // newString
  'https://example.com',  // urlPattern
  false,                  // isRegex
  true                    // isActive
);

// isActive=false のルール
const inactiveRule = new RewriteRule(
  2,                      // id（DB自動採番）
  'pattern',              // oldString
  'replacement',          // newString
  'https://test.com',     // urlPattern
  false,                  // isRegex
  false                   // isActive
);
```

### 期待結果

| 入力 | 操作後のisActive | DB状態 | コールバック引数 |
|------|------------------|--------|-----------------|
| activeRule (true) | false | isActive=false で保存 | toggledRule.isActive=false |
| inactiveRule (false) | true | isActive=true で保存 | toggledRule.isActive=true |

## 実行環境

- **DBモック**: fake-indexeddb（IndexedDBのインメモリ実装）
- **ブラウザAPI**: @webext-core/fake-browser
- **テストフレームワーク**: Vitest

## 依存関係図

```text
┌─────────────────────────────────────────────────────────────┐
│                    テストコード                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. DBにテストデータ挿入                                 │   │
│  │ 2. Factory.create(onSuccess, onError) でController取得│   │
│  │ 3. Controller.toggleActive(ruleId) 呼び出し           │   │
│  │ 4. onSuccess/onError コールバック結果を検証            │   │
│  │ 5. DBの状態を検証                                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  結合対象コンポーネント                       │
│                                                             │
│  ToggleRuleActiveControllerFactory  ← UIと同じエントリー    │
│         │                                                   │
│         ▼                                                   │
│  ToggleRuleActiveController                                 │
│         │                                                   │
│         ▼                                                   │
│  ToggleRuleActiveInteractor                                 │
│         │                                                   │
│    ┌────┴────┬────────────┬──────────────┐                 │
│    ▼         ▼            ▼              ▼                 │
│ Repository  Entity   TabsGateway    Presenter              │
│ (実DB)     (実物)    (モック)       (実物)                  │
│    │                     │              │                   │
│    ▼                     │              ▼                   │
│ IndexedDB                │         onSuccess/onError       │
│ (fake)                   │         (vi.fn())               │
│                          │              │                   │
└──────────────────────────┼──────────────┼───────────────────┘
                           │              │
                           ▼              ▼
                     呼び出し検証     結果検証
```
