---
codd:
  node_id: "governance:coding-standards-src-application-business-rules-dto"
  type: governance
---

# dtoのコード規約

## 適用シナリオ

1. **InteractorにUI層からデータを渡す場合**: コンポーネントからInteractorのメソッドを呼び出す際、プリミティブ値を直接渡すのではなくInput DTOにまとめる。例えば、ルール作成時にoldString、newString、urlPatternをそれぞれ渡すのではなく、`CreateRuleInputData`として構造化する
2. **Interactorの処理結果をUI層に返す場合**: Interactorからエンティティを直接返すのではなくOutput DTOに変換して返す。これによりUI層がドメイン層のエンティティに直接依存することを防ぐ

## input DTO
- input DTOは、Interactorのメソッドの引数として使用
- 命名規則は「[機能名]InputData」とする
- constructor
  - 引数はプリミティブ型 / 値オブジェクト型 とする

## output DTO
- output DTOは、Interactorのメソッドの戻り値として使用
- 命名規則は「[機能名]OutputData」とする
- constructor
  - エンティティ型を推奨とする

## eslint-rule

`host-frontend-root/frontend-src-root/eslint-rules/clean-architecture/application-business-rules/dto.js`
