---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-css-styling-touch-target-size"
  type: governance
---

# タッチターゲットサイズのアクセシビリティ要件

## 原則

インタラクティブ要素は最小44x44ピクセルのタッチターゲットサイズを確保すること。

ボタン、リンク、アイコンなどのクリック/タップ可能な要素は、WCAG 2.1 Level AAAおよびモバイルベストプラクティスに準拠するため、最小44x44ピクセルのサイズを確保する。

## 必須プロパティ

| プロパティ | 値 | 目的 |
|-----------|-----|------|
| `min-width` | `44px` | 横方向のタッチ領域確保 |
| `min-height` | `44px` | 縦方向のタッチ領域確保 |

## 適用対象

- ボタン（`<button>`）
- アイコンボタン
- 閉じるボタン（×）
- リンク（主要なナビゲーション）
- トグルスイッチ

## 具体例

```css
/* ✅ 良い例: 44x44pxを確保 */
.iconButton {
  min-width: 44px;
  min-height: 44px;
}

/* ❌ 悪い例: サイズが小さい */
.iconButton {
  min-width: 32px;
  min-height: 32px;
}
```

## stylelint について

`min-width`/`min-height` の値が 44px 以上かを検証する stylelint 標準ルールは存在しない。
カスタムプラグインの開発で対応可能だが、現時点ではコスト対効果の観点から見送り。

現時点では PR レビューで確認する。
