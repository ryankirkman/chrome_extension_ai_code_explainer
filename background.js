let selectedText = '';

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: 'explainCode',
        title: 'Explain Code',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'explainCode') {
        // Record the selected text for use in the popup
        selectedText = info.selectionText;
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.windows.create({
            url: chrome.runtime.getURL('popup.html'),
            type: 'popup',
            width: 400,
            height: 600,
            left: Math.round(currentTab.width / 2 - 200),
            top: Math.round(currentTab.height / 2 - 300)
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getSelectedText') {
        sendResponse({ text: selectedText });
    }
});