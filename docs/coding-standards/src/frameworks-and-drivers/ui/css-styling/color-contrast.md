---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-css-styling-color-contrast"
  type: governance
---

# 色コントラストのアクセシビリティ要件

## 原則

背景色とテキスト色のコントラスト比はWCAG AA基準を満たすこと。

新しいカラートークンを追加する際、背景色と前景色（テキスト色）の組み合わせがWCAG AA基準を満たすことを確認する。

## WCAG AA基準

| 用途 | 最小コントラスト比 |
|------|-------------------|
| 通常テキスト（18px未満） | 4.5:1 |
| 大きなテキスト（18px以上、または14px太字） | 3:1 |
| UIコンポーネント・グラフィック | 3:1 |

## 検証方法

- オンラインツール（WebAIM Contrast Checker等）でコントラスト比を確認
- 新しい `--color-*` と `--color-*-contrast` の組み合わせを追加する際は必ず検証

## stylelint について

色のコントラスト比は、背景色と前景色の組み合わせから計算が必要であり、
stylelint の静的解析では検証困難。

現時点では PR レビューで確認する。
