---
codd:
  node_id: "governance:coding-standards-tests-array-based-test"
  type: governance
---

# 配列ベースのテスト

類似のテストケースは配列で管理し、専用ファイルに切り出す。
ユニットテスト、結合テスト、E2Eテストすべてに適用される。

## 適用シナリオ

1. **同じメソッドに対して入力値と期待値のペアが3つ以上ある場合**: 個別の`it`ブロックを繰り返すのではなく、テストケース配列にまとめて`forEach`で実行する。例えば、バリデーションメソッドに対して正常値・境界値・異常値をそれぞれテストする場合に採用する
2. **配列化を見送るべき場合**: テストケース間でArrange/Act/Assertの手順が異なる場合は、無理に配列化せず別ファイルに分割する。`forEach`内でif文が必要になったら、それはテストの構造が異なるサインであり、別ファイルに分けるべき

---

## 手順

1. 類似する複数の個別テストケースを特定
2. 配列形式でテストケースを定義
3. 新しい専用ファイルに切り出す
4. 元のファイルから該当テストケースを削除
5. 入力値は `input: { hoge: 'hoge' }`、期待値は `expected: { hoge: 'moge' }` のようにまとめる
6. **1ファイル1配列の原則**: 配列化テストのファイルには、配列化テスト以外のテストケースを同居させない
   - 配列化テストと非配列テストが混在するファイルは禁止
   - 1つのファイルに含められる配列化テストは1つまで
   - 配列化テストを導入した場合、既存の非配列テストは別ファイルに切り出すこと

---

## コード例（ユニットテスト）

```typescript
interface TestCase {
  description: string;
  input: { /* 入力値の型 */ };
  expected: { /* 期待値の型 */ };
}

const testCases: TestCase[] = [
  {
    description: 'ケース1の説明',
    input: { /* 入力値 */ },
    expected: { /* 期待値 */ },
  },
  {
    description: 'ケース2の説明',
    input: { /* 入力値 */ },
    expected: { /* 期待値 */ },
  },
];

testCases.forEach((testCase) => {
  it(testCase.description, async () => {
    // 統一されたテストロジック
  });
});
```

---

## コード例（E2Eテスト）

```typescript
interface ToggleTestCase {
  name: string;
  testDataId: string;
  initialState: boolean;
  expectedState: boolean;
}

const testCases: ToggleTestCase[] = [
  {
    name: '有効なルールを無効に切り替えられる',
    testDataId: 'A',
    initialState: true,
    expectedState: false,
  },
  {
    name: '無効なルールを有効に切り替えられる',
    testDataId: 'B',
    initialState: false,
    expectedState: true,
  },
];

testCases.forEach(({ name, testDataId, initialState, expectedState }) => {
  test(name, async ({ page, popupPage, rulesPage }) => {
    // 統一されたテストロジック
  });
});
```

---

## 利点

- 類似テストケースの一元管理
- 配列ベースによる保守性向上
- テストファイルの責務の明確化
- 新しいケース追加時の効率化

---

## 規約

- 下記の場合は無理な配列化は行わない
  - Actが異なる場合
  - 入力値/期待値の構造や型が異なる場合
  - その他 `testCases.forEach` の中でif文が必要になる場合
    - if文が必要ということはarrange/act/assertの手法が異なるので、テストファイルを分けること
- テスト用配列
  - inputについて
    - JSDocにかかれているテスト観点に関係のないinputの値は共通化し、forEach内で設定すること
- JSDoc
  - 配列化したテストケース群のJSDocは日本語で記述し、配列内の`description`または`name`は必ず一致させること

---

## テストケースの重複・冗長性回避

### 規約

1. **入力値の一意性**: 配列内で同じ入力値を持つテストケースを作成しないこと
   - 異なる観点をテストする場合でも、入力値が同じなら1つのテストケースに統合する
   - 複数の観点を1つのテストケースで検証することで、テストの意図が明確になる

2. **forEach外での重複禁止**: forEachループ内で既に検証しているアサーションを、別の独立したテストで重複させないこと
   - 全テストケースで共通して行う検証はforEach内に含める
   - 独立したテストが必要な場合は、forEachで検証していない観点に限定する

### 禁止事項

```typescript
// ❌ 同じ入力値で複数のテストケースを作成
const testCases = [
  { description: 'ケース1', inputId: 1, expectedDto: { id: 1 } },
  { description: 'ケース2', inputId: 999, expectedDto: { id: 999 } },
  { description: 'ケース3', inputId: 1, expectedDto: { id: 1 } }, // inputId: 1 が重複
];

// ❌ forEachで検証済みの内容を別テストで重複
testCases.forEach(({ inputId, expectedDto }) => {
  it('...', async () => {
    await mapper.delete(inputId);
    expect(mock.delete).toHaveBeenCalledWith(expectedDto);
    expect(mock.delete).toHaveBeenCalledTimes(1); // ここで検証済み
  });
});

it('呼び出し回数の検証', async () => {
  await mapper.delete(42);
  expect(mock.delete).toHaveBeenCalledTimes(1); // 上記と重複
});
```

### 許可事項

```typescript
// ✅ 各テストケースの入力値が一意
const testCases = [
  { description: 'ID=1: 最小IDで正しくDTOが構築される', inputId: 1, expectedDto: { id: 1 } },
  { description: 'ID=999: 大きなIDでも正しくDTOが構築される', inputId: 999, expectedDto: { id: 999 } },
];

// ✅ 共通の検証はforEach内に統合
testCases.forEach(({ description, inputId, expectedDto }) => {
  it(description, async () => {
    await mapper.delete(inputId);
    expect(mock.delete).toHaveBeenCalledWith(expectedDto);
    expect(mock.delete).toHaveBeenCalledTimes(1);
  });
});
```

### チェックポイント

テストケース配列を作成する際:
- [ ] 各テストケースの入力値が一意か?
- [ ] forEachループ外に、ループ内と重複する検証がないか?

---

## eslint-rule

ESLint化不可（配列ベースかどうかは静的解析で判定困難。PRレビューで確認）
