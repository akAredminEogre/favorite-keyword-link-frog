---
codd:
  node_id: "governance:coding-standards-tests-e2e-helper-organization-index"
  type: governance
---

# ヘルパー配置ルール

E2Eテストの共通定数・ヘルパー関数の配置ルール。

## 目次

| ファイル | 内容 |
|---------|------|
| [placement-conditions.md](./placement-conditions.md) | 2層構造（グローバル/機能固有）、配置判断基準 |
| [placement-procedures.md](./placement-procedures.md) | 確認手順、グローバル共通定数・ヘルパー一覧、機能固有構成例 |
| [error-handling.md](./error-handling.md) | インデックス指定ヘルパーの範囲チェック、エラー処理の一貫性 |
| [logic-delegation.md](./logic-delegation.md) | 探索ロジックの集約、exists系→index系への委譲 |
| [loop-optimization.md](./loop-optimization.md) | ループ内DOMアクセスの最適化、ヘルパー呼び出しのインライン化 |

## 概要

E2Eテストのヘルパー・定数は以下の観点でルールに従うこと：

1. **配置**: グローバル共通と機能固有の2層構造で管理
2. **エラー処理**: 同一モジュール内で一貫したパターンを使用
3. **ロジック集約**: 探索ロジックの重複を避け、基本関数に委譲
4. **ループ最適化**: ループ内のDOMアクセスを最小化
