---
codd:
  node_id: "req:user-stories-user-story-007-readme"
  type: requirement
---

# User Story 007: コーディング規約への適用シナリオ追加

## ストーリー

> コーディング規約の適用判断を容易にするため、既存規約に適用シナリオを追加する

## 概要

[coding-standards.md](../../../docs-rules/coding-standards.md) の「適用シナリオは記載する」規約に準拠していない既存コーディング規約を更新する。

## 適用シナリオの要件

[coding-standards.md](../../../docs-rules/coding-standards.md) および [common/rule-writing-principles/](../../../docs-rules/common/rule-writing-principles/index.md) より:

- 適用シナリオや判断事例を1-2個記載すること
- 「実装例」（コードスニペット）ではなく「適用シナリオ」（いつ・どこで適用するかの判断事例）を記載
- 良い例: 「ユーザーが入力中に背景コンテンツへ移動すると操作が中断されるため、フォーカストラップが必要」

## 適用シナリオがあるファイル（良い例）

| ファイル | シナリオ形式 |
|---------|-------------|
| `docs/coding-standards/src/frameworks-and-drivers/ui/accessible-modal.md` | 「適用シナリオ」セクション（確認ダイアログ、フォーム入力モーダル） |
| `docs/coding-standards/src/frameworks-and-drivers/ui/css-styling/design-tokens.md` | 「具体例」セクション（トークン選定手順と色修正事例） |
| `docs/coding-standards/src/application-business-rules/interactors.md` | 「典型的なユースケース」と「適用例」 |
| `docs/coding-standards/src/frameworks-and-drivers/ui/components.md` | 「適用場面」テーブル |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/props-dependent-state.md` | 「適用場面」テーブル |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/callback-memoization.md` | 「メモ化が必要なケース」テーブル |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/state-guard.md` | 「パターンの選択基準」テーブル |

## 対象ファイル

### 優先度高: srcディレクトリ

| ファイル | 現状 | 追加すべき内容 |
|---------|------|---------------|
| `docs/coding-standards/src/coding-standards.md` | 言語ガイドラインのみ | JSDoc、エラーメッセージ、コメントの適用シナリオ |
| `docs/coding-standards/src/object-oriented-nine-rules.md` | ルール一覧と除外パターン | 各ルールの適用シナリオ（プロジェクト固有の判断事例） |
| `docs/coding-standards/src/object-oriented-coding-standards.md` | 除外パターンのみ | メソッド設計の適用シナリオ |
| `docs/coding-standards/src/application-business-rules/dto.md` | 命名規則のみ | Input/Output DTOの使い分けシナリオ |
| `docs/coding-standards/src/frameworks-and-drivers/messaging.md` | 命名規約のみ | メッセージングクラスの選択シナリオ |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/useEffect-side-effects.md` | コード例のみ | どのような副作用に適用するかの判断事例 |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/react-aria-integration.md` | チェックリストのみ | React Aria使用/不使用の判断シナリオ |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/useRef-types.md` | 型の説明のみ | RefObject/MutableRefObjectの使い分けシナリオ |
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/jsdoc-rules.md` | 記載すべき情報のみ | JSDoc記載が必要なカスタムフックの判断事例 |

### 優先度中: testsディレクトリ

| ファイル | 現状 | 追加すべき内容 |
|---------|------|---------------|
| `docs/coding-standards/tests/common-rule/` | 規約のみ | インポートパス、モック配置、型注釈の適用シナリオ |
| `docs/coding-standards/tests/array-based-test.md` | 手順とコード例のみ | 配列ベーステストを採用すべき場合の判断事例 |
| `docs/coding-standards/tests/e2e/common-rule.md` | 実装例のみ | E2Eテストでコンソールエラー検知を追加する判断事例 |
| `docs/coding-standards/tests/integration/common-rule.md` | 規約のみ | fake-indexeddb、モック管理の適用シナリオ |
| `docs/coding-standards/tests/unit/common-rule/basic-rule.md` | 規約のみ | モック分離、ライフサイクル管理の適用シナリオ |
| `docs/coding-standards/tests/unit/common-rule/test-strategy.md` | 規約のみ | バリデーションテストの適用シナリオ |
| `docs/coding-standards/tests/common-rule/jsdoc-rule.md` | 規約のみ | JSDoc更新が必要な場合の判断事例 |
| `docs/coding-standards/tests/unit/infrastructure.md` | 簡潔な規約のみ | infrastructure層テストの適用シナリオ |

### 優先度低: make/scriptsディレクトリ

| ファイル | 現状 | 追加すべき内容 |
|---------|------|---------------|
| `docs/coding-standards/make/entire-standards.md` | ルール一覧のみ | Makefileでの適用シナリオ |
| `docs/coding-standards/scripts/entire-standards.md` | ルール一覧のみ | シェルスクリプトでの適用シナリオ |

### 対象外

| ファイル | 理由 |
|---------|------|
| `docs/coding-standards/src/frameworks-and-drivers/ui/react-hooks/index.md` | インデックスファイルのため適用シナリオ不要 |

## タスク

1. 優先度高のファイル(srcディレクトリ)に適用シナリオを追加
2. 優先度中のファイル(testsディレクトリ)に適用シナリオを追加
3. 優先度低のファイル(make/scriptsディレクトリ)に適用シナリオを追加

## 受け入れ条件

- [ ] 対象ファイルすべてに、適用シナリオや判断事例を記載したセクション(例: 「適用シナリオ」「適用場面」「具体例」「典型的なユースケース」など)が追加されている
- [ ] 各ファイルに1-2個の具体的な判断事例が記載されている
- [ ] 適用シナリオは「いつ・どこで適用するか」の判断を助ける内容になっている
- [ ] コードスニペットではなく、シナリオ/事例の形式で記載されている
