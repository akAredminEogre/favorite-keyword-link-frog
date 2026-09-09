---
codd:
  node_id: "governance:adr-005-factory-pattern-for-react-callback-injection"
  type: governance
---

# ADR-005: ReactコールバックをPresenterに注入するためのFactoryパターン採用

## ステータス

採用

## コンテキスト

Clean Architecture + Presenterパターン（ADR-001）では、Presenterが処理結果をViewに通知する。ReactコンポーネントをViewとして使用する場合、Presenterは `useState` から得られる状態更新関数（`setState`）を呼び出す必要がある。

しかし、以下の制約がある：

1. **DIコンテナのライフサイクル**: アプリ起動時に依存関係を解決する
2. **Reactの状態関数のライフサイクル**: コンポーネントのレンダリング時に生成される

この時間差により、DIコンテナだけではReactの状態更新関数をPresenterに注入できない。

### 検討した代替案

1. **状態変更のたびにDIコンテナで依存解決する方式**
   - 毎回 `container.register()` でコールバックを登録し、`container.resolve()` でControllerを取得
   - 問題点:
     - グローバルなDIコンテナの状態を変更するため、他コンポーネントに影響する可能性
     - 毎回resolve/スコープ生成のパフォーマンスオーバーヘッド
     - コンポーネントがDIコンテナのAPIを直接知る必要がある（関心の分離の違反）
     - React Strictモードでの2回レンダリングによる予期しない動作の可能性

## 決定

### Factoryパターンによる2段階の依存性注入

1. **起動時（DIコンテナ）**: Repository, Gateway など技術的依存をFactoryに注入
2. **レンダリング時（Factory.create）**: Reactコールバック（成功/エラー時の状態更新関数）をPresenterに注入

```text
DIコンテナ（起動時）          Reactコンポーネント（レンダリング時）
       │                              │
       ▼                              ▼
 ┌─────────────────┐           ┌──────────────┐
 │ Factory         │           │ setState     │
 │ (repository,    │◄──────────│ callbacks    │
 │  tabsGateway)   │           └──────────────┘
 └────────┬────────┘
          │ create(onSuccess, onError)
          ▼
 ┌─────────────────┐
 │ Controller      │
 │ + Presenter     │
 │ + Interactor    │
 └─────────────────┘
```

### Factoryの責務

- DIコンテナから受け取った依存（Repository, Gateway）を保持
- `create()` 呼び出し時にコールバックを受け取り、Presenter/Interactor/Controllerを生成
- 生成したControllerを返却

### Presenterの責務

- UseCaseの出力データをViewが使える形に変換（値の調整）
- 成功/失敗に応じて適切なコールバックを呼び出す（出力先の選択）

### コンポーネント側のメリット

- `try-catch` による成功/失敗の分岐が不要
- DIコンテナのAPIを直接知る必要がない
- Controllerのメソッドを呼ぶだけで、結果は自動的にコールバック経由で通知される

## 理由

1. **関心の分離**: Factoryが「DIの世界」と「Reactの世界」の境界を明確に分離する
2. **テスト容易性**: Factory自体はDIコンテナでモック可能、コールバックも任意の関数を渡せる
3. **React Strictモードとの互換性**: グローバルなDIコンテナ状態を変更しないため、2回レンダリングでも安全
4. **シンプルさ**: コンポーネントはFactoryの `create()` を呼ぶだけでよい

### トレードオフ

- Presenter/Interactor/ControllerはDIコンテナの恩恵（自動解決、ライフサイクル管理）を受けられない
- Factory内で毎回 `new` するため、これらのオブジェクトはリクエストごとに新規生成される

このトレードオフは、Reactとの統合のしやすさを優先した妥協点として許容する。

## 影響ドキュメント

このADRが変更された場合、以下のドキュメントも更新が必要：

- [001-clean-architecture-with-presenter-pattern.md](001-clean-architecture-with-presenter-pattern.md)

## 関連ドキュメント

- [ADR-001: Clean Architecture Presenter付きパターン採用](001-clean-architecture-with-presenter-pattern.md)
