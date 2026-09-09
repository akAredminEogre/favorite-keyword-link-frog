---
codd:
  node_id: "design:design-src-application-business-rules-dto-output-deleteruleerroroutputdata-constructor"
  type: design
---

# DeleteRuleErrorOutputData.constructor() テスト戦略

## 目的

エラー情報を保持するOutput DTOを生成する。
ruleIdとerrorオブジェクトを受け取り、エラーメッセージを抽出して保持する。

## テスト分類

### 1. 正常系（メッセージ抽出）

errorオブジェクトからメッセージが正しく抽出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Errorオブジェクト | Errorオブジェクトからmessageを抽出 | 標準的なエラーオブジェクトの処理 |
| Error以外 | Error以外のオブジェクトを文字列に変換 | 非標準エラー（文字列等）の処理 |

**対応テスト**: `normal-cases.test.ts`

### 2. プロパティ設定

コンストラクタで渡された値が正しくプロパティに設定されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| ruleId設定 | ruleIdが正しく保持される | エラー対象のルール特定 |
| message設定 | messageが正しく保持される | エラー内容の伝達 |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

## 網羅性チェック

- [x] Errorオブジェクトからのメッセージ抽出
- [x] Error以外のオブジェクトの文字列変換
- [x] ruleIdの保持確認
- [x] messageの保持確認
- [ ] 異常系（null/undefined入力） → 不要（TypeScriptの型で制約）

## テストファイル構成

```text
tests/unit/application-business-rules/dto/output/DeleteRuleErrorOutputData/constructor/
└── normal-cases.test.ts       # メッセージ抽出確認（配列ベース、2ケース）
```

## モック戦略

モックは使用しない。DTOは純粋なデータ構造であり、外部依存がない。

### テストデータ

- Errorオブジェクト: `new Error('テストエラーメッセージ')`
- 文字列: `'エラー文字列'`
