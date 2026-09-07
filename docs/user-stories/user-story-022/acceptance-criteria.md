---
codd:
  node_id: "test:user-stories-user-story-022-acceptance-criteria"
  type: test
---

# 受け入れ条件 - User Story 022

## 機能要件

- [x] `IFileTextReader` インターフェースが `application-business-rules/ports/services/` に存在する
- [x] `IJsonParser` インターフェースが `application-business-rules/ports/services/` に存在する
- [x] `FileTextReader` クラスが `frameworks-and-drivers/File/` に存在し、`IFileTextReader` を実装する
- [x] `JsonParser` クラスが `frameworks-and-drivers/Json/` に存在し、`IJsonParser` を実装する
- [x] `ImportFileSize` 値オブジェクトが `enterprise-business-rules/value-objects/` に存在し、ファイルサイズ上限（5MB）をドメインルールとして検証する
- [x] `FileTextReader` / `JsonParser` が DI コンテナ (`frameworks-and-drivers/di/container.ts`) に登録され、`ImportRulesJsonControllerFactory` に注入されている
- [x] `useImportRulesJson.ts` がブラウザAPI（FileReader, File.size, Blob）を直接使用していない
- [x] `useImportRulesJson.ts` が DI コンテナ経由で `IImportRulesJsonControllerFactory` を解決して使用している

## 品質要件

- [x] TypeScript 型チェック（`tsc --noEmit`）がエラーなしで通る
- [ ] コードレビューコメントへの返信が完了している（指摘元: 旧 PR#394 review comment id: 2867019852 / 2867020655 / 2867021390。本US実装の現行PRは #405 が継承）
