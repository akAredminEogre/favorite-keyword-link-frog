---
codd:
  node_id: "governance:coding-standards-src-frameworks-and-drivers-ui-css-styling-design-tokens"
  type: governance
---

# デザイントークンの使用

## 規約

- カラー値は必ず CSS 変数（デザイントークン）を使用する
- ハードコードされた色値（`#xxxxxx`、`rgb()`、`rgba()`）は原則禁止
- 新しい色が必要な場合は `tokens.module.css` にトークンを追加する

## 禁止事項

- コンポーネント CSS 内での直接的な色値指定

## 許可事項

- `rgba(0, 0, 0, X)` 形式の透明度指定（オーバーレイ背景など、色相を持たない場合）
- `transparent` キーワードの使用

## トークンファイルの場所

`src/components/tokens.module.css`

## トークンの命名規則

| カテゴリ | プレフィックス | 例 |
|---------|---------------|-----|
| 色 | `--color-` | `--color-primary`, `--color-danger` |
| ホバー色 | `--color-*-hover` | `--color-primary-hover`, `--color-danger-hover` |
| コントラスト色 | `--color-*-contrast` | `--color-primary-contrast` |
| サイズ | `--size-` | `--size-sm`, `--size-md` |
| 間隔 | `--spacing-` | `--spacing-md`, `--spacing-lg` |
| フォント | `--font-` | `--font-size-md`, `--font-weight-bold` |
| ボーダー | `--border-` | `--border-radius`, `--border-width` |
| シャドウ | `--shadow-` | `--shadow-sm` |

## 新規トークン追加時のルール

1. 既存トークンで代用できないか確認する
2. トークン名は用途ではなく意味で命名する（例: `--color-delete-button` ではなく `--color-danger`）
3. ホバー状態がある場合は対応する `-hover` トークンも追加する
4. コントラスト色を定義する場合はWCAG AA基準を満たすことを確認する

## 具体例

### 例1: 削除ボタン用の色が必要な場合

1. 既存トークン確認: `--color-danger` が既に存在するか確認
2. 命名: `--color-delete-button` ではなく `--color-danger` を使用（意味で命名）
3. ホバー色: `--color-danger-hover` も追加
4. コントラスト検証: `--color-danger` (#c53030) + `--color-danger-contrast` (#fff) = 約5.47:1 (基準4.5:1以上をクリア)

### 例2: WCAG AA基準を余裕を持ってクリアするための色修正

当初 `--color-danger: #dc3545` を使用していたが、白文字とのコントラスト比が約4.53:1でWCAG AA基準(4.5:1)をギリギリでクリアする程度だった。`#c53030` に変更することで約5.47:1となり、余裕を持って基準をクリアできるようにした。

## stylelint について

CSS ファイル内の色値検出は stylelint の領域だが、以下の理由から自動検証は行わない：

- `rgba(0, 0, 0, X)` 形式の透明度指定は許可される（例外が多い）
- `transparent` キーワードも許可される
- 新規トークン追加時の判断は人間が行う必要がある

現時点では PR レビューで確認する。
