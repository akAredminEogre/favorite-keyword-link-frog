---
codd:
  node_id: "test:user-stories-user-story-011-acceptance-criteria"
  type: test
---

# 受け入れ条件

## ユーザーストーリー要件

- [x] AC-1: 通常運用と同様に `docker compose exec frontend npm run lint:md` を実行したときに、`docs/` 配下のMarkdownファイルが検証される
- [x] AC-2: 言語指定なしのコードブロックが違反として検出される(MD040)
- [x] AC-3: 許可されていない言語識別子を使用したコードブロックが違反として検出される(MD040)
- [x] AC-4: 見出しレベルの階層スキップが違反として検出される(MD001)
- [x] AC-5: 既存ドキュメントの違反箇所がすべて修正されている (completed配下は対象外)

## 技術要件

- [x] AC-6: `markdownlint-cli2` が `devDependencies` に追加されている
- [x] AC-7: `.markdownlint.jsonc` に MD001、MD040 ルールが設定されている
- [x] AC-8: `allowed_languages` に `docs/docs-rules/common/markdown.md` で定義された言語識別子のみ指定されている
- [x] AC-9: `Makefile` に markdownlint 実行コマンドが追加されている
- [x] AC-10: `.markdownlintignore` が作成されており、除外すべきファイル/ディレクトリが設定されている
