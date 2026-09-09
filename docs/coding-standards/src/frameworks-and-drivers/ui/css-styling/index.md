---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-css-styling-index"
  type: governance
---

# CSS スタイリング コーディング規約

## 概要

UI コンポーネントの CSS スタイリングに関する規約。

## 規約一覧

| 規約 | 概要 |
|------|------|
| [CSS Modules](./css-modules.md) | クラス名管理とテストセレクタの分離 |
| [インポートパス](./import-paths.md) | `@import`で絶対パス（`src/*`）を使用 |
| [デザイントークン](./design-tokens.md) | CSS変数を使用し、ハードコード色値を禁止 |
| [色コントラスト](./color-contrast.md) | WCAG AA基準を満たすコントラスト比 |
| [タッチターゲットサイズ](./touch-target-size.md) | 最小44x44pxのタッチ領域確保 |

## 関連ドキュメント

- `src/components/tokens.module.css` - デザイントークン定義ファイル
- `stylelint-rules/` - stylelint ルール設定ディレクトリ
  - `base.js` - 基本設定（stylelint-config-standard 拡張）
  - `css-modules.js` - CSS Modules 対応ルール
  - `import-paths.js` - インポートパスルール（ドキュメント紐づけ）
