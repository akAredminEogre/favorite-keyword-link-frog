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

/**
 * DOMツリーを走査し、テキストノードを正規表現で置換する関数
 * @param root     ルートノード (例: document.body)
 * @param pattern  置換対象の正規表現
 * @param replacement  置換後の文字列
 */
function replaceTextInNode(root: Node, pattern: RegExp, replacement: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let textNode: Node | null;
  while ((textNode = walker.nextNode())) {
    const oldText = textNode.nodeValue;
    if (oldText) {
      const newText = oldText.replace(pattern, replacement);
      if (newText !== oldText) {
        textNode.nodeValue = newText;
      }
    }
  }
}

export default defineContentScript({
  matches: ['https://qiita.com/akAredminEogre/items/73b97b12ee5db94552af'],
  // injection: 'document_idle', // 必要に応じてタイミングを指定

  main() {
    console.log('Hello content. (from wxt defineContentScript hmr dev)');

    // ---- A) ページ再訪問時の書き換えロジック ----
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to get storage:', chrome.runtime.lastError);
        return;
      }
      // itemsの形: { [id]: { id, pattern, newText, ... }, ... }
      const ruleList = Object.values(items);
      if (!ruleList.length) {
        console.log('[content] No rewrite rules found.');
        return;
      }

      // URLパターンで絞り込む場合はここで window.location.href と比較するなど可能
      ruleList.forEach((ruleObj) => {
        if (!ruleObj || typeof ruleObj !== 'object') return;

        const { pattern, newText } = ruleObj as {
          pattern?: string;
          newText?: string;
        };
        if (!pattern || !newText) return; // 必要情報が無い場合はスキップ

        try {
          // 大文字小文字を区別しない場合は 'gi' など適宜指定
          const regex = new RegExp(pattern, 'g');
          replaceTextInNode(document.body, regex, newText);

          console.log(
            `[content] Rewrote texts matching /${pattern}/g → "${newText}"`
          );
        } catch (err) {
          console.warn('[content] Invalid pattern or error:', pattern, err);
        }
      });
    });

    // ---- B) メッセージ受信ロジック ----
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // 1) ページタイトルや任意の要素を取得
      if (request.type === 'getPageInfo') {
        const title = document.title;
        const firstH1 = document.querySelector('h1')?.textContent || '(no <h1> found)';
        console.log('contentScript: getPageInfo request received. Returning data...');

        sendResponse({
          title,
          firstH1,
          // 必要に応じて追加情報
        });
      }

        // 2) 「この要素を登録」メニューから呼ばれた場合
      else if (request.type === 'registerElement') {
        console.log('[contentScript] Received "registerElement":', request.info);

        // ドラッグ選択したテキストがある場合、選択範囲のHTMLを取得して返す
        const { selectionText } = request.info;
        if (selectionText) {
          const selectedHtml = getSelectedHtml();
          console.log('[contentScript] selected HTML:', selectedHtml);
          sendResponse({ selectedHtml });
        }
      }

      // 非同期応答を使わない限り、false を返してリスナー終了
      return false;
    });
  },
});
