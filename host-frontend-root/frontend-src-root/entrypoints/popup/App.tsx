import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';

function App() {
  // カウンター用のState
  const [count, setCount] = useState(0);

  // コンテントスクリプトから受け取ったページ情報を保持するState
  const [pageInfo, setPageInfo] = useState<{ title?: string; firstH1?: string }>({});

  /**
   * 現在アクティブなタブのDOM情報を取得する
   */
  const handleGetInfo = () => {
    // アクティブなタブを取得
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId == null) return;

      // コンテントスクリプトにメッセージを送信
      chrome.tabs.sendMessage(
        tabId,
        { type: 'getPageInfo' },
        (response) => {
          // エラーがある場合はコンソールに出力
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          // 成功した場合、返ってきたデータをStateに反映
          if (response) {
            setPageInfo({
              title: response.title,
              firstH1: response.firstH1,
            });
          }
        }
      );
    });
  };

  return (
    <>
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* 追加部分: ページ情報を取得するボタンと結果表示 */}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleGetInfo}>Get Page Info</button>
        {pageInfo.title && (
          <div>
            <p><strong>Title:</strong> {pageInfo.title}</p>
            <p><strong>First &lt;h1&gt;:</strong> {pageInfo.firstH1}</p>
          </div>
        )}
      </div>

      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
