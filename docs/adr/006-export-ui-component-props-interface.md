---
codd:
  node_id: "governance:adr-006-export-ui-component-props-interface"
  type: governance
---

# ADR-006: UIコンポーネントのPropsインターフェースをエクスポートする

## ステータス

採用

## コンテキスト

ReactのUIコンポーネントでは、Propsの型定義（インターフェース）をエクスポートするかどうかの選択肢がある。

### 検討した観点

1. **エクスポートする利点**
   - 親コンポーネントやラッパーコンポーネントで型を参照できる
   - Storybookのargsで型を明示できる
   - 型の再利用性が向上する
   - 大規模コンポーネントライブラリ（MUI、Chakra UI、Radix UI等）での一般的なパターン

2. **エクスポートしない利点**
   - 公開APIを最小限に保てる
   - `React.ComponentProps<typeof Button>` で型取得可能なため必須ではない

3. **エクスポートのデメリット**
   - 実質的なデメリットはほぼない
   - エクスポートした型は「公開契約」となるが、アプリ内部コンポーネントでは実質的な問題にならない

## 決定

**今後作成するUIコンポーネントでは、Propsインターフェースをエクスポートする。**

### 適用待ちの箇所

以下の既存コンポーネントは本ADR採用以前に作成されたため、Propsインターフェースがエクスポートされていない：

| コンポーネント | 配置 | 状態 |
|---------------|------|------|
| ToggleSwitch | `src/frameworks-and-drivers/ui/components/atoms/` | 未対応 |
| Button | `src/components/atoms/` | 未対応 |
| SaveButton | `src/components/atoms/` | 未対応 |
| CancelButton | `src/components/atoms/` | 未対応 |
| RuleCard | `src/components/molecules/` | 未対応 |

これらは以下のいずれかのタイミングで対応する：

1. 該当コンポーネントに変更が加わる際に合わせて対応
2. 別途リファクタリングタスクとして対応

## 理由

1. **一貫性**: 全コンポーネントで統一されたパターンを使用する
2. **型の再利用性**: 必要に応じて親コンポーネントで型を参照できる
3. **デメリットの少なさ**: エクスポートによる実質的なデメリットがない
4. **業界標準との整合**: 主要なコンポーネントライブラリと同じパターン

## 影響ドキュメント

このADRが変更された場合、以下のドキュメントも更新が必要：

- なし

## 関連ドキュメント

- [UIコンポーネント コーディング規約](../coding-standards/src/frameworks-and-drivers/ui/components.md)
