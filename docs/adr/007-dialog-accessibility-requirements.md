---
codd:
  node_id: "governance:adr-007-dialog-accessibility-requirements"
  type: governance
---

# ADR-007: ダイアログコンポーネントのアクセシビリティ要件

## ステータス

採用

## コンテキスト

モーダルダイアログ（ConfirmDialogなど）は、ユーザーの注意を特定のコンテンツに集中させるUIパターンである。適切なアクセシビリティ対応がないと、スクリーンリーダーユーザーやキーボードユーザーにとって使いづらいものになる。

WAI-ARIA Authoring Practices（Dialog Modal Pattern）に準拠したアクセシビリティ対応が必要である。

## 決定

ダイアログコンポーネント（ConfirmDialog等）を実装する際は、以下の要件を満たすこと。

### 必須要件

#### 1. ARIA属性

| 属性 | 必須 | 説明 |
|------|------|------|
| role="dialog" | ○ | ダイアログであることを示す |
| aria-modal="true" | ○ | モーダルダイアログであることを示す |
| aria-labelledby | ○ | タイトル要素のIDを参照 |
| aria-describedby | △ | 説明文要素のIDを参照（オプション） |
| tabIndex={-1} | ○ | プログラム的なフォーカス設定を可能にする |

**tabIndex={-1}について**: ダイアログコンテナに`tabIndex={-1}`を設定することで、JavaScriptからプログラム的にフォーカスを設定可能になる。これはWAI-ARIA Dialog Modal Patternのベストプラクティスであり、より堅牢なフォーカス管理を実現する。

#### 1.1 ID生成にuseId()を使用（必須）

`aria-labelledby`や`aria-describedby`で参照するIDは、**必ずReactの`useId()`フックを使用して生成すること**。

**理由**:
- ハードコードされたID（例: `confirm-dialog-title`）は、同一ページ内で複数のダイアログが同時にレンダリングされた場合にID競合を引き起こす
- `useId()`はReact 18で導入されたフックで、サーバーサイドレンダリングでも安全に一意のIDを生成する
- 将来的な拡張性を確保し、コンポーネントの再利用性を高める

**実装方法**: [`useDialogIds`フック](../coding-standards/src/frameworks-and-drivers/ui/react-hooks/useDialogIds.md)を使用する。

#### 2. フォーカス管理

| 要件 | 説明 |
|------|------|
| 初期フォーカス | ダイアログが開いたとき、最初のフォーカス可能な要素にフォーカスを移動 |
| フォーカストラップ | ダイアログが開いている間、Tab/Shift+Tabでフォーカスがダイアログ内に閉じ込められる |
| 復帰フォーカス | ダイアログが閉じたとき **またはコンポーネントがアンマウントされたとき**、可能な場合はトリガー要素にフォーカスを戻す |

#### 2.1 React Ariaによる自動管理

React Ariaを使用する場合、以下の機能が自動化される：

| 機能 | React Aria Hook/Component | 備考 |
|------|--------------------------|------|
| フォーカストラップ | `FocusScope` (contain) | |
| 初期フォーカス | 要素の`autoFocus`属性 | FocusScopeの`autoFocus`プロパティは使用しない |
| 復帰フォーカス | `FocusScope` (restoreFocus) | |
| 背景スクロール無効化 | `usePreventScroll` | |

**注意**: FocusScopeの`autoFocus`プロパティは最初のフォーカス可能な要素にフォーカスするため、フォーカス対象を指定できない。フォーカスしたい要素に直接`autoFocus`属性を付けること（例: `<button autoFocus>`）。

詳細は[React Ariaコンポーネントとの責任分担](../coding-standards/src/frameworks-and-drivers/ui/react-hooks/react-aria-integration.md)を参照。

#### 3. キーボードイベント処理

| キー | 動作 | 実現方法 |
|------|------|---------|
| Escape | ダイアログを閉じる | 手動ハンドラ（onKeyDown） |
| Tab | 次のフォーカス可能な要素に移動（ループ） | `FocusScope` (contain) |
| Shift + Tab | 前のフォーカス可能な要素に移動（ループ） | `FocusScope` (contain) |

フォーカストラップはReact Ariaの`FocusScope`で自動化。Escapeキーは手動ハンドラで処理。

#### 4. 外側クリックでのクローズ

ダイアログの背景（オーバーレイ）をクリックした場合、ダイアログを閉じる。

オーバーレイのonClickハンドラで手動処理（ダイアログ内クリックとの判別が必要）。

#### 5. ポータルレンダリング

z-indexの問題を回避し、DOMツリーの最上位にダイアログをレンダリングするため、React Portalを使用する。

#### 6. 背景スクロールの無効化

ダイアログが開いている間、背景のスクロールを無効化する。

### 推奨ライブラリ（採用済み）

本プロジェクトでは**React Aria**を採用（理由: テスト環境互換性と堅牢性）。

詳細は[アクセシブルモーダルコンポーネント規約](../coding-standards/src/frameworks-and-drivers/ui/accessible-modal.md)を参照。

### ベースコンポーネント（推奨）

本ADRの要件を満たすベースコンポーネントとカスタムフックを提供している。
新しいダイアログコンポーネントを実装する際は、これらを使用すること。

詳細は[アクセシブルモーダルコンポーネント規約](../coding-standards/src/frameworks-and-drivers/ui/accessible-modal.md)を参照。

### ビジュアルスタイリング要件

| 要素 | 要件 |
|------|------|
| オーバーレイ | 半透明の背景で、下層コンテンツとの視覚的分離を明確にする |
| ダイアログ本体 | 中央配置、適切なパディング、明確な境界 |
| フォーカス表示 | フォーカス状態が視覚的に明確である（:focus-visible） |
| ボタン配置 | 破壊的アクション（削除等）は目立つ位置に配置し、色で警告を示す |

## 理由

1. **法的要件**: WCAG 2.1準拠は多くの地域で法的要件となっている
2. **ユーザビリティ**: キーボードユーザー、スクリーンリーダーユーザーの操作性向上
3. **一貫性**: WAI-ARIA標準に従うことで、ユーザーの期待通りの動作を提供
4. **メンテナンス性**: 標準パターンに従うことで、将来の変更が容易

### 適用済みの箇所

適用済みコンポーネントの詳細は[アクセシブルモーダルコンポーネント規約](../coding-standards/src/frameworks-and-drivers/ui/accessible-modal.md)を参照。

### 適用待ちの箇所

該当なし

## 影響ドキュメント

このADRが変更された場合、以下のドキュメントも更新が必要：

- [アクセシブルモーダルコンポーネント規約](../coding-standards/src/frameworks-and-drivers/ui/accessible-modal.md) - 実装チェックリスト

## 関連ドキュメント

- [WAI-ARIA Authoring Practices - Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [React Aria useDialog](https://react-spectrum.adobe.com/react-aria/useDialog.html)
- [useEffectの副作用管理ルール](../coding-standards/src/frameworks-and-drivers/ui/react-hooks/useEffect-side-effects.md)
