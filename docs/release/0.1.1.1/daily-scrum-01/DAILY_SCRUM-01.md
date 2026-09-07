---
codd:
  node_id: "plan:release-0-1-1-1-daily-scrum-01-daily-scrum-01"
  type: plan
---

# DAILY SCRUM-01回目
# DAILY SCRUM-作業計画
<!-- 作業計画は作業前のみ記入 -->

## 本スクラムの作業予定
Chrome Web Store審査拒否対応として、未使用のscripting権限をmanifest.jsonから削除する作業に取り組みます。

## 修正予定ファイル
- manifest.json（未使用のscripting権限を削除）
- 関連するTypeScript設定ファイル（必要に応じて）

## スクラム内残タスク
- [x] 現在のmanifest.jsonを確認し、scripting権限の使用状況を調査
- [x] scriptingキーワードでコードベース全体を検索し、実際の使用箇所を特定
- [x] manifest.jsonからscripting権限を削除
- [x] 削除後の動作確認とテスト実施
- [x] 他の権限についても使用状況を簡易確認

## 相談事項
<!-- workflow-01-create-daily-scrum-doc-after-coding.mdの場合は作成しない -->
<!-- 相談したいこと、質問したいこと、レビューしてほしいこと -->
<!-- について、体言止めでの相談ではなににどう答えればよいのか明確にならないので使わないでください-->
<!-- 相談は具体的な内容を記載してください。 -->
<!-- 質問は不明点を明確に記載してください。 -->
<!-- レビューしてほしいことは、レビュー対象を具体的に記載してください。 -->
<!-- また上記相談・質問・レビューのトピックが重複する場合は、まとめて記載してください。 -->
<!-- ユーザーが使うコマンド: frog-frame-front/.clinerules/02-workflow-automation/02-daily-scrum-starts/workflow-see-discussion-then-start-coding.md-->

## 一言コメント
Chrome Web Storeの審査拒否は想定外でしたが、権限の精査は良い機会です。しっかり対応していきます。

# DAILY SCRUM-01作業実績
## 本スクラムでの作業実績内容

Chrome Web Store審査拒否への対応を完了しました。

### 実施内容
1. **権限使用状況の調査**: wxt.config.tsでscripting権限を確認し、ソースコード全体でscriptingAPIの使用箇所を検索
2. **権限削除の実施**: wxt.config.tsからscripting権限を削除
3. **他の権限使用確認**: contextMenus、storage、tabsの使用状況を確認し、削除対象はscriptingのみと判断
4. **機能テスト実施**: 全テスト実行（Unit: 227件、E2E: 12件）で動作確認
5. **レビュー対応**: package.jsonバージョン0.1.1.1更新とversion.txt分離システム実装

## 修正したファイル
- host-frontend-root/frontend-src-root/wxt.config.ts（scripting権限削除）
- host-frontend-root/frontend-src-root/package.json（バージョン更新、npm script追加）
- host-frontend-root/frontend-src-root/version.txt（新規作成）
- host-frontend-root/frontend-src-root/scripts/update-version.cjs（新規作成）
- host-frontend-root/frontend-src-root/VERSION_MANAGEMENT.md（新規作成）