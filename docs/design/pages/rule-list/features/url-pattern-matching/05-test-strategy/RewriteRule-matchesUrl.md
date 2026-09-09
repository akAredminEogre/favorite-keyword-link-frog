---
codd:
  node_id: "design:design-pages-rule-list-features-url-pattern-matching-05-test-strategy-rewriterule-matchesurl"
  type: design
---

# RewriteRule.matchesUrl() テスト戦略

## 目的

指定されたURLがこのルールのURLパターンに前方一致するかどうかを判定する。
URLパターンが空文字列の場合はマッチしないものとして扱う。

## テスト分類

### 1. 正常系 - trueを返すケース（前方一致）

入力URLがurlPatternで始まる場合にtrueを返すことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 基本パターン | URLが前方一致する場合（パス付き） | 基本的な前方一致の確認 |
| 完全一致 | URLとパターンが完全に一致 | 前方一致の特殊ケース |
| パス付き一致 | パス付きURLパターンで一致 | サブパスを含むURL対応 |
| パス完全一致 | パス付きURLパターンで完全一致 | 境界値確認 |
| localhost | localhost + ポート番号で一致 | 開発環境URL対応 |

**対応テスト**: `normal-cases-true.test.ts`

### 2. 正常系 - falseを返すケース（不一致）

前方一致しない場合やurlPatternが空の場合にfalseを返すことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 空パターン | URLパターンが空文字列 | 空パターンでのマッチ防止 |
| 類似パス不一致 | 類似するが異なるパス | 境界値確認（/api vs /app） |
| 異なるドメイン | ドメインが異なる | 基本的な不一致パターン |
| 異なるプロトコル | プロトコルが異なる（https vs http） | プロトコル区別の確認 |

**対応テスト**: `normal-cases-false.test.ts`

## 網羅性チェック

- [x] 前方一致の基本パターン（true）
- [x] 完全一致（true）
- [x] パス付きURLパターン（true）
- [x] 空文字列urlPattern（false）
- [x] 類似パス不一致（false）
- [x] 異なるドメイン（false）
- [x] 異なるプロトコル（false）
- [x] localhost + ポート番号（true）
- [ ] 異常系 → 不要（引数がstringのため型で制約、空文字列は正常系でカバー）

## テストファイル構成

```text
tests/unit/enterprise-business-rules/entities/RewriteRule/matchesUrl/
├── normal-cases-true.test.ts    # 前方一致（trueを返す）5ケース、配列ベース
└── normal-cases-false.test.ts   # 不一致（falseを返す）4ケース、配列ベース
```
