---
codd:
  node_id: "governance:coding-standards-src-object-oriented-coding-standards"
  type: governance
---

# オブジェクト指向コーディング規約

## 適用シナリオ

1. **ユーティリティメソッドを追加しようとしたとき**: staticメソッドやインスタンス変数を使わないメソッドを書きたくなった場合、そのメソッドが本当にそのクラスに属すべきか再考する。インスタンス変数を使わないメソッドは、別のクラスの責務である可能性がある
2. **infrastructure層でChrome APIをラップする場合**: infrastructure層ではChrome APIの呼び出しが主目的であり、インスタンス変数を必ずしも使わないメソッドが許容される。この除外パターンはinfrastructure層に限定されるため、domain層やapplication層では適用されない

## メソッド設計

- **メソッドは必ずインスタンス変数を使うこと**
  - 除外パターン
    - infrastructure層（frameworks-and-drivers層）のコード

## eslint-rule

### ESLint除外ルール

| ルール | 理由 |
|--------|------|
| メソッドは必ずインスタンス変数を使う | カスタムルール実装の複雑さのため、コードレビューで確認 |