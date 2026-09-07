---
codd:
  node_id: "design:design-src-enterprise-business-rules-value-objects-ids-ruleid-createruleid"
  type: design
---

# createRuleId() テスト戦略

## 目的

値オブジェクト `RuleId`（`Tagged<number, 'RuleId'>`）のスマートコンストラクタ。
`unknown` 型の入力を検証し、「**0 以上の安全整数**」のみを `RuleId` として返し、それ以外は `Error('Invalid RuleId: <raw>')` をスローする。

**責務範囲**:
- 入力が `number` 型であること
- `Number.isSafeInteger` が真であること（安全整数範囲 ±(2^53−1) 外は `JSON.parse` で丸められ元IDを保持できないため拒否）
- 値が 0 以上であること（`raw < 0` を拒否）

これにより、`RuleId` を受け取る上流レイヤー（Interactor / UseCase / Repository）では型レベルで整数性・非負性を保証できる。

## テスト分類

### 1. 正常系（同値分割：0 と正の整数）

`RuleId` の定義域（0 以上の整数）で代表値を網羅する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 正の整数（代表値） | `createRuleId(42)` → `42` | 一般的な有効値。数値がそのまま `RuleId` として返ることを検証 |
| 境界値（下限） | `createRuleId(0)` → `0` | `raw < 0` 判定の等号側境界。`0` は有効・falsy値であるため専用ケースが必要 |

**対応テスト**: `createRuleId/normal-cases.test.ts`

### 2. 異常系（境界値・同値分割：負数）

`raw < 0` 条件を発火させる代表値をテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 境界値（下限を下回る） | `createRuleId(-1)` → `throw 'Invalid RuleId: -1'` | 負数拒否。`0` との境界直下を選択することで比較演算子（`<` vs `<=`）のオフバイワン誤りを検出可能 |

**対応テスト**: `createRuleId/Abend/negative-validation.test.ts`

### 3. 異常系（型チェック：non-number）

`RuleId.ts` は `typeof raw !== 'number'` を最初のゲートとしている。`unknown` 入力に対する型判定の網羅。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 文字列 | `createRuleId('abc')` → `throw 'Invalid RuleId: abc'` | 典型的な誤代入。JSONインポート等で数値文字列が混入するユースケースに対するガード |
| `null` | `createRuleId(null)` → `throw 'Invalid RuleId: null'` | 欠損値。`typeof null === 'object'` のJavaScript仕様に対する明示的拒否 |
| `undefined` | `createRuleId(undefined)` → `throw 'Invalid RuleId: undefined'` | 未定義入力。オプショナルプロパティ経由での混入に対するガード |

**対応テスト**: `createRuleId/Abend/type-validation.test.ts`（文字列）、`createRuleId/Abend/null-undefined-validation.test.ts`（null・undefined）

### 4. 異常系（Number.isSafeInteger違反：小数・NaN・Infinity・安全整数範囲外）

`RuleId.ts` の `!Number.isSafeInteger(raw)` 条件を発火させる代表値をテストする。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 小数 | `createRuleId(1.5)` → `throw 'Invalid RuleId: 1.5'` | `Number.isSafeInteger(1.5) === false`。型は `number` だが整数性違反を単体検証 |
| `NaN` | `createRuleId(NaN)` → `throw 'Invalid RuleId: NaN'` | `Number.isSafeInteger(NaN) === false`。数値演算失敗値の拒否を明示 |
| `Infinity` | `createRuleId(Infinity)` → `throw 'Invalid RuleId: Infinity'` | `Number.isSafeInteger(Infinity) === false`。無限大の拒否を明示 |
| 安全整数範囲外 | `createRuleId(Number.MAX_SAFE_INTEGER + 2)` → `throw 'Invalid RuleId: <値>'` | `Number.isSafeInteger(MAX_SAFE_INTEGER + 2) === false`。安全整数範囲外は `JSON.parse` で丸められ元IDを保持できず、リストア時のID同一性が壊れるため拒否 |

**対応テスト**: `createRuleId/Abend/integer-validation.test.ts`（4ケース：小数・NaN・Infinity・安全整数範囲外）

## 網羅性チェック

- [x] 正の整数で成功（代表値）
- [x] `0` で成功（境界値・下限）
- [x] 負数で失敗（境界値・下限の直下）
- [x] 文字列で失敗（型違反：非プリミティブ数値でない代表）
- [x] `null` で失敗（型違反：`typeof` が `'object'` となる仕様）
- [x] `undefined` で失敗（型違反：未定義）
- [x] エラーメッセージが仕様通り（`Invalid RuleId: <raw>` 形式）であること
- [x] `Number.isSafeInteger` 違反（小数 `1.5` 等） → `createRuleId(1.5)` → `throw 'Invalid RuleId: 1.5'`
  - **根拠**: `RuleId.ts` の `!Number.isSafeInteger(raw)` 条件を単体検証。PR#394 レビュー対応で追加済み
- [x] `NaN` / `Infinity` での挙動 → `createRuleId(NaN)` → `throw 'Invalid RuleId: NaN'`, `createRuleId(Infinity)` → `throw 'Invalid RuleId: Infinity'`
  - **根拠**: `Number.isSafeInteger(NaN) === false`, `Number.isSafeInteger(Infinity) === false` により拒否されることをテストで検証済み（PR#394 レビュー対応で追加）
- [x] 安全整数範囲外（`Number.MAX_SAFE_INTEGER + 2`） → `createRuleId(Number.MAX_SAFE_INTEGER + 2)` → `throw 'Invalid RuleId: <値>'`
  - **根拠**: `Number.isSafeInteger(MAX_SAFE_INTEGER + 2) === false`。安全整数範囲外は `JSON.parse` で丸められ元IDを保持できず、リストア時のID同一性が壊れるため拒否。`integer-validation.test.ts` に4件目として追加済み
- [—] 型レベルの `Tagged` 検証（別の `Id` 型に代入できないこと） → **ランタイムテスト対象外**（TypeScript コンパイル時検証で保証されるため、本チェックリスト（単体テスト網羅）の範囲外。チェック不可項目として `[—]` で表記）
- [—] 可変性 → **ランタイムテスト対象外**（プリミティブ `number` のため本質的にイミュータブル。検証不要のためチェック不可項目として `[—]` で表記）

※ `[x]` の各項目（`Number.isSafeInteger` 違反・`NaN` / `Infinity`・安全整数範囲外）は PR#394 レビュー対応以降で単体テストを追加済み（`integer-validation.test.ts` は小数・NaN・Infinity・安全整数範囲外の4ケース）。`[—]` の 2 項目はランタイム検証の対象外（不要）であり、未対応の `[ ]` ではなく「対象外」を意味する `[—]` で明示する。

## テストファイル構成

```text
tests/unit/enterprise-business-rules/value-objects/ids/RuleId/createRuleId/
├── normal-cases.test.ts                   # 正常系（正の整数・0）
└── Abend/
    ├── type-validation.test.ts            # 型バリデーション（文字列）
    ├── null-undefined-validation.test.ts  # null/undefinedバリデーション
    ├── integer-validation.test.ts         # 整数バリデーション（小数・NaN・Infinity）
    └── negative-validation.test.ts        # 負数バリデーション
```

**ファイル配置の根拠**:
- `docs-rules/design/05-test-strategy.md:80-96` の「ディレクトリ構造原則」に準拠（1メソッドごとにサブディレクトリ・異常系は `Abend/` 分離）
- 各 `it` は独立した記述で1アサーション（OO9ルール準拠）
- 配列ベーステスト（`docs/coding-standards/tests/array-based-test.md`）に準拠:
  - Arrange/Act/Assert が同一な複数ケースを含むファイル（`normal-cases.test.ts` 2件・`Abend/null-undefined-validation.test.ts` 2件・`Abend/integer-validation.test.ts` 3件）は `interface TestCase` + `const testCases: TestCase[]` + `testCases.forEach` の配列ベース形式で記述（`input: { value: ... }`・`expected: { value/message: ... }` のオブジェクト形式を採用）
  - 単一ケースのみのファイル（`Abend/negative-validation.test.ts`・`Abend/type-validation.test.ts`）は配列化の適用条件（3件以上）に該当しないため個別 `it` を維持
  - 1ファイル1配列の原則（`array-based-test.md` 手順6）を遵守

## モック戦略

**モックは使用しない**。

| 依存関係 | モック理由 | モック対応 |
|----------|-----------|-----------|
| なし（純粋関数） | - | 不要 |

### 根拠

- `createRuleId` は `unknown` → `RuleId` の純粋関数。外部依存・副作用なし
- `type-fest` の `Tagged` 型はコンパイル時のみ存在し、ランタイム挙動に影響しない
- `beforeEach` / `afterEach` のライフサイクル管理不要（現テストコードでも未定義で妥当）

## JSDocとの一貫性（§8 / §7 チェック）

各テストファイル先頭にJSDocを配置（`jsdoc-rule.md` §8.2準拠）。

| ファイル | JSDoc内容 | 評価 |
|---------|----------|------|
| `normal-cases.test.ts` | 正の整数・0の正常生成（2ケース） | ✅ |
| `Abend/negative-validation.test.ts` | 負数エラー（1ケース） | ✅ |
| `Abend/type-validation.test.ts` | 文字列エラー（1ケース） | ✅ |
| `Abend/null-undefined-validation.test.ts` | null/undefinedエラー（2ケース） | ✅ |
| `Abend/integer-validation.test.ts` | 小数・NaN・Infinityエラー（3ケース） | ✅ |

| 観点 | 評価 |
|------|------|
| JSDoc 1行=1ケース | ✅ 遵守（`jsdoc-rule.md` §8.2） |
| JSDoc と `it()` 説明の一致 | ✅ 全9ケースで厳密一致（`test-strategy-consistency.md` §7.1） |
| テスト戦略書の「テスト分類」との対応 | ✅ 本仕様書の分類 1〜4（9ケース）と順番・名前一致（§7.2） |
| 抽象表現の回避 | ✅ 「正の整数」「0」「負数」「文字列」「null」「undefined」「小数」「NaN」「Infinity」は具体的検証内容 |

## 機能要件トレーサビリティ

**本仕様書はユニットテスト戦略書**のため、結合テスト戦略書向けの機能要件トレーサビリティ表（`05-test-strategy.md:125-175`）は不要。
`RuleId` 値オブジェクトは型レベルの不変条件を表現するためのものであり、特定機能要件ドキュメントとの対応関係はない（Clean Architecture Enterprise Business Rules 層の原始型）。

## 関連ドキュメント

- 実装: `host-frontend-root/frontend-src-root/src/enterprise-business-rules/value-objects/ids/RuleId.ts`
- テスト: `host-frontend-root/frontend-src-root/tests/unit/enterprise-business-rules/value-objects/ids/RuleId/createRuleId/`
- 上位規約: `docs-rules/design/05-test-strategy.md`
- 分岐型規約: `docs/coding-standards/enterprise-business-rules/branded-types.md`（`Tagged` 利用全般）
