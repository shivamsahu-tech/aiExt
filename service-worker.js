
chrome.action.onClicked.addListener(async (tab) => {
  // Open the side panel when extension icon is clicked
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Keep the context menu functionality
function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'define-word',
    title: 'Define',
    contexts: ['selection']
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  chrome.storage.session.set({ lastWord: data.selectionText });
  chrome.sidePanel.open({ tabId: tab.id });
});
