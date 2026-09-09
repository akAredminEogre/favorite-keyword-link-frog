---
codd:
  node_id: "req:non-functional-requirements"
  type: requirement
  depends_on:
    - id: "req:business-requirements"
      relation: derives_from
      semantic: governance
---

# 非機能要件定義書

## セキュリティ要件

### データ保護
- **データ保存場所:** すべてローカル（chrome.storage.local、chrome.storage.sync）
- **外部送信:** ユーザーデータの外部送信は一切行わない
- **暗号化:** 設定データは平文（機密情報なし）
- **アクセス制御:** 拡張機能内でのみデータアクセス可能

### 権限管理
| 権限 | 必要性 | セキュリティ影響 | 軽減策 |
|-----|-------|---------------|--------|
| storage | 必須 | 低 | データは全てローカル |
| activeTab | 必須 | 中 | アクティブタブのみアクセス |
| scripting | 必須 | 高 | 最小限のスクリプト注入、CSP準拠 |

### Content Security Policy準拠
- **インラインスクリプト:** 全面禁止
- **eval()関数:** 使用禁止
- **外部スクリプト:** 読み込み禁止
- **動的コード生成:** 禁止

### 第三者サイトへの影響
- **非破壊的操作:** 元のページへの永続的変更なし
- **パフォーマンス影響:** ページ表示速度への影響最小化
- **互換性:** 既存のJavaScriptとの競合回避



