---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-react-hooks-index"
  type: governance
---

# React Hooks コーディング規約

## 概要

React Hooksを使用する際の規約。副作用管理、状態管理、型定義、パフォーマンス最適化について定める。

## 一般規約

| 規約 | 概要 |
|-----|------|
| [useEffectの副作用管理ルール](./useEffect-side-effects.md) | セットアップとクリーンアップの対応 |
| [Props依存状態のリセット](./props-dependent-state.md) | propsの変化に応じた内部状態のリセット |
| [React Ariaコンポーネントとの責任分担](./react-aria-integration.md) | React Ariaとの重複実装の回避 |
| [useRefの型ガイドライン](./useRef-types.md) | RefObject/MutableRefObjectの使い分け |
| [コールバックのメモ化](./callback-memoization.md) | useMemo/useCallbackの適切な使用 |
| [カスタムフックのJSDoc記述ルール](./jsdoc-rules.md) | 設計上の前提条件と制約の記載 |
| [状態ガード/ロックの実装ルール](./state-guard.md) | エラー時の状態リセット |

## プロジェクト提供カスタムフック

| フック | 概要 |
|-------|------|
| [useDialogIds](./useDialogIds.md) | aria-labelledby/aria-describedby用のID生成 |
| [useProcessingGuard](./useProcessingGuard.md) | 連続クリック防止・多重実行の回避 |

## 関連ドキュメント

- [ADR-007: ダイアログコンポーネントのアクセシビリティ要件](../../../../../adr/007-dialog-accessibility-requirements.md)
- [React公式ドキュメント - Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React公式ドキュメント - useRef](https://react.dev/reference/react/useRef)
