---
codd:
  node_id: "governance:coding-standards-src-application-business-rules-interactors"
  type: governance
---

# Interactor 実装規約

Interactor（UseCase実装）のコーディング規約。

---

## 0. UseCaseインターフェースの実装

### 規約

`application-business-rules/interactors/` 直下の `*Interactor` クラスは、必ず対応する `I*UseCase` インターフェースを `implements` しなければならない。

### 理由

- Clean Architecture における Interactor は UseCase Input Port の実装であるため、インターフェース（`I*UseCase`）を明示的に implements することで依存の方向を保証する
- Controller は具象クラスではなくインターフェース型に依存し、テスト時のモック差し替えを容易にする

### 実装パターン

```typescript
// ports/input/IFooUseCase.ts
export interface IFooUseCase {
  execute(inputData: FooInputData): Promise<void>;
}

// interactors/FooInteractor.ts
import { IFooUseCase } from 'src/application-business-rules/ports/input/IFooUseCase';

export class FooInteractor implements IFooUseCase {
  async execute(inputData: FooInputData): Promise<void> {
    // ...
  }
}
```

### ESLintルール

`host-frontend-root/frontend-src-root/eslint-rules/clean-architecture/application-business-rules/use-cases.js` が export する `useCaseRestrictedSyntax`（`no-restricted-syntax` セレクタ配列）の第2セレクタ
`ClassDeclaration[id.name=/Interactor$/]:not(:has(TSClassImplements[expression.name=/^I[A-Za-z0-9]*UseCase$/]))`
にて「`*Interactor` が `I*UseCase` を implements していないこと」を error 検出する。

**適用経路**: `useCaseRestrictedSyntax` は `eslint-rules/object-oriented-nine-rules/main.js` に import され、`INTERACTORS_GLOB` 向けの `no-restricted-syntax` 設定（`noRestrictedSyntaxInteractorsSrc` / `noRestrictedSyntaxInteractorsTests`）へ他の OO9 セレクタと共に集約される。集約している理由は、ESLint flat config が同一ルールキー（`no-restricted-syntax`）を最後にマッチした設定で全上書きするため。`eslint.config.js` は `...cleanArchitecture` の後に `...objectOrientedNineRules` を spread する順序ゆえ、use-cases.js 側で単独に `no-restricted-syntax` を定義すると OO9 側に握り潰される。そのため use-cases.js は本 `useCaseConfig` では `no-restricted-syntax` を宣言せず、セレクタ配列を OO9 main.js へ集約している。

---

## 1. 部分的成功パターン

### 概要

複数の操作を順次実行し、後続操作の失敗が前の操作の成功を無効にしない場合の実装パターン。

### 典型的なユースケース

- DB更新成功 → タブリロード失敗
- ルール削除成功 → タブリロード失敗

### 実装パターン

```typescript
async execute(inputData: InputData): Promise<void> {
  try {
    // 1. 主要操作（DB操作など）
    await this.repository.update(entity);

    // 2. 成功通知（UIを更新）
    // 重要: 副次操作の前に呼び出すことで、部分的成功時もUIが更新される
    const outputData = new OutputData(entity);
    this.presenter.present(outputData);

    // 3. 副次操作（タブリロードなど）
    // この操作が失敗しても、主要操作は成功している
    await this.tabsGateway.reloadMatchingTabs(entity);
  } catch (error) {
    // 4. エラー通知
    // 副次操作で失敗した場合、presentは既に呼ばれているため、
    // UIは更新済み + エラー通知も表示される
    const errorData = new ErrorOutputData(inputData.id, error);
    this.presenter.presentError(errorData);
  }
}
```

### 呼び出し順序の意図

| 順序 | 操作 | 失敗時の状態 |
|------|------|-------------|
| 1 | 主要操作（DB） | presentもpresentErrorも未呼び出し → catchでpresentError |
| 2 | presenter.present() | UIは更新済み |
| 3 | 副次操作（タブリロード） | presentは呼び出し済み → catchでpresentError → **両方呼ばれる** |

### コードコメントの要求

部分的成功パターンを使用する場合、以下のコメントを必ず記載すること：

```typescript
// 部分的成功パターン: 副次操作（タブリロード）の前にpresentを呼び出すことで、
// 副次操作が失敗しても主要操作の成功をUIに反映する
this.presenter.present(outputData);
await this.tabsGateway.reloadMatchingTabs(rule);
```

### 禁止事項

- presentを副次操作の後に呼び出すこと（部分的成功が実現できない）
- 部分的成功パターンを使用する際にコメントを省略すること

### テスト要件

部分的成功パターンのテストでは、以下を必ず検証すること：

1. **呼び出し回数**: `present`と`presentError`が両方1回ずつ呼ばれること
2. **呼び出し順序**: `present`が`presentError`より**先に**呼ばれること

順序検証のコード例：
```typescript
// invocationCallOrderを使用して呼び出し順序を検証
const presentOrder = (mockPresenter.present as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
const presentErrorOrder = (mockPresenter.presentError as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
expect(presentOrder).toBeLessThan(presentErrorOrder);
```

**重要**: 順序検証を省略すると、部分的成功パターンの正しい動作が保証されない。

### 適用例

- `ToggleRuleActiveInteractor.execute()` - ルール更新 → present → タブリロード
- `DeleteRuleInteractor.execute()` - ルール削除 → present → タブリロード

---

## 2. エラーハンドリングパターン

### 標準パターン

```typescript
async execute(inputData: InputData): Promise<void> {
  try {
    // 処理
  } catch (error) {
    const errorData = new ErrorOutputData(inputData.id, error);
    this.presenter.presentError(errorData);
  }
}
```

### 規約

- Interactor内で例外をスローしない（Presenterにエラーを通知する）
- ErrorOutputDataにはruleIdとエラーメッセージを含める
- エラーメッセージは`error instanceof Error ? error.message : String(error)`で取得

---

## 3. 依存関係の注入

### コンストラクタパターン

```typescript
constructor(
  private readonly repository: IRewriteRuleRepository,
  private readonly tabsGateway: ITabsGateway,
  private readonly presenter: IPresenter
) {}
```

### 規約

- すべての依存関係は`private readonly`で宣言
- インターフェース型を使用（具象クラスに依存しない）
- Presenterは最後のパラメータとして配置
