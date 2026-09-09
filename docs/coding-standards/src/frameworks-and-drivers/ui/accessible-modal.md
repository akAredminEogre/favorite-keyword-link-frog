---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-accessible-modal"
  type: governance
---

# アクセシブルモーダルコンポーネント規約

## 概要

モーダルダイアログ、確認ダイアログなど、ユーザーの注意を特定のコンテンツに集中させるUIパターンを実装する際の規約。

WAI-ARIA Authoring Practices（Dialog Modal Pattern）に準拠したアクセシビリティ対応を行う。

## 適用シナリオ

この規約は以下のようなモーダルUIを実装する際に適用する：

1. **確認ダイアログ**: ユーザーに破壊的操作（削除、上書き等）の確認を求める場合
   - 例: 「本当に削除しますか？」の確認ダイアログ
   - フォーカストラップで誤クリックを防止し、ESCキーでキャンセル可能にする

2. **フォーム入力モーダル**: ユーザーが入力中に背景コンテンツへ移動すると操作が中断される場合
   - 例: ルール編集ダイアログ
   - フォーカストラップで入力中のフォーカス離脱を防ぎ、背景スクロール無効化で意図しないスクロールを防止する

## 原則: ベースコンポーネントを使用する

新しいダイアログコンポーネントを実装する際は、**ModalDialogBase**を使用すること。

**配置**: `src/frameworks-and-drivers/ui/components/molecules/ModalDialogBase/`

ModalDialogBaseは以下の機能を自動的に提供する：
- ARIA属性（role, aria-modal, aria-labelledby, aria-describedby, tabIndex）
- フォーカストラップ（FocusScope contain）
- フォーカス復元（FocusScope restoreFocus）
- 背景スクロール無効化（usePreventScroll）
- Escapeキーでダイアログを閉じる
- オーバーレイクリックでダイアログを閉じる
- ポータルレンダリング（createPortal）
- useId()によるID自動生成

## 実装チェックリスト

ModalDialogBaseを使用せず、独自にモーダルコンポーネントを実装する場合は、[ADR-007: ダイアログコンポーネントのアクセシビリティ要件](../../../../adr/007-dialog-accessibility-requirements.md)の「必須要件」セクションを参照し、漏れがないことを確認すること。

## React Ariaとの責任分担

React Ariaを使用する場合、以下の責任分担を遵守すること：

| 機能 | React Aria | 手動実装 |
|------|-----------|---------|
| フォーカストラップ | `FocusScope` (contain) | - |
| 初期フォーカス | - | 要素の`autoFocus`属性 |
| 復帰フォーカス | `FocusScope` (restoreFocus) | - |
| 背景スクロール無効化 | `usePreventScroll` | - |
| Escapeキー処理 | - | onKeyDownハンドラ |
| オーバーレイクリック | - | onClickハンドラ |

**注意**: `FocusScope`の`autoFocus`プロパティは使用しない。
- `FocusScope`の`autoFocus`は最初のフォーカス可能な要素にフォーカスするため、フォーカス対象を指定できない
- 代わりに、フォーカスしたい要素に直接`autoFocus`属性を付ける（例: `<button autoFocus>`）

詳細は[React Ariaコンポーネントとの責任分担](./react-hooks/react-aria-integration.md)を参照。

## 適用済みコンポーネント

本規約を満たすコンポーネント：

| コンポーネント | 配置 | 説明 |
|---------------|------|------|
| ModalDialogBase | `src/frameworks-and-drivers/ui/components/molecules/ModalDialogBase/` | ベースコンポーネント（ADR-007全要件を実装） |
| ConfirmDialog | `src/frameworks-and-drivers/ui/components/organisms/ConfirmDialog/` | ModalDialogBaseを使用 |

## 採用ライブラリ

本プロジェクトでは**React Aria**を採用している。

| パッケージ | 用途 |
|-----------|------|
| `@react-aria/focus` | フォーカストラップ、フォーカス復元（FocusScope） |
| `@react-aria/overlays` | 背景スクロール無効化（usePreventScroll） |

**採用理由**:
- テスト環境（happy-dom）との互換性を確保
- 必要な機能は維持しつつ、堅牢性を優先

**ハイブリッドアプローチ**:
- React Ariaで自動化: フォーカストラップ、フォーカス復元、スクロール防止
- 手動実装: Escapeキー処理、オーバーレイクリック処理

## eslint-rule

**部分的にESLint化**:

| ルール | ESLint化 | 設定ファイル |
|-------|---------|-------------|
| FocusScopeのautoFocus禁止 | ✅ 可能 | [host-frontend-root/frontend-src-root/eslint-rules/react.js](../../../../../host-frontend-root/frontend-src-root/eslint-rules/react.js) |
| その他のモーダル実装パターン | ❌ 不可 | PRレビューで確認 |

## 関連ドキュメント

- [ADR-007: ダイアログコンポーネントのアクセシビリティ要件](../../../../adr/007-dialog-accessibility-requirements.md)
- [WAI-ARIA Authoring Practices - Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [React Hooks コーディング規約](./react-hooks/index.md)
