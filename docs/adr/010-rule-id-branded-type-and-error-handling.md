---
codd:
  node_id: "governance:adr-010-rule-id-branded-type-and-error-handling"
  type: governance
---

# ADR-010: RuleId Branded Type 化と InvalidRuleIdError 導入

## ステータス

承認済み（PR #394 で決定・本ADRは事後整理）。

> **現行PR**: PR #394 は git 履歴整流（filter-repo による SHA 変更）のため close され、内容同一の後継 **PR #405**（`feat/rule-json-import`）が現行PRとして本ADRを継承する。以降の `#394` 参照は決定経緯の履歴であり、本PRでの取り込みは #405 を指す。

## コンテキスト

`enterprise-business-rules/` 層の Entity ID（`RewriteRule.id` 等）は long く `number` 直渡しで運用されてきた。`number` 同士であれば型システム上どの ID も同一視されるため、`RuleId` と `TabId` のように意味が異なる ID 同士を取り違えても、コンパイルでは検出できない。

加えて、PR #394 の作業中に `host-frontend-root/frontend-src-root/src/enterprise-business-rules/value-objects/ImportRulesCollection.ts:45` で以下の TS2345 が表面化した（PR #394 inline comment [`r3056266522`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3056266522)）。

```text
src/enterprise-business-rules/value-objects/ImportRulesCollection.ts(45,9): error TS2345:
Argument of type 'unknown' is not assignable to parameter of type 'number'.
```

問題は二段構えだった。

1. `ImportRulesCollection` は外部入力 JSON を `unknown` のまま保持し、`raw.id`（`unknown`）を `RewriteRule.fromParams()` に渡していた。`fromParams` の引数型は `number` であったため、Clean Architecture の「どの層が `unknown → number` 変換責務を持つか」の宣言が暗黙のままだった。
2. RuleId 不正値（負数・非整数・非 number）が混入した際に、素の `Error` で例外を投げると、`ImportRulesJsonErrorOutputData.fromError` の strategies Map が当該エラーを `'validation'` として分類できず、上位ユースケースのエラー UI が「不明エラー（storage 扱い）」に倒れる懸念があった（PR #394 inline comment [`r3113329381`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3113329381)）。

これら 2 点を一括で解消するため、`RuleId` を Branded Type 化し、検証 factory と専用カスタムエラー（`InvalidRuleIdError`）を新設する方針を採った。

## 決定

### 1. RuleId を Branded Type として定義

`type-fest` の `Opaque` を用いて `RuleId = Opaque<number, 'RuleId'>` と宣言し、生 `number` からの暗黙的な代入をコンパイル時に弾く。

```typescript
// src/enterprise-business-rules/value-objects/ids/RuleId.ts
export type RuleId = Opaque<number, 'RuleId'>;

export const createRuleId = (raw: unknown): RuleId => {
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0) {
    throw new InvalidRuleIdError(raw);
  }
  return raw as RuleId;
};
```

> **更新（PR#405 Copilotレビュー対応）**: 上記は当ADR決定時点のコード。以後、実装は次の2点で更新済み。
> - `type-fest` 5.x で `Opaque` が非推奨（`Tagged` への別名）となったため、現行実装は `RuleId = Tagged<number, 'RuleId'>` を用いる。
> - 整数判定を `Number.isInteger` から `Number.isSafeInteger` へ変更（安全整数範囲外IDは `JSON.parse` で丸められID同一性が壊れるため拒否）。
> 現行の正は `src/enterprise-business-rules/value-objects/ids/RuleId.ts` を参照。

- factory `createRuleId(raw: unknown): RuleId` を `RuleId` を生む唯一の窓口とし、境界検証（型・整数性・非負）を集約する。
- `as RuleId` キャストは factory 内部・テスト fixture ヘルパ・DTO↔Entity 境界マッパー・repository 内部に限定する（規約は [`docs/coding-standards/enterprise-business-rules/branded-types.md`](../coding-standards/enterprise-business-rules/branded-types.md) で詳述）。

### 2. InvalidRuleIdError を新設

`createRuleId` の検証失敗時に投げる例外を、汎用 `Error` ではなく専用クラス `InvalidRuleIdError` に限定する。

```typescript
// src/enterprise-business-rules/errors/InvalidRuleIdError.ts
export class InvalidRuleIdError extends Error {
  constructor(raw: unknown) {
    super(`Invalid RuleId: ${String(raw)}`);
    this.name = 'InvalidRuleIdError';
  }
}
```

- メッセージ仕様（`Invalid RuleId: <raw>`）は既存 `createRuleId` 文言を保持し、ログ / 監視側の文字列マッチを温存する。
- エラー本体は `enterprise-business-rules/errors/` 配下に置き、層責務に沿わせる（`value-objects/` に置かない）。

### 3. ImportRulesJsonErrorOutputData strategies に登録

DTO 層のエラー分類戦略マップに `InvalidRuleIdError → 'validation'` を追加し、上位の Output 表現が `parse` / `validation` / `storage` のいずれに倒れるかを明示する。

```typescript
// src/application-business-rules/dto/output/ImportRulesJsonErrorOutputData.ts
private static readonly strategies: Map<Function, ErrorHandler> = (() => {
  const validationPassthrough: ErrorHandler = (error) =>
    new ImportRulesJsonErrorOutputData(error, 'validation');

  return new Map<Function, ErrorHandler>([
    // ...既存登録省略...
    [InvalidRuleIdError, validationPassthrough],
  ]);
})();
```

これにより、`ImportRulesCollection` 内で `RuleId` 不正値が混入しても、UI 側で `errorType === 'validation'` として一貫したメッセージ提示が可能となる。

### 4. ID 検証責務は fromParams（Entity 内部）に委譲

`ImportRulesCollection` は外部入力を `unknown` のまま `RewriteRule.fromParams` に渡すだけとし、`createRuleId` 呼び出しは `fromParams` 内部で行う。これにより:

- Value Object（`ImportRulesCollection`）は集合の責務（0 件 / 件数上限）に専念する。
- ID の型変換 / 検証は Entity ファクトリ（`fromParams`）内部の自己完結ロジックとなる。
- DTO や application 層から `RewriteRule` を組み立てるその他経路でも、検証が抜け落ちない。

なお、本 PR 内の追従コミット（`d74cef32` / `11bf3ee3` 等）で `oldString` 等のフィールドバリデーションも同様に `fromParams` 委譲で揃えた。

### 5. Branded 化の段階的展開

- 本 PR（Stage 0 + Stage 1）: `RuleId` のみ。`type-fest` / `zod` 依存導入・規約文書策定・パイロット実装。
- Stage 2 以降は別 PR（[`docs/user-stories/user-story-023`](../user-stories/user-story-023/README.md)）で `TabId` / `RequestId` 等へ横展開する。
- ESLint 自動強制は Stage 4 で導入予定（暫定はコードレビュー＋規約文書参照）。

### 6. Branded 型対応のコード伝播範囲

`RewriteRule` constructor の `id` 引数型が `number` から `RuleId` へ変わるため、生 `number` を直接渡していた箇所すべてを `createRuleId(N)` factory 経由に統一する必要が生じた（殿御回答 2026-05-01・A 案採用）。

| ファイル                                                             | 種別           | 修正方針                            |
| -------------------------------------------------------------------- | -------------- | ----------------------------------- |
| `src/frameworks-and-drivers/persistence/DexieRewriteRuleRepository.ts` (L158) | production     | `createRuleId(N)` 経由でラップ      |
| `src/interface-adapters/mappers/RewriteRuleMapper.ts` (L33)          | production     | `createRuleId(N)` 経由でラップ      |
| `src/components/organisms/RulesTable/RulesTable.stories.tsx`         | Storybook      | 19 箇所一括 `createRuleId(N)` 化    |
| `src/frameworks-and-drivers/ui/components/molecules/RuleTableRow/RuleTableRow.stories.tsx` | Storybook | 9 箇所一括 `createRuleId(N)` 化     |

production / Storybook 4 ファイル一括修正で `compile` / `test:unit` (558/558 PASS, SKIP=0) / `lint` を完全 PASS とし、PR をマージ可能状態に戻した（commit `d457696d`）。

### 7. 規約文書の配置

Branded Type 規約文書は層別ディレクトリ `docs/coding-standards/enterprise-business-rules/` に置く（殿御提案 2026-05-01・PR #394 inline comment [`r3172906573`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3172906573) 採用）。

- 旧: `docs/coding-standards/branded-types.md`
- 新: [`docs/coding-standards/enterprise-business-rules/branded-types.md`](../coding-standards/enterprise-business-rules/branded-types.md)

`enterprise-business-rules/` 層を主対象とすることを path で示す。Stage 2 以降に他層対応規約が増えた場合も、層別ディレクトリ構造で並列に追加できる。

## 影響

### Entity 内部

- `RewriteRule` / `fromParams` が `RuleId` を内部表現として扱うようになり、生 `number` との誤代入はコンパイルで弾かれる。
- 検証ロジック（型・整数性・非負）は `createRuleId` の 1 箇所に集約される。

### DTO / application 層

- `InvalidRuleIdError` が `'validation'` 系として一貫して扱われる。
- 既存の `EmptyRulesCollectionError` / `RulesCollectionCountExceededError` 等のパターンに揃う。

### テスト

- 新規 fixture は `createRuleId(42)` 経由を推奨。既存 `{ id: 42 }` 直接渡しは Stage 2 以降で段階移行する。
- `createRuleId` 単体テストは `Number.isInteger` / `NaN` / `Infinity` を含む失敗ケースを array-based-test で網羅する（`tests/unit/.../createRuleId/`）。

### Storybook / production 既存コード

- `RewriteRule` を直接インスタンス化していた箇所は `createRuleId(N)` factory 経由に書き換える必要がある（本 PR 内で 4 ファイル一括対応済）。

### 規約 / 移行

- Branded 型の追加は `docs/coding-standards/enterprise-business-rules/branded-types.md` の規約に従う。
- 新規 `*Id` 型・`create*Id` factory・`Invalid*IdError` を 1 セットで導入する想定。
- Stage 2〜4 のロードマップは `docs/user-stories/user-story-023/README.md` で管理する。

## 関連リンク

- 現行PR: [frog-frame-front PR #405](https://github.com/akAredminEogre/frog-frame-front/pull/405)（`feat/rule-json-import`・本ADRを取り込む現行PR）
- 旧PR（決定経緯）: [frog-frame-front PR #394](https://github.com/akAredminEogre/frog-frame-front/pull/394)（git 履歴整流のため close・#405 へ継承）
- 規約文書: [`docs/coding-standards/enterprise-business-rules/branded-types.md`](../coding-standards/enterprise-business-rules/branded-types.md)
- 後続 user-story: [`docs/user-stories/user-story-023/README.md`](../user-stories/user-story-023/README.md)
- 主要 inline review threads:
  - [`r3056266522`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3056266522): TS2345 と層責務の議論（`ImportRulesCollection.ts:45`）
  - [`r3113329381`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3113329381): カスタムエラー化の必要性（`RuleId.ts:7`）
  - [`r3172906573`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3172906573): 規約文書の層別ディレクトリ配置
  - [`r3172910284`](https://github.com/akAredminEogre/frog-frame-front/pull/394#discussion_r3172910284): 本 ADR 作成依頼
