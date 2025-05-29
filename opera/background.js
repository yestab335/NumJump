// Add listeners for tabs
const tabs = chrome.tabs;

tabs.onCreated.addListener(function (tab) {
  console.log("[onCreated] Tab Created: ", tab);
  updateAllTabs();
});

tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("[onUpdated] Tab Updated: ", tabId, changeInfo, tab);
  updateAllTabs();
});

tabs.onMoved.addListener(function (tabId, moveInfo) {
  console.log("[onMoved] Tab Moved: ", tabId, moveInfo);
  updateAllTabs();
});

tabs.onDetached.addListener(function (tabId, detachInfo) {
  console.log("[onDetached] Tab Detached: ", tabId, detachInfo);
  updateAllTabs();
});

tabs.onAttached.addListener(function (tabId, attachInfo) {
  console.log("[onAttached] Tab Attached: ", tabId, attachInfo);
  updateAllTabs();
});

tabs.onRemoved.addListener(function (tabId, removeInfo) {
  console.log("[onRemoved] Tab Removed: ", tabId, removeInfo);
  updateAllTabs();
});

function updateTab(tab, allTabs) {
  const { id, index, url, title, windowId } = tab;

  if (url.startsWith("chrome://")) {
    return;
  }

  const numTabs = allTabs.filter((t) => t.windowId === windowId).length;
  const prefixRegEx = /^[0-9-]+\. /;
  const num = index + 1;

  let newPrefix = num <= 8 ? `${num}. ` : num === numTabs ? "9. " : "-. ";
  const hasPrefix = prefixRegEx.exec(title);
  let newTitle = hasPrefix
    ? title.replace(prefixRegEx, newPrefix)
    : newPrefix + title;

  if (newTitle !== title) {
    try {
      const script = { code: `document.title = '${newTitle}'` };
      chrome.scripting
        .executeScript({
          target: { tabId: id },
          func: (title) => {
            document.title = title;
          },
          args: [newTitle],
        })
        .catch((err) => console.error("Script injection failed:", err));
    } catch (e) {
      console.error("Error updating tab title: ", e);
    }
  }
}

function getAllTabs(cb) {
  chrome.tabs.query({}, cb);
}

function updateAllTabs() {
  console.log("[updateAllTabs] Fetching all tabs to update...");

  const cb = (tabs) => tabs.forEach((tab) => updateTab(tab, tabs));
  getAllTabs(cb);
}

updateAllTabs();
