---
codd:
  node_id: "design:design-src-frameworks-and-drivers-ui-components-atoms-deletebutton-component"
  type: design
---

# DeleteButton コンポーネント テスト戦略

## 目的

ルール削除用のゴミ箱アイコンボタンのレンダリングとユーザーインタラクションを検証する。
クリック時にonClickコールバックを呼び出し、disabled状態で操作を無効化する。

## テスト分類

### 1. レンダリング（状態表示）

disabled状態に応じた正しいレンダリングを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| ゴミ箱アイコン | ゴミ箱アイコン(SVG)が表示される | ユーザーに削除操作を視覚的に伝える |
| disabled=true | disabled属性がtrueで設定される | ボタンの無効化状態を確認 |
| disabled未指定 | disabled属性がfalseで設定される | デフォルト値の確認 |

**対応テスト**: `rendering.test.tsx`

### 2. ユーザーインタラクション

クリック操作時のonClickコールバック呼び出しを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| クリック | onClickが呼ばれる | 基本インタラクション |
| disabled時クリック | onClickが呼ばれない | 無効化時の動作 |

**対応テスト**: `interaction.test.tsx`

### 3. アクセシビリティ

WAI-ARIA属性の正しい設定を確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| aria-label | aria-label="ルールを削除"が設定される | スクリーンリーダー対応 |
| role | button roleが設定される | ボタン要素の役割を明示 |

**対応テスト**: `accessibility.test.tsx`

## 網羅性チェック

- [x] ゴミ箱アイコンのレンダリング
- [x] disabled=true/falseのレンダリング
- [x] onClick呼び出し
- [x] disabled時のonClick抑制
- [x] aria-label設定
- [x] role属性確認
- [ ] フォーカスリング表示 → 対象外（CSSの視覚的確認はStorybookで実施）
- [ ] ホバースタイル → 対象外（CSSの視覚的確認はStorybookで実施）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/ui/components/atoms/DeleteButton/
├── test-helpers.tsx          # 共通テストヘルパー（DeleteButtonTestHelper）
├── rendering.test.tsx        # レンダリング（3ケース）
├── interaction.test.tsx      # ユーザーインタラクション（2ケース）
└── accessibility.test.tsx    # アクセシビリティ（2ケース）
```

## モック戦略

### モック対象

- **onClick関数**: vi.fn()でモック化し、呼び出しを検証

### テスト環境

- ReactDOM.createRoot()を使用した直接レンダリング
- happy-dom環境（vitest設定済み）

### テストヘルパー

共通のセットアップ・クリーンアップロジックを`DeleteButtonTestHelper`クラスに集約:

```typescript
import { DeleteButtonTestHelper } from 'tests/unit/.../test-helpers';

const helper = new DeleteButtonTestHelper();

beforeEach(() => helper.setup());
afterEach(() => helper.cleanup());

// レンダリング
await helper.render({ onClick: mockOnClick, disabled: false });

// 要素取得
const button = helper.getButtonElement();
```

外部依存（CSSモジュール）はVitestの設定で自動処理されるため、明示的なモックは不要。
