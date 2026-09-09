---
codd:
  node_id: "doc:portfolio-problems"
  type: document
---

# Chromeストア指摘事項
- 1回目の審査要求まで
  - アイコンが128x128ピクセルであることを要求されていたが、手元で作成していたアイコンが127pxで1px違うだけでも拒否される

- 1回目の審査拒否後
  - scripting が不要な権限として拒否された
    - content_scripts で代替可能なため、scripting 権限を削除して再提出した  