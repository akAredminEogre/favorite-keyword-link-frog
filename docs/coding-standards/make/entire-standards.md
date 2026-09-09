---
codd:
  node_id: "governance:coding-standards-make-entire-standards"
  type: governance
---

# make コーディング規約

## 適用シナリオ

1. **新しいMakefileターゲットを追加する場合**: ターゲット内の処理でネストが深くなりそうな場合は、条件判定を別の関数やヘルパーターゲットに切り出してインデントを2段階以内に抑える。else句が必要になったらearly returnパターンに書き換える
2. **既存ターゲットにif-else分岐を追加する場合**: else句を使わず、条件不一致時にearly returnし、正常系の処理をフラットに記述する。変数名やターゲット名は省略せず意図が明確な名前にする
3. **開発者向けコマンドを追加する場合**: `make dev`, `make unit`, `make check` などの開発者が日常的に使用するMakefileターゲットを追加した場合は、以下の2箇所を同時に更新すること
   - `CLAUDE.md` の「Common Development Commands」セクション
   - `make/help/main.mk` の該当カテゴリ（`make help` で表示される内容）
4. **npm scriptsを実行する場合**: `docker compose exec frontend npm run <script>` 形式を使用すること。直接 `npx` や `npm run` を使用しない（ローカル環境でのパッケージインストール不要、一貫性の維持）
   - **例外**: `docs/`ディレクトリにアクセスが必要なコマンド（例: `lintmd`）は、Dockerコンテナ内に`docs/`がマウントされていないため、ホストから直接実行する
5. **Makefileターゲットと対応するnpm scriptsを同期する場合**: 同じ機能を提供するMakefileターゲットとnpm scriptsが存在する場合（例: `make lintmd` と `npm run lint:md`、`make checklinks` と `npm run check:links`）、以下を必ず確認すること
   - ターゲットディレクトリ（対象ファイル範囲）が一致していること
   - 設定ファイルの参照（例: `-c .markdown-link-check.json`）が一致していること
   - コマンドオプション（例: `-q`、`--fix`）が一致していること
   - 変更時は両方を同時に更新し、CLAUDE.mdのドキュメントも更新すること

## オブジェクト指向ルール（ThoughtWorksアンソロジー）

9つのルールのうち、下記3つは必ず遵守すること：

1. **1つのメソッドにつきインデントは2段階までにすること**
  - 原典では1段階までとなっているが、makeプロジェクトでは2段階まで許容する
2. **else句を使用しないこと**
  - → early returnパターンを使用すること
5. **名前を省略しないこと**