---
codd:
  node_id: "design:design-src-components-molecules-ruletablerow-render"
  type: design
---

# RuleTableRow コンポーネント（DeleteButton統合）テスト戦略

## 目的

ルール一覧の行コンポーネントにDeleteButtonを統合し、削除操作のトリガーを提供する。
DeleteButtonのクリック時にonDeleteコールバックを呼び出し、isDeleting状態で操作を無効化する。

## 前提

- RuleTableRowは既存コンポーネント（onEdit、onToggle機能あり）
- DeleteButtonは既にatoms層で実装・テスト済み
- 本テストはDeleteButtonの統合に関するテストのみを実施

## テスト分類

### 1. レンダリング（DeleteButton表示）

DeleteButtonが正しい位置に正しいpropsでレンダリングされることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| DeleteButton表示 | DeleteButtonコンポーネントがレンダリングされる | AC-1: ルール一覧の各行にゴミ箱アイコンが表示される |
| isDeleting=false | DeleteButtonがdisabled=falseでレンダリングされる | 通常状態の確認 |
| isDeleting=true | DeleteButtonがdisabled=trueでレンダリングされる | AC-8: 削除処理中は同じルールの削除ボタンが無効化される |

**対応テスト**: `delete-button-rendering.test.tsx`

### 2. イベント処理

DeleteButtonクリック時のonDeleteコールバック呼び出しを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| クリック | onDeleteがruleIdを引数に呼ばれる | 削除フロー開始のトリガー |
| isDeleting時 | onDeleteが呼ばれない | AC-8準拠（連続削除防止） |

**対応テスト**: `delete-button-interaction.test.tsx`

### 3. 既存機能との共存

DeleteButton追加後も既存機能が正常に動作することを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| onEdit | 編集ボタンクリックでonEditが呼ばれる | 既存機能の回帰防止 |
| onToggle | トグルスイッチ操作でonToggleが呼ばれる | 既存機能の回帰防止 |

**対応テスト**: `existing-features.test.tsx`

## 網羅性チェック

- [x] DeleteButtonのレンダリング確認
- [x] isDeleting=false/trueのdisabled状態
- [x] onDelete呼び出し（ruleId引数確認）
- [x] isDeleting時のonDelete抑制
- [x] 既存機能（onEdit、onToggle）の動作確認
- [ ] DeleteButtonの位置確認 → 対象外（視覚的確認はStorybookで実施）
- [ ] DeleteButtonのスタイル確認 → 対象外（atoms層で検証済み）

## テストファイル構成

```text
tests/unit/components/molecules/RuleTableRow/
├── test-helpers.tsx               # 共通テストヘルパー（RuleTableRowTestHelper）
├── delete-button-rendering.test.tsx   # DeleteButtonレンダリング（3ケース）
├── delete-button-interaction.test.tsx # DeleteButtonインタラクション（2ケース）
└── existing-features.test.tsx         # 既存機能（2ケース）
```

## モック戦略

### モック対象

- **onDelete**: vi.fn()でモック化し、呼び出しと引数を検証
- **onEdit**: vi.fn()でモック化し、呼び出しと引数を検証
- **onToggle**: vi.fn()でモック化し、呼び出しと引数を検証

### テスト環境

- ReactDOM.createRoot()を使用した直接レンダリング
- happy-dom環境（vitest設定済み）

### テストヘルパー

共通のセットアップ・クリーンアップロジックを`RuleTableRowTestHelper`クラスに集約:

```typescript
import { RuleTableRowTestHelper } from 'tests/unit/.../test-helpers';

const helper = new RuleTableRowTestHelper();

beforeEach(() => helper.setup());
afterEach(() => helper.cleanup());

// レンダリング
await helper.render({
  rule: mockRule,
  onEdit: mockOnEdit,
  onToggle: mockOnToggle,
  onDelete: mockOnDelete,
  isToggling: false,
  isDeleting: false,
});

// 要素取得
const deleteButton = helper.getDeleteButton();
```

### モックファイル構成

```text
tests/unit/components/molecules/RuleTableRow/
├── test-helpers.tsx               # RuleTableRowTestHelper + モックRewriteRule生成
└── mocks/
    └── createMockRewriteRule.ts   # モックRewriteRuleファクトリ
```
