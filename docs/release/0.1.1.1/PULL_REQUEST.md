---
codd:
  node_id: "plan:release-0-1-1-1-pull-request"
  type: plan
---

# RELEASE-0.1.1.1 PULL REQUEST

## タイトル
Chrome Web Store審査拒否対応：未使用scripting権限削除とバージョン管理改善

## 概要と理由
Chrome Web Storeの審査で「scripting権限を使用していない」という理由で拒否されました。違反参照ID: Purple Potassiumへの対応として、未使用権限の削除とバージョン管理システムの改善を実施しました。

## 主な変更点

### 権限の最適化
- `wxt.config.ts`: 未使用のscripting権限をpermissions配列から削除
- 権限を`['contextMenus', 'storage', 'tabs', 'scripting']`から`['contextMenus', 'storage', 'tabs']`に変更
- 他の権限（contextMenus, storage, tabs）の使用状況を確認し、実際に使用中であることを検証

### ドキュメント整理
- `docs/chrome-store/permission_explanation.md`: 不要なscripting権限説明を削除

## テスト方法
[動作確認の手順]
- `make testcheck` で回帰テスト通過を確認
  - 既存自動テストとlinterを同時に確認
- Unit tests: 227件すべて通過
- E2E tests: 12件すべて通過  
- Chrome拡張機能の基本機能（コンテキストメニュー、ストレージ、タブ操作）が正常動作することを確認

## 補足
[追加の文脈や注意点]
- Chrome Web Storeの最小権限原則に準拠し、実際に使用している権限のみに限定

## 本スコープの対象外となったタスク
- Chrome Web Storeへの再申請（技術的修正完了後の手動作業）

<!-- ユーザーが使うコマンド frog-frame-front/.clinerules/02-workflow-automation/04-pull-request/02-submit-pull-request.md -->
<!-- ユーザーが使うコマンド frog-frame-front/.clinerules/02-workflow-automation/04-pull-request/03-merge-pull-request.md -->