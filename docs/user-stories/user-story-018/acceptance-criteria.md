---
codd:
  node_id: "test:user-stories-user-story-018-acceptance-criteria"
  type: test
---

# 受け入れ条件

> ⚠️ **整合注記（CodeRabbit PR#405 指摘対応）**: 現行 UseCase の唯一のメソッドは `importRulesJson(inputData)`（`previewImport` は存在しない）。本ストーリーの**目標**は「Controller も `ImportRulesJsonInputData` を直接受け取る形に統一」（README 参照）。下記 AC-2 は**現行（File 受け取り）の振る舞い**を記述したものであり、本US完了時には AC-5（目標形への統一）に置き換わる前提で読むこと。プレビュー確認 UI は本機能に存在しないため AC-4 の「プレビュー表示」は読み替え対象。

## ユーザーストーリー要件

- [ ] AC-1: `IImportRulesJsonUseCase.importRulesJson()` が `ImportRulesJsonInputData` を引数として受け取る（**実装済み**・現行I/F）
- [ ] AC-2（現状）: `ImportRulesJsonController.importRulesJson(file: File)` が内部で `ImportRulesJsonInputData` を生成して UseCase に渡す（**本US完了時に AC-5 の目標形へ移行**）
- [ ] AC-3: `ImportRulesJsonInputData` が実際にデータ転送に使用されている（未使用 DTO でない）
- [ ] AC-4: インポート機能の動作（一括上書きインポート）が変更前と同一である

## 技術要件

- [ ] AC-5: 他の UseCase/Controller（例: `ExportRulesJsonUseCase`）と同じ InputData 注入パターンを採用している
- [ ] AC-6: `ImportRulesJsonInputData` に必要なフィールドが適切に定義されている（`file: File` 等）
- [ ] AC-7: Clean Architecture の層構造が維持されている（UI 層が InputData を生成し Controller に渡す）
- [ ] AC-8: 影響を受ける全クラスのユニットテストが更新・通過している
- [ ] AC-9: 既存の E2E テスト（正常系インポートフロー）がすべて通過する
