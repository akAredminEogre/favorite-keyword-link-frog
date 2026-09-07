---
codd:
  node_id: "design:design-src-frameworks-and-drivers-persistence-dexierewriterulerepository-delete"
  type: design
---

# DexieRewriteRuleRepository.delete() テスト戦略

## 目的

指定されたIDのRewriteRuleをIndexedDBから物理削除する。

## テスト分類

### 1. 正常系（状態変更）

単一ルール削除と複数ルール環境での削除を検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 単一削除 | 指定されたIDのルールがDBから削除される | 基本的な物理削除の確認 |
| 複数ルール環境 | 複数ルールがある場合、指定したルールのみ削除される | 他ルールへの影響がないことを確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. 副作用の範囲

削除対象以外のルールが影響を受けないことを検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 他ルール維持 | 削除後、他のルールが全て保持されている | データ整合性の保証 |
| プロパティ維持 | 残ったルールの各プロパティが変更されていない | 意図しない副作用の防止 |

**対応テスト**: `normal-cases.test.ts`

### 3. 異常系

存在しないIDでの削除を検証する。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 存在しないID | 存在しないIDを指定しても例外がスローされない | Dexie.jsのdelete()は存在しないキーでも例外をスローしない（冪等性） |
| 空DB | DBが空の状態で削除しても例外がスローされない | エッジケースでの動作確認 |

**対応テスト**: `Abend/error-cases.test.ts`

## 網羅性チェック

- [x] 単一ルール削除
- [x] 複数ルール環境での削除
- [x] 他ルールへの副作用なし確認
- [x] 存在しないIDでの削除（冪等性）
- [ ] 境界値テスト → 不要（IDはnumber型で特別な境界はない）
- [ ] 不正な型のID → 不要（TypeScriptの型システムで制約）

## テストファイル構成

```text
tests/unit/frameworks-and-drivers/persistence/DexieRewriteRuleRepository/delete/
├── normal-cases.test.ts       # 正常系: 単一削除、複数ルール環境での削除
└── Abend/
    └── error-cases.test.ts    # 異常系: 存在しないID、空DB
```

## モック戦略

モックは使用しない。

### 理由

DexieRewriteRuleRepositoryはIndexedDBへの直接アクセスを行うインフラストラクチャ層のクラスである。
テスト環境では`fake-indexeddb`を使用してインメモリDBでテストを実行する。
これにより、実際のDB操作を検証できる。

### テスト環境セットアップ

```text
tests/unit/infrastructure/persistence/indexeddb/setup.ts
```

既存のセットアップファイルをインポートして使用する。
