---
codd:
  node_id: "design:design-src-frameworks-and-drivers-ui-components-atoms-toastnotification-component"
  type: design
---

# ToastNotification コンポーネント テスト戦略

## 目的

トースト通知コンポーネントのレンダリングとユーザーインタラクションを検証する。
成功/エラーメッセージの表示、表示/非表示の切り替え、閉じるボタンのクリックイベントを検証する。

## テスト分類

### 1. 表示/非表示の状態変更

isVisibleプロパティに基づく表示切り替えをテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| isVisible=false | トーストが表示されない | 非表示状態ではnullを返すことを保証 |
| isVisible=true | トーストが表示される | 表示状態でDOMに存在することを確認 |

**対応テスト**: `visibility.test.tsx`

### 2. Props反映

渡されたPropsが正しくレンダリングされることをテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| message | メッセージテキストが表示される | ユーザーに通知内容を伝える |
| type="success" | data-type="success"が設定される | 成功メッセージの視覚的区別 |
| type="error" | data-type="error"が設定される | エラーメッセージの視覚的区別 |

**対応テスト**: `props.test.tsx`

### 3. ユーザーインタラクション

閉じるボタンクリック時のonCloseコールバック呼び出しを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 閉じるボタンクリック | onCloseが呼ばれる | ユーザーがトーストを閉じられる |

**対応テスト**: `interaction.test.tsx`

### 4. アクセシビリティ

WAI-ARIA属性の正しい設定を確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| role="alert" | role属性がalertに設定される | スクリーンリーダーが通知として認識 |
| aria-live="polite" | aria-live属性がpoliteに設定される | 適切なタイミングで読み上げられる |
| aria-label="閉じる" | 閉じるボタンにaria-labelがある | スクリーンリーダー対応 |

**対応テスト**: `accessibility.test.tsx`

## 網羅性チェック

- [x] isVisible=true/falseのレンダリング（2パターン）
- [x] messageのレンダリング（1パターン）
- [x] type="success"/"error"のレンダリング（2パターン）
- [x] onClose呼び出し（1パターン）
- [x] role="alert"設定（1パターン）
- [x] aria-live="polite"設定（1パターン）
- [x] 閉じるボタンのaria-label（1パターン）
- [ ] 自動非表示タイマー → Phase 2の次フェーズで実装予定、現時点ではスケルトン
- [ ] アニメーション → CSSの視覚的確認はStorybookで実施

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/ui/components/atoms/ToastNotification/
├── test-helpers.tsx          # 共通テストヘルパー（ToastNotificationTestHelper）
├── visibility.test.tsx       # 表示/非表示（2ケース）
├── props.test.tsx            # Props反映（3ケース）
├── interaction.test.tsx      # ユーザーインタラクション（1ケース）
└── accessibility.test.tsx    # アクセシビリティ（3ケース）
```

## モック戦略

Reactコンポーネントのテストなので、コールバック関数をモック化する。

### 使用するモック

| 依存関係 | モック理由 | モック対応 |
| -------- | ---------- | ---------- |
| onClose | 閉じるボタンのクリックハンドラ検証 | vi.fn()で直接モック |

### テストヘルパー

共通のセットアップ・クリーンアップロジックを集約したテストヘルパー:

**参照**: `tests/unit/frameworks-and-drivers/ui/components/atoms/ToastNotification/test-helpers.tsx`

外部依存（CSSモジュール）はVitestの設定で自動処理されるため、明示的なモックは不要。
