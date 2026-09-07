---
codd:
  node_id: "design:design-src-application-business-rules-interactors-exportrulesjsoninteractor-execute"
  type: design
---

# ExportRulesJsonInteractor.execute() テスト戦略

## 目的

ルールJSONエクスポートのワークフローを調整する。
Repository経由で全ルールを取得し、JSON構造（version, exportedAt, rules）を構築してPresenter.present()で通知する。
エラー発生時はPresenter.presentError()を呼び出してエラーを通知する。

## テスト分類

### 1. 正常系（基本フロー）

全ルールの取得・JSON構築・Presenter通知が正常に行われることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| 複数ルール | ルールが複数ある場合、全ルールのJSONをpresent()で通知する | 基本的なエクスポート操作の確認 |
| 0件 | ルールが0件の場合、空のrulesを持つJSONをpresent()で通知する | 空データでエラーが発生しないことを確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. 依存関係の呼び出し

各依存関係が正しく呼び出されることを確認。

| 分類 | テストケース | 根拠 | 実装状況 |
|------|-------------|------|---------|
| Repository.getAll | 引数なしで呼び出し | 全ルール取得 | ✓ 実装済み |
| Presenter.present | OutputDataで呼び出し | エクスポート成功の通知 | ✓ 実装済み |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

### 3. OutputDataの内容

Presenterに渡されるOutputDataが正しい構造と内容を持つことを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| version | jsonContent内にversion="1.0"が含まれる | JSONフォーマット要件（00-overview.md） |
| exportedAt | jsonContent内にexportedAtがISO 8601形式で含まれる | タイムゾーンオフセット付き形式要件 |
| rules配列 | jsonContent内にrulesとして全ルールデータが含まれる | バックアップ・リストア用途 |
| rules属性 | 各ルールにid/oldString/newString/urlPattern/isRegex/isActiveが含まれる | ID含む全属性エクスポート要件（AC-9） |
| fileName | frog-frame-front-rules-YYYYMMDD_hhmmss.json形式 | ファイル命名規則（AC-3） |

**対応テスト**: `normal-cases.test.ts`（同一テスト内で検証）

### 4. 異常系（エラーハンドリング）

Repository.getAll()でエラーが発生した場合にpresentError()が呼び出されることを確認。

| 分類 | テストケース | 根拠 |
|------|-------------|------|
| Repository.getAll失敗 | Repository.getAll()がエラーを投げた場合、presentError()を呼び出す | ルール取得失敗時の通知 |

**対応テスト**: `error-cases.test.ts`

## 網羅性チェック

- [x] 複数ルールのJSONエクスポート成功
- [x] 0件ルールのJSONエクスポート成功（空rulesArrayの確認）
- [x] Repository.getAllの呼び出し確認
- [x] Presenter.presentの呼び出し確認
- [x] OutputData.jsonContent内のversion確認
- [x] OutputData.jsonContent内のexportedAt（ISO 8601形式）確認
- [x] OutputData.jsonContent内のrulesデータ確認（全属性）
- [x] OutputData.fileNameのファイル名形式確認
- [x] 異常系（Repository.getAllでエラー発生）
- [x] presentError()のErrorOutputData.message確認 → エラーケーステストで実施済み
- [ ] タイムゾーン厳密検証 → 実行環境依存のため、フォーマット確認（正規表現）のみ実施

## テストファイル構成

```text
tests/unit/application-business-rules/interactors/ExportRulesJsonInteractor/execute/
├── normal-cases.test.ts    # 正常系確認（複数ルール・0件）
└── error-cases.test.ts     # 異常系確認（配列ベース、1ケース）
```

## モック戦略

Interactorの2つの依存関係をモック化してテストする。
責務分離のため、モック生成関数は外部ファイルに配置する。

### 使用するモック

> **注意**: 新規モック作成前に既存モックを確認すること。詳細は [mock-file-placement.md](/docs/coding-standards/tests/common-rule/mock-file-placement.md) を参照。

| 依存関係 | モック理由 | モック対応 |
| -------- | ---------- | ---------- |
| IRewriteRuleRepository | DB/メッセージング層を分離 | `tests/unit/application/ports/IRewriteRuleRepository/mocks/` |
| IExportRulesJsonPresenter | View層を分離 | 新規作成（`tests/unit/application-business-rules/interactors/ExportRulesJsonInteractor/mocks/`） |

### テストデータ

- RewriteRuleエンティティは実インスタンスを使用（`RewriteRule.fromParams()`）
- RewriteRulesコレクションは実インスタンスを使用（正確な`toArray()`動作の確認のため）

### モックファイル構成

```text
tests/unit/application-business-rules/interactors/ExportRulesJsonInteractor/mocks/
└── createMockPresenter.ts    # IExportRulesJsonPresenterモックファクトリ
```
