---
codd:
  node_id: "test:user-stories-user-story-015-acceptance-criteria"
  type: test
---

# 受け入れ条件

## ユーザーストーリー要件

- [ ] AC-1: ルール一覧画面にエクスポートボタンが表示される
- [ ] AC-2: エクスポートボタンをクリックすると全ルールをJSON形式でダウンロードできる
- [ ] AC-3: ダウンロードされるファイル名は `frog-frame-front-rules-YYYYMMDD_hhmmss.json` 形式である（ローカルタイム）
- [ ] AC-4: ダウンロードされるJSONファイルに `version`, `exportedAt`, `rules` が含まれる
- [ ] AC-5: ルールが0件の場合、エクスポートボタンが無効化される
- [ ] AC-6: エクスポート処理中は重複してエクスポートを実行できない
- [ ] AC-7: ルール取得失敗時またはダウンロード失敗時にトースト通知でユーザーに通知される

## 技術要件

- [ ] AC-8: Clean Architectureの層構造が遵守されている（コードレビューで検証）
- [ ] AC-9: エクスポートするJSONにはIDを含むルールの全属性が含まれる（将来のインポート機能との互換性）
- [ ] AC-10: `exportedAt` はISO 8601形式（ローカルタイム＋タイムゾーンオフセット）で記録される
