// --- variables --------------------------------------------------------------
const selectURLlist = document.getElementById('urllist');
let savedurllist = [];
let nowselected = '';

// --- function ---------------------------------------------------------------
function UpdateStorage() {
    let valtext = '';
    savedurllist.sort();
    for (const elem of savedurllist) {
        valtext = valtext + elem + '; ';
    }
    valtext = valtext.slice(0, -2);

    // save
    chrome.storage.local.set({'ESM_list': valtext}, function () {
    });
    console.log(valtext);

    // send background.js
    chrome.runtime.sendMessage(
        { urltext: valtext },
        function (response) {if (response) { alert(response); }}
    );
}


// --- initialize select box of popup.html ------------------------------------
chrome.storage.local.get('ESM_list', function(data) {
    let value = '';
    if (typeof data.ESM_list !== 'undefined') {
        value = data.ESM_list;
    }
    savedurllist = value.split('; ');
    savedurllist = [...new Set(savedurllist)];
    savedurllist = savedurllist.filter(function(x){return x !== ''});

    // add new choice to select box
    for (const elem of savedurllist) {
        let newElement = new Option(elem, elem);
        selectURLlist.add(newElement);
    }
});

// Get URL of current site
chrome.tabs.query({active: true, lastFocusedWindow:true}, tabs => {
    $('#nowurl').val(`${tabs[0].url}`);
});

// --- button action ----------------------------------------------------------
$(function(){
    // --- when item selected in selectbox ------------------------------------
    $('#urllist').change(function() {
        nowselected = $('option:selected').val();
    });

    // --- add button ---------------------------------------------------------
    $('#addurl').click(function() {
        // get value of input field
        const nurl = $('#nowurl').val();
        if (savedurllist.includes(nurl)) { return; }

        // add new choice to select box
        let newElement = new Option(nurl, nurl);
        selectURLlist.add(newElement);
        savedurllist.push(nurl);
        UpdateStorage();
    });

    // --- delete button ------------------------------------------------------
    $('#deleteurl').click(function() {
        if (nowselected === '') {
            return;
        }
        // confirm window
        if (window.confirm(
                'this URL will be deleteted from muted list:\r\n' +
                `    > ${nowselected}\r\n\r\nAre you absolutely sure?`
            )) {
            // delete selected choice from select box
            selectURLlist.remove(selectURLlist.selectedIndex);
            savedurllist = savedurllist.filter(
                function(x){return x !== nowselected}
            );
            UpdateStorage();
        }
    });
});