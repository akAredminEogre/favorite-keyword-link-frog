---
codd:
  node_id: "governance:coding-standards-tests-unit-frameworks-and-drivers"
  type: governance
---

# Frameworks and Drivers Unit Tests

## テスト範囲
### 必須
- ドメインロジックを利用する箇所に対して、ドメインロジックが正しく動作することを確認するためのテストを実装する。
- データ変換・フィルタリングロジックを含む箇所
  - 入力データの検証・変換処理
  - 無効データの除外処理

### 任意
- frameworks-and-driversのロジックそのものが動作することを確認するテストは不要(指示がない限りは作成しない)
  - 並列処理
  - 非同期処理
  - フレームワークやライブラリの動作確認
  - 外部サービスとの連携確認
- frameworks-and-driversのロジックがドメインロジックを正しく利用していることを確認するテストは不要
  - モックやスタブを利用してドメインロジックの動作を確認するテスト
