---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-react-hooks-react-aria-integration"
  type: governance
---

# React Ariaコンポーネントとの責任分担

## 概要

React Aria（@react-aria/*）のコンポーネントやフックを使用する場合、React Ariaが管理する機能と手動実装の責任を明確に分離する必要がある。

## 適用シナリオ

1. **新しいモーダルダイアログでフォーカス管理を実装する場合**: FocusScopeの`contain`と`restoreFocus`を使用しているなら、useEffectでフォーカストラップやフォーカス復元を手動実装してはならない。手動実装するとFocusScopeと二重実行・競合が発生する
2. **破壊的アクションを含むダイアログで初期フォーカスを安全な選択肢に設定したい場合**: FocusScopeの`autoFocus`プロパティではなく、フォーカスしたい要素（例: キャンセルボタン）に直接`autoFocus`属性を付ける。FocusScopeのautoFocusは最初のフォーカス可能要素にフォーカスするため、対象を指定できない

## 原則: React Ariaが管理する機能は手動で重複実装しない

React Ariaのコンポーネント/フックが特定の機能を管理している場合、同じ機能をuseEffectで手動実装すると**二重実行や競合**が発生する可能性がある。

## FocusScopeの責任分担

`FocusScope`を使用する場合、以下の属性が管理する機能は手動実装しない：

| FocusScope属性 | 管理する機能 | 手動useEffectでの実装 |
|---------------|-------------|---------------------|
| `autoFocus` | 初期フォーカス設定 | **使用しない**（要素のautoFocus属性で代替） |
| `restoreFocus` | フォーカス復元 | **実装しない**（競合防止） |
| `contain` | フォーカストラップ | **実装しない** |

### FocusScopeのautoFocusプロパティを使用しない理由

FocusScopeの`autoFocus`プロパティは**最初のフォーカス可能な要素**に自動フォーカスする。フォーカス対象を指定できないため、以下の問題がある：

- WAI-ARIAベストプラクティスでは、破壊的アクションを伴うダイアログでは安全な選択肢（キャンセルボタン）にフォーカスすべき
- 最初のフォーカス可能な要素が危険なアクション（削除ボタン等）の場合、誤操作のリスクがある

### 推奨: 要素のautoFocus属性を使用する

React Aria公式の推奨パターン: フォーカスしたい要素に直接`autoFocus`属性を付ける。

参考: [adobe/react-spectrum Issue #595](https://github.com/adobe/react-spectrum/issues/595)

**注意**: FocusScopeの`autoFocus`プロパティと要素の`autoFocus`属性を併用すると競合が発生する。要素の`autoFocus`属性のみを使用すること。

## 例: FocusScopeと要素のautoFocus属性の併用

```tsx
// ✅ 良い例: 要素のautoFocus属性で初期フォーカスを設定
<FocusScope contain restoreFocus>
  <Dialog>
    <button>確認</button>
    <button autoFocus>キャンセル</button>  {/* ← この要素にフォーカス */}
  </Dialog>
</FocusScope>
```

```tsx
// ❌ 悪い例1: FocusScopeのautoFocusプロパティ（フォーカス対象を指定できない）
<FocusScope contain restoreFocus autoFocus>
  <Dialog>
    <button>確認</button>  {/* ← 最初の要素にフォーカスされてしまう */}
    <button>キャンセル</button>
  </Dialog>
</FocusScope>
```

```tsx
// ❌ 悪い例2: 手動useEffectでの実装（不要な複雑さ）
<FocusScope contain restoreFocus>
  <Dialog>...</Dialog>
</FocusScope>

useEffect(() => {
  if (isOpen && buttonRef.current) {
    buttonRef.current.focus();
  }
}, [isOpen]);
```

```tsx
// ❌ 悪い例3: FocusScopeのrestoreFocusと重複
<FocusScope contain restoreFocus>
  <Dialog>...</Dialog>
</FocusScope>

useEffect(() => {
  if (!isOpen) return;
  const previousElement = document.activeElement;
  buttonRef.current?.focus();

  return () => {
    // これはFocusScopeのrestoreFocusと競合する
    previousElement?.focus();
  };
}, [isOpen]);
```

## usePreventScrollの責任分担

`usePreventScroll`を使用する場合、背景スクロールの無効化/復元は手動実装しない：

```tsx
// ✅ 良い例: usePreventScrollに任せる
usePreventScroll({ isDisabled: !isOpen });

// ❌ 悪い例: 手動でも実装する（重複）
usePreventScroll({ isDisabled: !isOpen });
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

## チェックリスト

React Ariaコンポーネント/フックを使用する際は、以下を確認すること：

- [ ] 使用するReact Ariaコンポーネント/フックが管理する機能を把握したか
- [ ] 初期フォーカスは要素の`autoFocus`属性で設定しているか（FocusScopeのautoFocusプロパティは使わない）
- [ ] 手動useEffectで同じ機能を重複実装していないか
- [ ] ADR等に責任分担を明記したか

## 補足: なぜ重複が問題になるか

1. **二重実行**: 同じ操作が2回実行される（例: フォーカス復元が2回）
2. **競合**: 実行順序によって意図しない結果になる
3. **保守性低下**: どちらが実際に機能しているか不明確になる

## 関連React Ariaパッケージ

| パッケージ | 主な機能 |
|-----------|---------|
| `@react-aria/focus` | FocusScope（フォーカストラップ、自動フォーカス、復元） |
| `@react-aria/overlays` | usePreventScroll（背景スクロール無効化） |
| `@react-aria/dialog` | useDialog（ダイアログセマンティクス） |

## eslint-rule

**部分的にESLint化**:

| ルール | ESLint化 | 設定ファイル |
|-------|---------|-------------|
| FocusScopeのautoFocus禁止 | ✅ 可能 | [host-frontend-root/frontend-src-root/eslint-rules/react.js](../../../../../../host-frontend-root/frontend-src-root/eslint-rules/react.js) |
| restoreFocusとの重複実装禁止 | ❌ 不可 | PRレビューで確認 |
| usePreventScrollとの重複実装禁止 | ❌ 不可 | PRレビューで確認 |
