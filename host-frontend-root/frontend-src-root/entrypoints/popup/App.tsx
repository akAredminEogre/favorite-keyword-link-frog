import React, { useState } from 'react';
import './App.css';

/** 書き換えルールの型定義（暫定） */
type RewriteRule = {
  id?: string;   // UUIDなど一意識別子
  newText: string;
  pattern: string;
};

function App() {
  // フォーム入力を管理するState
  const [rewriteRule, setRewriteRule] = useState<RewriteRule>({
    newText: '',
    pattern: '',
  });

  /** フォームの入力値を変更するハンドラ */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRewriteRule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /** 保存ボタンを押したとき、chrome.storage.localへ書き込み */
  const handleSave = async () => {
    try {
      console.log('Saving rewrite rule:', rewriteRule);
      // 一意のID（UUID）を仮に発行
      const id = crypto.randomUUID();

      // 保存する書き換えルール
      const ruleToSave = { ...rewriteRule, id };

      // chrome.storage.localに保存
      await chrome.storage.local.set({ [id]: ruleToSave });

      console.log('Saved rewrite rule:', ruleToSave);

      // フォームをリセット
      setRewriteRule({ newText: '', pattern: '' });

      // 簡易的な完了通知（ここでアラート）
      alert('保存しました！');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <div style={{ width: 300, padding: 10 }}>
      <h2>fklf: Rewrite Rule</h2>

      <div style={{ marginBottom: 8 }}>
        <label>
          変更後のテキスト:
          <input
            type="text"
            name="newText"
            value={rewriteRule.newText}
            onChange={handleChange}
            style={{ marginLeft: 4 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          正規表現パターン:
          <input
            type="text"
            name="pattern"
            value={rewriteRule.pattern}
            onChange={handleChange}
            style={{ marginLeft: 4 }}
          />
        </label>
      </div>

      <button onClick={handleSave}>保存</button>
    </div>
  );
}

export default App;
