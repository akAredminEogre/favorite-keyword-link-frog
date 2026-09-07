---
codd:
  node_id: "design:design-pages-rule-list-features-toggle-rule-active-05-test-strategy-tabs-constructor"
  type: design
---

# Tabs.constructor() テスト戦略

## 目的

chrome.tabs.Tab[]を受け取り、urlとidが存在するタブのみをフィルタリングして保持する。
ファーストクラスコレクションとして、無効なタブを除外した状態で初期化する。

## テスト分類

### 1. 正常系（有効タブの保持）

urlとidが両方存在するタブが正しく保持されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 有効タブのみ | 全タブがurl/id両方を持つ | 基本パターン |
| 空配列 | 空配列で初期化 | 境界値 |
| 単一タブ | 1件のみの配列 | 境界値 |

**対応テスト**: `normal-cases.test.ts`

### 2. フィルタリング（無効タブの除外）

url/idがundefinedのタブが除外されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| urlがundefined | urlのみ欠落 | 同値分割 |
| idがundefined | idのみ欠落 | 同値分割 |
| 両方undefined | url/id両方欠落 | 同値分割 |
| 混在 | 有効/無効が混在 | 組み合わせ |

**対応テスト**: `filtering-cases.test.ts`

## 網羅性チェック

- [x] 有効タブの保持（url/id両方存在）
- [x] 空配列の処理
- [x] urlがundefinedのタブ除外
- [x] idがundefinedのタブ除外
- [x] 混在ケース
- [ ] 異常系 → 不要（配列のみ受け付けるため型で制約）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/browser/Tabs/constructor/
├── normal-cases.test.ts      # 有効タブの保持（3ケース、配列ベース）
└── filtering-cases.test.ts   # フィルタリング（4ケース、配列ベース）
```

## モック戦略

chrome.tabs.Tab型のモックオブジェクトを使用。
chrome APIの呼び出しはないため、グローバルモックは不要。

### モックファイル構成

```text
tests/unit/frameworks-and-drivers/browser/Tabs/
└── mocks/
    └── createMockTab.ts   # モック生成関数
```

### 使用方法

```typescript
// テストコード内で直接モックを定義せず、インポートして使用
import { createMockTab } from '../mocks/createMockTab';
```
