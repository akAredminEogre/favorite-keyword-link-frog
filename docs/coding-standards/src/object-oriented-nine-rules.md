---
codd:
  node_id: "governance:coding-standards-src-object-oriented-nine-rules"
  type: governance
---

# オブジェクト指向ルール（ThoughtWorksアンソロジー）

以下の9つのルールを必ず遵守すること：

| # | ルール | ESLint |
|---|--------|--------|
| 1 | 1つのメソッドにつきインデントは1段階までにすること | ✅ 実装済 |
| 2 | else句を使用しないこと | ✅ 実装済 |
| 3 | すべてのプリミティブ型と文字列型をラップすること | ❌ eslint化不可（手動遵守） |
| 4 | 1行につきドットは1つまでにすること | ✅ 実装済 |
| 5 | 名前を省略しないこと | ✅ 実装済 |
| 6 | すべてのエンティティを小さくすること | ✅ 実装済 |
| 7 | 1つのクラスにつきインスタンス変数は2つまでにすること | ❌ eslint化不可（手動遵守） |
| 8 | ファーストクラスコレクションを使用すること | ❌ eslint化不可（手動遵守） |
| 9 | Getter、Setter、プロパティを使用しないこと | ✅ 実装済 |

## 適用シナリオ

1. **条件分岐を書こうとしたとき（ルール2: else句禁止）**: if-elseではなくearly returnやガード節で分岐を表現する。値が無効な場合に早期リターンし、正常系の処理をインデントなしで記述することで可読性を高める
2. **メソッドチェーンを書こうとしたとき（ルール4: 1行1ドット）**: 配列操作でフィルタ・変換・結合を連続して行う場合は中間変数に分割する。ただしChrome APIの呼び出しは除外パターンとして許可される

## 除外パターン

- **ルール3**: テストコードのモック関連コード、sendMessageのmessageパラメータ、catch節のerrorオブジェクト
- **ルール4**: chrome APIの呼び出しコード、`this.xxx.yyy()` 形式の依存注入オブジェクトへのメソッド呼び出し

## 対象ファイル
- src/frameworks-and-drivers/browser以下のコード
- src/application-business-rules/interactors/以下のコード

## eslint-rule

| ルール | ESLintファイル |
|--------|----------------|
| Rule 1: インデント1段階 | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/indent-depth.js` |
| Rule 2: else句禁止 | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/no-else.js` |
| Rule 2: switch-case分離 | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/no-switch-case.js` |
| Rule 4: 1行1ドット | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/one-dot-per-line.js` |
| Rule 5: 名前省略禁止 | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/no-name-abbreviation.js` |
| Rule 6: エンティティサイズ | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/entity-size.js` |
| Rule 9: Getter/Setter禁止 | `host-frontend-root/frontend-src-root/eslint-rules/object-oriented-nine-rules/no-getter-setter.js` |

その他のルール（3, 7, 8）はルールの性質上 eslint 化不可（自動検出が原理的に困難）のため、今後も eslint ルールは追加せず、手動遵守とPRレビューで担保する。