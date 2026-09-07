---
codd:
  node_id: "governance:coding-standards-tests-common-rule-mock-file-placement"
  type: governance
---

# 2. モックファイルの配置ルール

## 規約

- モックファイルは、モック対象クラスのsrcディレクトリ構造を `tests/` 配下で反映したディレクトリの `mocks/` サブディレクトリに配置すること
- モック対象クラスのパス: `src/{layer}/{category}/{ClassName}/`
- モックファイルのパス: `tests/{layer}/{category}/{ClassName}/mocks/`

## 適用シナリオ

1. **新規テストでモックが必要になった場合**: `grep -r "createMock[ClassName]" tests/`で既存モックを検索し、存在すれば直接インポートして再利用する。存在しない場合のみモック対象クラスのtestsディレクトリに新規作成する
2. **既存モックを別のテストでも使いたい場合**: 新しいモックファイルや再エクスポート用ラッパーを作成せず、既存の共有モックパスを直接インポートする

## 配置例（新規作成時）

**注意**: 新規モック作成前に必ず「モック作成前の確認手順」で既存モックを検索すること。既存モックがある場合はそちらを使用する。

| モック対象クラス | モックファイル配置先 |
| ------------------ | --------------------- |
| `src/frameworks-and-drivers/browser/ChromeTabsGateway/` | `tests/frameworks-and-drivers/browser/ChromeTabsGateway/mocks/` |
| `src/infrastructure/persistence/indexeddb/` | `tests/infrastructure/persistence/indexeddb/mocks/` |
| `src/application-business-rules/ports/gateway/ITabsGateway.ts` | `tests/unit/application-business-rules/ports/gateway/ITabsGateway/mocks/` ※既存モックがない場合 |

## 禁止事項

- テスト固有のディレクトリ（例: `tests/integration/{feature}/mocks/`）にモックを配置すること
- モック対象クラスのディレクトリ構造と異なる場所に配置すること
- **同一インターフェースのモックを複数箇所に作成すること**（重複モックの禁止）
- **既存モックの再エクスポート用ラッパーファイルを作成すること**（直接インポートを使用）

## 許可事項

- 複数のテストから共有されるモックは、モック対象クラスに対応するtestsディレクトリに配置

## モック作成前の確認手順（必須）

新規モックファクトリ作成前に、以下を確認すること：

1. **既存モックの検索**

   以下のコマンドは `host-frontend-root/frontend-src-root/` ディレクトリで実行すること:
   ```bash
   # 同一インターフェースのモックを検索（例：ITabsGateway）
   grep -r "createMockTabsGateway" tests/
   # または
   find tests/ -name "createMock*.ts" | xargs grep -l "ITabsGateway"
   ```

   リポジトリルートから実行する場合は `host-frontend-root/frontend-src-root/tests/` を指定すること。

2. **検索結果の判断**
   - 既存モックが見つかった場合 → **共有モックから直接インポートして使用**
     - 新しいモックファイルを作成してはならない（再エクスポート用ラッパーも禁止）
     - テストコードで共有モックのパスを直接指定すること
   - 見つからなかった場合 → モック対象クラスのtestsディレクトリに新規作成

3. **共有モックの配置先**
   - ポート/インターフェースレベルのモック → `tests/unit/{layer}/ports/{category}/{InterfaceName}/mocks/`
   - 例：`ITabsGateway` → `tests/unit/application-business-rules/ports/gateway/ITabsGateway/mocks/`
   - 例：`IRewriteRuleRepository` → `tests/unit/application-business-rules/ports/gateway/IRewriteRuleRepository/mocks/`

**重要**: この手順を省略すると、PRレビューで重複モックの指摘を受けます。

### 既存コードへの適用

本規約に準拠していない既存コードは [user-story-008](../../../user-stories/completed/user-story-008/README.md) で対応予定。

**注意**: 新規作成時は必ず本規約に従うこと。

## eslint-rule

ESLint化不可（ディレクトリ構造の規約はファイルシステムレベルの検証が必要、PRレビューで確認）
