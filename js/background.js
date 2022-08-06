// --- variables --------------------------------------------------------------
let savedurllist = [];
let previous_url = '';

// --- initialize -------------------------------------------------------------
chrome.storage.local.get('ESM_list', function(data) {
    let value = '';
    if (typeof data.ESM_list !== 'undefined') {
        value = data.ESM_list;
    }
    savedurllist = value.split('; ');
    savedurllist = [...new Set(savedurllist)];
    savedurllist = savedurllist.filter(function(x){return x !== ''});
});


function checkURL(url) {
    let flag = false;
    if (savedurllist.includes(url)) {
        flag = true;
    } else {
        for (const elem of savedurllist) {
            if (url.includes(elem)) {
                flag = true;
                break;
            }
        }
    }

    return flag;
}


// --- event ------------------------------------------------------------------
// https://developer.chrome.com/docs/extensions/reference/tabs/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        // skip while site's status is 'loading' 
        return;
    }
    if (tab.url === previous_url) {
        // skip if url not change
        return;
    }

    previous_url = tab.url;
    // const flag = savedurllist.includes(tab.url);    // exact match only
    const flag = checkURL(tab.url);     // when it contained in URL
    if (flag) {
        // mute the site if it is in the muted list
        const muted = !tab.mutedInfo.muted;
        if (muted) {
            chrome.tabs.update(tab.id, {muted});
        }
    }

});


// receive URL text when changed muted list in popup.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    savedurllist = message.urltext.split('; ');
    savedurllist = [...new Set(savedurllist)];
    savedurllist = savedurllist.filter(function(x){return x !== ''});

	return true;
});
