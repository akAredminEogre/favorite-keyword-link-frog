---
codd:
  node_id: "req:user-stories-user-story-021-readme"
  type: requirement
---

# User Story 021: ImportRulesJson - previewImport() id フィールドのバリデーション強化

## ストーリー

> ルールJSONインポート時に、各ルールの id フィールドが有効な非負整数であることを検証し、不正な値（負数・小数・NaN 等）が含まれていた場合は明確なエラーメッセージを表示してほしい

## 概要

`ImportRulesJsonInteractor.previewImport()` の L4 バリデーション（各ルールの必須フィールドチェック）において、
`id` フィールドの検証は `typeof ruleData.id === 'number'` のみに留まっている（line 130）。

この検証は以下のケースを見逃す：

| 問題ケース | 現在の挙動 |
|-----------|-----------|
| 負数 (`-1`) | `number` 型として通過し、`RewriteRule(-1, ...)` が生成される |
| 小数 (`1.5`) | `number` 型として通過し、`RewriteRule(1.5, ...)` が生成される |
| `NaN` | `typeof NaN === 'number'` が `true` のため通過する |
| `Infinity` | `typeof Infinity === 'number'` が `true` のため通過する |
| 同一 JSON 内の重複 id | 重複チェックがなく、複数ルールに同じ id が設定される |

将来フェーズ（US-020）で `createWithId()` によるID保持インポートを実装する際、
不正な id 値がリポジトリ層に渡るとデータ不整合の原因となる。
本ユーザーストーリーでは、ID保持インポート実装の前提として、id フィールドの厳密なバリデーションを追加する。

## 背景

本ストーリーを扱う現行PRは **PR#405**（git 履歴整流（filter-repo による SHA 変更）で close された旧 **PR#394** を内容同一で継承・置換）である。
その決定経緯となった旧 PR#394 レビュー（line 130: `typeof ruleData.id === 'number' ? ruleData.id : 0`）において、
CodeRabbit コメント（id: 2856697486）が「JSONの id を RewriteRule に設定しているが、
DexieRewriteRuleRepository.create() はIDを無視する」点を指摘した。

これを受けて `user-story-020`（ID保持リストア）が登録されたが、
id フィールドのバリデーション自体は別の関心事として本ユーザーストーリーで扱う。

**該当ファイル**:
- `host-frontend-root/frontend-src-root/src/application-business-rules/interactors/ImportRulesJsonInteractor.ts`（line 114〜138）

## 現状

### 現在の実装（id バリデーションが不十分）

```typescript
// ImportRulesJsonInteractor.ts line 128-137
rules.push(
  new RewriteRule(
    typeof ruleData.id === 'number' ? ruleData.id : 0,  // ← 不十分なバリデーション
    String(ruleData.oldString),
    String(ruleData.newString ?? ''),
    String(ruleData.urlPattern ?? ''),
    typeof ruleData.isRegex === 'boolean' ? ruleData.isRegex : false,
    typeof ruleData.isActive === 'boolean' ? ruleData.isActive : true
  )
);
```

### 課題

| 課題 | 詳細 |
|------|------|
| 不正な数値型を通過させる | `NaN`・`Infinity`・負数・小数が `typeof === 'number'` を通過する |
| 重複 id のチェックなし | 同一 JSON 内で複数ルールが同じ id を持つ場合に検出できない |
| US-020 との整合性 | `createWithId()` 実装後、不正 id がリポジトリに渡るリスクがある |
| エラーメッセージの不在 | 不正 id が渡された場合のユーザー向けエラーメッセージがない |

## 開発戦略

### Phase 1: id バリデーションロジックの追加

現在の `typeof ruleData.id === 'number' ? ruleData.id : 0` を以下のバリデーションに置き換える：

```typescript
// id は省略可（undefined/null → 0）、指定する場合は非負整数のみ許可
let ruleId = 0;
if (ruleData.id !== undefined && ruleData.id !== null) {
  if (
    typeof ruleData.id !== 'number' ||
    !Number.isInteger(ruleData.id) ||
    ruleData.id < 0
  ) {
    this.presenter.presentError(
      new ImportRulesJsonErrorOutputData(
        new Error('invalid field type'),
        'validation',
        `ルール #${i + 1}: id は 0 以上の整数である必要があります`
      )
    );
    return;
  }
  ruleId = ruleData.id;
}
```

### Phase 2: 重複 id の検出

JSON 内に同一の id（0 を除く）を持つルールが複数存在する場合にバリデーションエラーとして扱う：

```typescript
// previewImport() 内、rules 配列構築後
const nonZeroIds = rules.filter((r) => r.id !== 0).map((r) => r.id);
const uniqueIds = new Set(nonZeroIds);
if (uniqueIds.size !== nonZeroIds.length) {
  this.presenter.presentError(
    new ImportRulesJsonErrorOutputData(
      new Error('duplicate id'),
      'validation',
      'JSONに重複するルールIDが含まれています'
    )
  );
  return;
}
```

### Phase 3: テスト整備

- [ ] バリデーションロジックのユニットテスト（NaN・Infinity・負数・小数・重複id）
- [ ] 正常系: id 省略・null・正の整数 id が通過すること（明示的な id=0 は未採番sentinel衝突により拒否）
- [ ] 異常系: 各バリデーションエラーが `presentError` で正しいメッセージとともに報告されること

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
