export default defineContentScript({
  matches: ['https://qiita.com/akAredminEogre/items/73b97b12ee5db94552af'],

  // injection: 'document_idle', // 必要に応じてタイミング設定 (document_start, document_end など)

  main() {
    console.log('Hello content. (from wxt defineContentScript hmr dev)');

    // === ここにページ要素の操作やメッセージ受信ロジックを仕込む例 ===
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'getPageInfo') {
        // ページタイトルや任意の要素を取得
        const title = document.title;
        const firstH1 = document.querySelector('h1')?.textContent || '(no <h1> found)';
        console.log('contentScript: getPageInfo request received. Returning data...');

        sendResponse({
          title,
          firstH1,
          // 必要に応じてさらに情報を追加
        });
      }
      // 必要なら真偽を返す（非同期レスポンスする場合など）
      return false;
    });
  },
});
