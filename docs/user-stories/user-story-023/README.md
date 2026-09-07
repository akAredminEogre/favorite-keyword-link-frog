---
codd:
  node_id: "req:user-stories-user-story-023-readme"
  type: requirement
---

# user-story-023: Branded Type 移行 Stage 2〜4

## 背景

本 user-story は Stage 0 + Stage 1（PR #394 で着手）の後続タスク群をまとめるもの。
PR #394 は closed（未マージ）となり、その成果は置き換えPR #405 が引き継いでいる。

## 前提

Stage 0/1 の成果 = `RuleId` パイロット実装 + type-fest/zod 依存導入 + `docs/coding-standards/enterprise-business-rules/branded-types.md` 策定完了。
これらは PR #394 で着手されたが、同PRは closed（未マージ）となり、置き換えPR #405 が取り込み済み（本ブランチに存在）。

## スコープ

### Stage 2: Entity ID 横展開

`TabId` / `RequestId` 等の Branded 化。

### Stage 3: 境界層 zod.brand 導入

入力検証の自動化。

### Stage 4: ESLint 強制ルール導入

4a 命名規則 / 4b 既存ルール流用 / 4c custom rule。

## 完了定義

別途策定。

## 関連PR

\#394（起点PR・closed／未マージ）、\#405（置き換えPR）

## 詳細本文

別途策定（Stage 0/1 を取り込んだ置き換えPR #405 以降の user-story-023 内容充填PRにて執筆予定）。
