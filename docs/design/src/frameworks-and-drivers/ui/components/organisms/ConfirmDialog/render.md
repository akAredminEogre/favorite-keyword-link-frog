---
codd:
  node_id: "design:design-src-frameworks-and-drivers-ui-components-organisms-confirmdialog-render"
  type: design
---

# ConfirmDialog.render() テスト戦略

## 目的

ConfirmDialogコンポーネントのレンダリングとユーザーインタラクションをテストする。WAI-ARIAアクセシビリティ要件（ADR-007）への準拠を検証する。

## テスト分類

### 1. 表示/非表示の状態変更

ダイアログの開閉状態に基づく表示切り替えをテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| isOpen=false | ダイアログが表示されない | 閉じた状態では何もレンダリングされないことを保証 |
| isOpen=true | ダイアログが表示される | 開いた状態でダイアログがDOMに存在することを確認 |

**対応テスト**: `visibility.test.tsx`

### 2. Props反映

渡されたPropsが正しくレンダリングされることをテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| title | タイトルテキストが表示される | ユーザーにダイアログの目的を伝える |
| message | メッセージテキストが表示される | 確認内容の説明 |
| confirmLabel | カスタム確認ボタンラベル | デフォルト「削除」のオーバーライド |
| cancelLabel | カスタムキャンセルボタンラベル | デフォルト「キャンセル」のオーバーライド |
| デフォルトラベル | デフォルト値が使用される | Propsが省略された場合のフォールバック |

**対応テスト**: `title-message.test.tsx`、`confirm-button-labels.test.tsx`、`cancel-button-labels.test.tsx`

### 3. アクセシビリティ属性（ADR-007準拠）

WAI-ARIA Dialog Patternに必要な属性をテストする。

#### 基本ARIA属性

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| role="dialog" | ダイアログにrole属性がある | スクリーンリーダーがダイアログを認識 |
| aria-modal="true" | aria-modal属性がある | モーダルダイアログであることを示す |

#### useIdによる動的ID連携（ADR-007 1.1準拠）

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| aria-labelledby | タイトル要素のIDを参照 | スクリーンリーダーがタイトルを読み上げる |
| aria-describedby | メッセージ要素のIDを参照 | スクリーンリーダーが説明を読み上げる |
| タイトルID | useIdで生成された一意のIDを持つ | 複数ダイアログのID競合を防止 |
| メッセージID | useIdで生成された一意のIDを持つ | 複数ダイアログのID競合を防止 |

**注意**: IDは`useId()`フックで動的に生成されるため、テストではハードコードされた値ではなく、aria属性と対応要素のIDが一致することを検証する。

**対応テスト**: `aria-attributes.test.tsx`、`dynamic-id.test.tsx`

### 4. ボタンクリックイベント

ユーザーアクションに対するコールバック呼び出しをテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 確認ボタンクリック | onConfirmが呼ばれる | 削除処理へ進む |
| キャンセルボタンクリック | onCancelが呼ばれる | ダイアログを閉じる |
| 連続クリック防止 | 1回のクリックで1回だけ呼ばれる | 重複処理の防止 |

**対応テスト**: `button-events.test.tsx`

### 5. キーボード操作（ADR-007準拠）

キーボードアクセシビリティをテストする。

| 分類 | テストケース | 根拠 | テスト方法 |
|------|-------------|------|-----------|
| Escape キー | onCancelが呼ばれる | キーボードでダイアログを閉じる | ユニットテスト |
| Tab キー | フォーカスがダイアログ内でループする | フォーカストラップの実装確認 | E2Eテスト |
| Shift+Tab キー | 逆方向にフォーカスがループする | 逆方向のフォーカストラップ | E2Eテスト |

**対応テスト（ユニット）**: `keyboard-events.test.tsx` - Escapeキーのみ

**注意**: Tab/Shift+Tabによるフォーカストラップは React Aria の FocusScope が管理する。happy-dom テスト環境では合成キーボードイベントでフォーカス移動をシミュレートできないため、E2Eテストで検証する。

### 6. オーバーレイクリック（ADR-007準拠）

背景クリックの動作をテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| オーバーレイクリック | onCancelが呼ばれる | 背景クリックでダイアログを閉じる |
| ダイアログ内クリック | onCancelが呼ばれない | ダイアログ内のクリックは伝播しない |

**対応テスト**: `overlay-events.test.tsx`

### 7. フォーカス管理（ADR-007準拠）

フォーカスの自動移動をテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 初期フォーカス | ダイアログ内の最初のボタンにフォーカス | 開いた瞬間にフォーカスが移動 |

**対応テスト**: `focus-management.test.tsx`

## 網羅性チェック

- [x] 表示/非表示の状態（2パターン）
- [x] Propsの反映（5パターン）
- [x] アクセシビリティ属性（6パターン）- ADR-007必須、useId動的ID連携を含む
- [x] ボタンクリックイベント（3パターン）
- [x] キーボード操作（ユニット: Escapeのみ、Tab/Shift+TabはE2E）- ADR-007必須
- [x] オーバーレイクリック（2パターン）- ADR-007必須
- [x] フォーカス管理（1パターン）- ADR-007必須
- [ ] ポータルレンダリング → スタイリングのみ、ユニットテストでは検証困難
- [x] 背景スクロール無効化 → E2Eテストで検証（delete-rule/accessibility.spec.ts）
- [x] フォーカストラップ（Tab/Shift+Tab）→ E2Eテストで検証（delete-rule/accessibility.spec.ts）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/ui/components/organisms/ConfirmDialog/
├── test-helpers.tsx              # 共通ヘルパー（モックファクトリ含む）
└── render/
    ├── visibility.test.tsx           # 表示/非表示
    ├── title-message.test.tsx        # タイトル・メッセージProps反映
    ├── confirm-button-labels.test.tsx # 確認ボタンラベル（配列ベース）
    ├── cancel-button-labels.test.tsx  # キャンセルボタンラベル（配列ベース）
    ├── aria-attributes.test.tsx      # 基本ARIA属性（配列ベース）
    ├── dynamic-id.test.tsx           # useIdによる動的ID連携
    ├── button-events.test.tsx        # ボタンクリックイベント
    ├── keyboard-events.test.tsx      # キーボード操作
    ├── overlay-events.test.tsx       # オーバーレイクリック
    └── focus-management.test.tsx     # フォーカス管理
```

## モック戦略

Reactコンポーネントのテストなので、コールバック関数をモック化する。

### モック対象

- `onConfirm`: 確認ボタンのクリックハンドラ
- `onCancel`: キャンセルボタン/オーバーレイ/Escapeキーのハンドラ

### ヘルパーファイル

```text
tests/unit/frameworks-and-drivers/ui/components/organisms/ConfirmDialog/
└── test-helpers.tsx    # createDefaultProps関数、ConfirmDialogTestHelperクラス
```
