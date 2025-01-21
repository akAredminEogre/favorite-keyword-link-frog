/**
 * ドラッグ選択したテキストのHTMLを取得するサンプル関数
 */
function getSelectedHtml(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return '';
  }
  const container = document.createElement('div');
  for (let i = 0; i < selection.rangeCount; i++) {
    container.appendChild(selection.getRangeAt(i).cloneContents());
  }
  return container.innerHTML;
}

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

      // B) 「この要素を登録」メニューから呼ばれた場合 (registerElement)
      else if (request.type === 'registerElement') {
        console.log('[contentScript] Received "registerElement":', request.info);

        // 選択テキストがある場合、選択範囲のHTMLを取得
        const { selectionText } = request.info;
        if (selectionText) {
          const selectedHtml = getSelectedHtml();
          console.log('[contentScript] selected HTML:', selectedHtml);
          // 必要に応じて、sendResponse で返す／ストレージへ保存するなど拡張可能
          sendResponse({ selectedHtml });
        }
      }

      // 非同期応答を使わない限り、false を返してリスナー終了
      return false;
    });
  },
});
