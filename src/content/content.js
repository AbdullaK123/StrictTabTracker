chrome.runtime.onMessage.addListener((message) => {
    if (message === "BLOCK_SITE"){
        document.documentElement.innerHTML = chrome.runtime.getURL("block-page.html");
    }
})