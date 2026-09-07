---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-css-styling-import-paths"
  type: governance
---

# CSSインポートパスのルール

## 規約

- `@import`では`tsconfig.json`で定義されているパスエイリアス（`src/*`）を使用すること
- 相対パス（`../`）は使用しないこと

## 禁止事項

- `@import '../../../../../components/tokens.module.css'` のような相対パス

## 許可事項

- `@import 'src/components/tokens.module.css'` のような絶対パス

## 具体例

```css
/* ❌ 悪い例: 相対パス */
@import '../../../../../components/tokens.module.css';

/* ✅ 良い例: 絶対パス */
@import 'src/components/tokens.module.css';
```

## stylelint ルールファイル

`stylelint-rules/import-paths.js`

stylelint の標準ルールセットには `@import` パスの検証ルールがないため、
現時点では PR レビューで確認する。将来的にカスタムルールやプラグインで自動検証を検討。
