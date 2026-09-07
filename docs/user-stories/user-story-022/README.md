---
codd:
  node_id: "req:user-stories-user-story-022-readme"
  type: requirement
---

# User Story 022: ImportRulesJson - ブラウザAPI を F&D 専用モジュールへ抽出

## ストーリー

> ルールJSONインポート時に使用するブラウザ固有API（FileReader、File.size、Blob）を
> frameworks-and-drivers 層の専用モジュールに移動し、
> CA（クリーンアーキテクチャ）の依存方向ルールを完全に遵守した

## 概要

`useImportRulesJson.ts` はカスタムフックでありながら、ブラウザ固有APIを直接使用していた（実装前）:

| ブラウザAPI | 使用箇所 | 問題 |
|------------|---------|------|
| `new FileReader()` / `reader.readAsText()` | handleFileSelect (line 90-94) | F&D層のAPIが上位層なしで直接使用 |
| `file.size > 5 * 1024 * 1024` | handleFileSelect (line 84) | File.size APIをフック内で直接参照 |
| `new Blob([jsonString]).size` | handleFileSelect (line 98) | Blob APIをフック内で直接参照 |

これらのブラウザAPIはすでに `frameworks-and-drivers/` 層内のファイルに存在するが、
依存関係の逆転（DI）によるテスタビリティの向上と、
APIの変更・モック差し替えを容易にするため、専用クラスに抽出すべきである。

## 背景

PR#394 コードレビュー（GitHub）における殿（レビュアー）の指摘:

| コメントID | 対象行 | 指摘内容 |
|-----------|--------|---------|
| 2867019852 | line 98 (`new Blob([...]).size`) | 「frameworksanddriversにモジュールを作って対応してください」 |
| 2867020655 | line 86 (`file.size > 5 * 1024 * 1024`) | 「ファイルを扱うモジュールをframeworksanddrivers層に作成して対応するようにしてください」 |
| 2867021390 | line 95 (`reader.readAsText(file)`) | 「ファイルを扱うモジュールをframeworksanddrivers層に作成して対応するようにしてください」 |

JsonParser（JSON.parse のラッパー）と同様のパターンで、ファイル読み取り（FileReader）は
port interface + F&D 実装クラスとして抽出し、DI コンテナで管理する。
一方、ファイルサイズ上限はドメインルール（ビジネスルール）であるため、専用の F&D バリデータや
Blob 計算クラスは設けず、enterprise-business-rules 層の値オブジェクト `ImportFileSize` として
実装し、Interactor から `new ImportFileSize(file.size)` で検証する。

## 実装内容

### 新規作成ファイル

#### Service Port (ABR/ports/services/)

```typescript
// IFileTextReader.ts
export interface IFileTextReader {
  readAsText(file: File): Promise<string>;
}

// IJsonParser.ts
export interface IJsonParser {
  parse<T = unknown>(jsonString: string): T;
  parseAsObject(jsonString: string): Record<string, unknown>;
}
```

#### F&D 実装 (frameworks-and-drivers/)

```typescript
// File/FileTextReader.ts - FileReader.readAsText をラップ
export class FileTextReader implements IFileTextReader {
  readAsText(file: File): Promise<string> { ... }
}

// Json/JsonParser.ts - JSON.parse をラップ
export class JsonParser implements IJsonParser {
  parse<T = unknown>(jsonString: string): T { ... }
  parseAsObject(jsonString: string): Record<string, unknown> { ... }
}
```

#### Value Object (enterprise-business-rules/value-objects/)

```typescript
// ImportFileSize.ts - ファイルサイズ上限（5MB）をドメインルールとして検証
export class ImportFileSize {
  // 上限超過時は ImportFileSizeError、非数/負値時は InvalidImportFileSizeError を throw
  constructor(private readonly byteSize: number) { ... }
}
```

> 補足: 当初案の `IFileSizeValidator` / `FileSizeValidator` / `IByteSizeCalculator` /
> `BlobByteSizeCalculator` は導入していない。ファイルサイズ検証は上記 `ImportFileSize`
> 値オブジェクトに集約し、Blob による再シリアライズ後のバイト計算は行わない。
> CA 準拠のため、`ImportRulesJsonControllerFactory`（IA 層）が `file.size` と
> `fileTextReader.readAsText(file)` 結果を `ImportRulesJsonInputData(fileSizeBytes, fileText)`
> として変換し、Interactor（ABR 層）には DOM File を渡さない。

### 修正ファイル

- `frameworks-and-drivers/di/container.ts`: `FileTextReader` / `JsonParser` を生成し、
  `ImportRulesJsonControllerFactory`（`repository`, `jsonParser`, `fileTextReader` を注入）を
  `IImportRulesJsonControllerFactory` トークンとして登録
- `frameworks-and-drivers/ui/hooks/useImportRulesJson.ts`: DI コンテナから
  `IImportRulesJsonControllerFactory` を解決してインポート処理を実行（ブラウザAPIを直接使用しない）

## 受け入れ条件

[acceptance-criteria.md](./acceptance-criteria.md) を参照
