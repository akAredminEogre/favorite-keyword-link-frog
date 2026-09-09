---
codd:
  node_id: "design:design-src-application-usecases-rule-updaterewriteruleusecase-execute"
  type: design
---

# UpdateRewriteRuleUseCase.execute() テスト戦略

> **配置について**: 本ドキュメントは現行実装（`src/application/usecases/rule/UpdateRewriteRuleUseCase.ts`）のテスト戦略書です。
> [テスト戦略書ルール](../../../../../../../docs-rules/design/05-test-strategy.md)に従い、ソースコードのディレクトリ構造をミラーリングして配置しています。
>
> **将来の移動予定**: [User Story 014](../../../../../../user-stories/user-story-014/README.md) でADR-001準拠にリファクタリング後、
> ソースコードと共に `docs/design/src/application-business-rules/interactors/UpdateRewriteRuleInteractor/execute.md` に移動します。

## 目的

ルールを更新するワークフローを調整する。
RewriteRule.fromParamsでエンティティを生成し、Repository経由でルールを更新した後、ChromeTabsService経由でマッチするタブをリロードする。
タブリロード失敗時はルール保存の成功を維持し、console.warnでログ出力する。

## テスト分類

### 1. 正常系（基本フロー）

ルールの更新が正常に行われることを確認。

| 分類 | テストケース | 根拠 |
| ------ | ------------- | ------ |
| 通常のルール更新 | 通常のルールが正常に更新できる | 基本的な更新操作の確認 |
| 正規表現ルール更新 | 正規表現を含むルールが正常に更新できる | isRegex=trueのパターン確認 |
| URLパターンルール更新 | URLパターンを持つルールが正常に更新できる | 複雑なURLパターンの確認 |

**対応テスト**: `normal-cases.test.ts`

### 2. 依存関係の呼び出し

各依存関係が正しい引数で呼び出されることを確認。

| 分類 | テストケース | 根拠 | 実装状況 |
| ------ | ------------- | ------ | --------- |
| Repository.update | RewriteRule.fromParams(id, params)で生成されたルールで呼び出し | 更新されたルールの永続化 | ✓ 実装済み |
| ChromeTabsService.queryTabs | 空オブジェクトで呼び出し | 全タブの取得 | 未実装（モック設定のみ、アサーションなし） |
| ChromeTabsService.reloadTab | マッチするタブに対して呼び出し | マッチするタブのリロード | 未実装 |

**対応テスト**: `normal-cases.test.ts`（Repository.updateのみ検証）

### 3. 部分的成功（タブリロード失敗）

Repository.update成功後にタブリロードが失敗した場合の挙動を確認。

| 分類 | テストケース | 根拠 |
| ------ | ------------- | ------ |
| reloadAllTabsAfterRuleUpdate失敗 | ルール保存は成功し、例外がスローされない | DB更新成功後のタブリロード失敗を許容 |

**対応テスト**: 明示的テスト未実装（タブリロード失敗を再現するテストの追加が必要）

### 4. 早期リターン（urlPattern未指定）

urlPatternが空文字列やundefinedの場合、タブリロードをスキップする。

| 分類 | テストケース | 根拠 |
| ------ | ------------- | ------ |
| urlPatternが空文字列 | タブリロードがスキップされる | 早期リターン条件（空文字列） |
| urlPatternがundefined | タブリロードがスキップされる | 早期リターン条件（undefined） |

**対応テスト**: 明示的テスト未実装（urlPattern="" / undefined を明示的に検証するテストの追加が必要）

## 網羅性チェック

- [x] 通常ルールの更新
- [x] 正規表現ルールの更新
- [x] URLパターンルールの更新
- [x] Repository.updateの呼び出し確認
- [ ] ChromeTabsService.queryTabsの呼び出し確認 → 明示的テスト未実装（モック設定はあるがアサーションなし）
- [ ] ChromeTabsService.reloadTabの呼び出し確認 → 明示的テスト未実装
- [ ] タブリロード失敗時のルール保存成功維持 → 明示的テスト未実装（タブリロード失敗を再現するテストが必要）
- [ ] urlPattern未指定時の早期リターン → 明示的テスト未実装（urlPattern="" / undefined のテストが必要）
- [ ] Repository.update失敗時の異常系 → 現在のテストでは未カバー（executeはtry-catchでタブリロードのみ保護し、Repository.update失敗は呼び出し元に伝播するため、結合テストまたは上位レイヤーで検証）

## テストファイル構成

```text
tests/unit/application/usecases/rule/UpdateRewriteRuleUseCase/execute/
└── normal-cases.test.ts       # 正常系確認（配列ベース、3ケース）
```

## モック戦略

UseCaseの2つの依存関係をモック化してテストする。
責務分離のため、モック生成関数は外部ファイルに配置する。

> **重要**: モック作成は [mock-file-placement.md](../../../../../../coding-standards/tests/common-rule/mock-file-placement.md) の「モック作成の分離ルール」に従うこと。
> - モック作成は、別のクラスファイルに切り出し、それをインポートして使用すること
> - テストコード内で直接モックを定義しないこと
> - モックファクトリは `createMock[ClassName].ts` の形式で命名
> - **モック方法に具体的な実装コードを記載しないこと**（実装はテストコードを参照）

### 既存モック確認チェック（必須）

新規モック作成前に、同一インターフェースの既存モックを確認すること。

- [x] `grep -r "createMockRewriteRuleRepository" tests/` で既存モックを検索した → 既存モック使用 (`tests/unit/application/ports/IRewriteRuleRepository/mocks/createMockRewriteRuleRepository.ts`)
- [x] `grep -r "createMockTabsService" tests/` で既存モックを検索した → 既存モック使用 (`tests/unit/application/ports/IChromeTabsService/mocks/createMockTabsService.ts`)

> **参照**: [mock-file-placement.md](../../../../../../coding-standards/tests/common-rule/mock-file-placement.md) の「モック作成前の確認手順」

### モック対象

| 依存関係 | モック理由 | 既存モック |
| --------- | ----------- | ----------- |
| IRewriteRuleRepository | DB/ストレージ層を分離 | `tests/unit/application/ports/IRewriteRuleRepository/mocks/createMockRewriteRuleRepository.ts` ✓ |
| IChromeTabsService | Chrome API層を分離 | `tests/unit/application/ports/IChromeTabsService/mocks/createMockTabsService.ts` ✓ |

### テストデータ

RewriteRuleエンティティはRewriteRule.fromParams()で生成した実インスタンスを使用（expectedRuleとの一致確認のため）。
