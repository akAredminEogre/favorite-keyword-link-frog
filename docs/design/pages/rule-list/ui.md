---
codd:
  node_id: "design:design-pages-rule-list-ui"
  type: design
---

# Rule Table UI 設計

## 概要
<!-- TODO: このUI設計に沿ったフロントエンドコンポーネントテストの実装 -->

ルール一覧を表示するテーブルコンポーネントのUI設計仕様書です。
RulesTable（Organism層）とRuleTableRow（Molecule層）コンポーネントによって構成されています。

## テーブル構造

### 列構成

| 列名 | 位置 | 幅 | 説明 |
|------|------|-----|------|
| 有効 | 1列目 | 最小幅（コンテンツ依存） | トグルスイッチを配置（有効/無効の切り替え） |
| 編集 | 2列目 | 最小幅（コンテンツ依存） | 編集ボタンを配置 |
| 削除 | 3列目 | 最小幅（コンテンツ依存） | 削除ボタン（ゴミ箱アイコン）を配置 |
| URLパターン | 4列目 | 200px（固定） | ルールが適用されるURLパターン |
| 置換前 | 5列目 | 可変（残り幅を自動配分） | 置換対象の文字列 |
| 置換後 | 6列目 | 可変（残り幅を自動配分） | 置換後の文字列 |

### 列幅の設計方針

アクション列（有効・編集・削除）は、各ボタン/コントロールを表示できる**最小の幅**とする。
これにより、データ列（URLパターン・置換前・置換後）により多くのスペースを確保できる。

### 列幅の実装

```css
/* テーブルレイアウト */
table-layout: auto;  /* コンテンツに応じた幅調整を有効化 */

/* 有効・編集・削除列（最小幅） */
width: 1%;
white-space: nowrap;

/* URLパターン列 */
width: 200px;

/* 置換前・置換後列 */
/* 幅指定なし: 残りの幅をブラウザが自動配分 */
```

## UI仕様

### テーブル全体

- **レイアウト**: `table-layout: auto` を使用してコンテンツ依存レイアウト
- **幅**: 画面幅にフィット（`width: 100%`）
- **境界線**: `border-collapse: collapse`
- **フォントサイズ**: 14px

### ヘッダー（thead）

- **背景色**: `#f8f9fa`
- **文字色**: `#2c3e50`
- **フォント太さ**: 600（セミボールド）
- **パディング**: `12px 8px`
- **境界線**: 下部に2px solid `#e1e5e9`
- **位置**: `position: sticky; top: 0`（スクロール時も固定）

### データ行（tbody tr）

#### 背景色（縞模様）
- **奇数行**: `#ffffff`（白）
- **偶数行**: `#f1f3f5`（薄いグレー）
- **ホバー時**:
  - 奇数行: `#f8f9fa`
  - 偶数行: `#e9ecef`

#### トランジション
- `background-color 0.2s ease`
  - ホバー時の背景色変更をスムーズに
  - 0.2秒のイージング効果

### データセル（tbody td）

#### 共通設定
- **パディング**: `10px 8px`
- **境界線**: 下部に1px solid `#f1f3f4`
- **縦配置**: `vertical-align: top`

#### 1〜3列目（有効・編集・削除列）
- **幅**: `1%`（コンテンツの最小幅）
- **配置**: 中央寄せ（`text-align: center`）
- **縦配置**: 中央（`vertical-align: middle`）
- **テキスト処理**: `white-space: nowrap`（折り返し禁止）

#### 4列目（URLパターン列）
- **幅**: 200px
- **フォント**: Monaco, Menlo, Ubuntu Mono（等幅フォント）
- **フォントサイズ**: 12px
- **文字色**: `#3498db`（青）
- **テキスト処理**:
  - 30文字で切り捨て、省略記号（...）を表示
  - `white-space: nowrap`
  - `text-overflow: ellipsis`

#### 5列目（置換前列）
- **幅**: 自動（残り幅をブラウザが自動配分）
- **フォント**: Monaco, Menlo, Ubuntu Mono（等幅フォント）
- **フォントサイズ**: 13px
- **文字色**: `#e74c3c`（赤）
- **テキスト処理**:
  - 折り返し許可（`word-wrap: break-word`）
  - 改行保持（`white-space: pre-wrap`）

#### 6列目（置換後列）
- **幅**: 自動（残り幅をブラウザが自動配分）
- **フォント**: Monaco, Menlo, Ubuntu Mono（等幅フォント）
- **フォントサイズ**: 13px
- **文字色**: `#27ae60`（緑）
- **テキスト処理**:
  - 折り返し許可（`word-wrap: break-word`）
  - 改行保持（`white-space: pre-wrap`）

### 編集ボタン

- **背景色**: `#3498db`（青）
- **文字色**: `white`
- **境界線**: なし
- **パディング**: `6px 12px`
- **角の丸み**: `4px`
- **フォントサイズ**: 12px
- **フォント太さ**: 500（ミディアム）
- **カーソル**: `pointer`
- **トランジション**: `background-color 0.2s ease`

#### ホバー時
- **背景色**: `#2980b9`（濃い青）

#### フォーカス時
- **アウトライン**: なし
- **ボックスシャドウ**: `0 0 0 2px rgba(52, 152, 219, 0.3)`

### コンテナ

- **マージン**: `20px 0`
- **横スクロール**: `overflow-x: auto`
- **角の丸み**: `8px`
- **境界線**: 1px solid `#e1e5e9`
- **ボックスシャドウ**: `0 2px 4px rgba(0, 0, 0, 0.1)`

## レスポンシブ対応

### モバイル（600px以下）

```css
@media (max-width: 600px) {
  .rulesTableContainer {
    font-size: 12px;
  }

  /* URLパターン・置換前・置換後列 */
  .rulesTable tbody td:nth-child(4),
  .rulesTable tbody td:nth-child(5),
  .rulesTable tbody td:nth-child(6) {
    min-width: 100px;
  }

  .rulesTable td {
    padding: 8px 4px;
  }

  .rulesTable thead th {
    padding: 8px 4px;
    font-size: 12px;
  }
}
```

## 技術的詳細

### CSS実装方法

- **セレクタ**: `nth-child`を使用して確実な幅制御を実現
- **ヘッダー**: `thead th:nth-child(n)`
- **データセル**: `tbody td:nth-child(n)`

### コンポーネント構成

- **RulesTable** (Organism): テーブル全体の構造とスタイル
- **RuleTableRow** (Molecule): 個別行の表示ロジック
- **CSS Modules**: スコープ化されたスタイル

### データ表示仕様

- **URLパターン**: 30文字制限、超過時は省略記号
- **置換前・後**: 長いテキストは折り返し表示
- **ホバー**: 全体の文字列をtitle属性で表示

## エクスポートボタン

テーブル上部に配置するエクスポート機能のボタン。

### 配置

- **位置**: テーブルヘッダー上部、右寄せ
- **コンポーネント**: ExportButton（Atom層）

### スタイル仕様

| プロパティ | 値 |
|-----------|-----|
| 背景色 | `transparent` |
| 文字色 | `var(--color-secondary)` |
| 境界線 | `1px solid var(--color-border)` |
| パディング | `var(--spacing-sm) var(--spacing-md)` |
| 角の丸み | `var(--border-radius)` |
| フォントサイズ | 14px |
| 最小高さ | 44px |
| カーソル | `pointer` |
| トランジション | `background-color 0.2s ease, color 0.2s ease` |
| アイコン | ダウンロードアイコン（ボタンテキスト左側） |
| ツールチップ | 「ルールをJSONファイルとしてエクスポート」 |
| aria-label | `"ルールをJSONエクスポート"` |

### 状態

| 状態 | 表示 |
|------|------|
| 通常（ルール1件以上） | 有効。クリックでJSONダウンロード開始 |
| ルール0件 | `disabled`。グレーアウト（`opacity: 0.5; cursor: not-allowed`） |
| エクスポート中（isExporting=true） | `disabled`。グレーアウト（重複実行防止） |
| ホバー時（有効状態） | 背景色: `var(--color-primary-bg)`, 文字色: `var(--color-primary)`, 境界線色: `var(--color-primary)` |
| フォーカス時 | アウトライン: `2px solid var(--color-primary)`, オフセット: `2px` |

### 動作

- クリック時: `useExportRulesJson` Hook経由でJSON形式のファイルダウンロードを実行
- ファイル形式: JSON（`frog-frame-front-rules-YYYYMMDD_hhmmss.json`）
- エラー時: トースト通知で「エクスポート処理中にエラーが発生しました: ...」形式のメッセージを表示（詳細エラーメッセージを含める）

## 更新履歴

- 2026-02-22: export-rules-json対応
  - エクスポートボタンのUI仕様を追加（配置、スタイル、状態、動作）
- 2026-01-29: user-story-003対応
  - 列構成を6列に拡張（有効・編集・削除・URLパターン・置換前・置換後）
  - 有効・編集・削除列の幅をボタンの最小幅に変更（`width: 1%; white-space: nowrap`）
  - テーブルレイアウトを`table-layout: auto`に変更（コンテンツ依存の幅調整を有効化）
- 2024-12-08: 初版作成（issue-153での実装結果を反映）
  - 列順を「操作、URLパターン、置換前、置換後」に変更
  - 正規表現列を削除
  - 操作列幅を80px→60pxに最適化
  - nth-childセレクタによる確実な幅制御を導入
  - テーブル縞模様の強化