export default defineBackground({
  // Set manifest options
  type: 'module',

  main() {
    // Executed when background is loaded, CANNOT BE ASYNC
    // 1) 拡張がインストール or 更新されたタイミングでコンテキストメニューを登録
    chrome.runtime.onInstalled.addListener(() => {
      // 既存のメニューがある場合は衝突を防ぐため removeAll
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: 'fklf-register-element',
          title: 'fklf: この要素を登録',
          contexts: ['selection', 'link'], // テキスト選択時 と リンク上 でのみ表示
        });
        console.log('[background] Context menu created!');
      });
    });

    // 2) コンテキストメニュークリック時の処理
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      console.log('[background] contextMenus.onClicked:', info, tab);

      // IDをチェックし、該当メニューならコンテントスクリプトにメッセージを送る
      if (info.menuItemId === 'fklf-register-element' && tab?.id != null) {
        // 選択テキストなどが info に格納される
        chrome.tabs.sendMessage(tab.id, {
          type: 'registerElement',
          info, // { selectionText, linkUrl, srcUrl, ... } 等
        });
      }
    });
  },
});