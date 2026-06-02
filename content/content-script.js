if (window.__levelsInjected) {
    // Already running
} else {
    window.__levelsInjected = true;

    let currentVolume = 1.0;
    let isMuted = false;

    function sendToPage(type, data) {
        window.postMessage({
            direction: 'levels-to-page',
            type: type,
            ...data
        }, '*');
    }

    // Write settings to localStorage so the MAIN world script can read them
    // synchronously on next page load (survives service worker sleep)
    function mirrorToLocalStorage(volume, muted) {
        try {
            localStorage.setItem('__levels_settings', JSON.stringify({
                hostname: location.hostname,
                volume: volume,
                muted: muted
            }));
        } catch (e) {
            // localStorage may be blocked — not critical
        }
    }

    // Clear the localStorage mirror if no preset applies
    function clearLocalStorageMirror() {
        try {
            localStorage.removeItem('__levels_settings');
        } catch (e) {
            // Not critical
        }
    }

    async function initFromStorage() {
        try {
            const data = await chrome.storage.local.get(["tabVolumes", "sitePresets", "presetsEnabled"]);
            const tabVolumes = data.tabVolumes || {};
            const sitePresets = data.sitePresets || {};
            const presetsEnabled = data.presetsEnabled !== false;

            const hostname = window.location.hostname;

            const response = await chrome.runtime.sendMessage({ type: "GET_OWN_TAB_ID" });
            const tabId = response?.tabId;

            const tabSettings = tabId ? tabVolumes[tabId] : null;
            const sitePreset = (hostname && presetsEnabled) ? sitePresets[hostname] : null;
            const settings = tabSettings || sitePreset;

            if (settings) {
                currentVolume = settings.volume;
                isMuted = settings.muted;
                mirrorToLocalStorage(currentVolume, isMuted);
            } else {
                // No preset for this site — clear any stale mirror
                clearLocalStorageMirror();
            }

            sendToPage('INIT_SETTINGS', {
                volume: currentVolume,
                muted: isMuted
            });
        } catch (e) {
            sendToPage('INIT_SETTINGS', { volume: 1.0, muted: false });
        }
    }

    initFromStorage();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "PING") {
            sendResponse({ status: "alive" });
            return;
        }

        if (message.type === "SET_VOLUME") {
            currentVolume = message.volume;
            sendToPage('SET_VOLUME', { volume: currentVolume });
            mirrorToLocalStorage(currentVolume, isMuted);
            sendResponse({ success: true });
            return;
        }

        if (message.type === "SET_MUTE") {
            isMuted = message.muted;
            sendToPage('SET_MUTE', { muted: isMuted });
            mirrorToLocalStorage(currentVolume, isMuted);
            sendResponse({ success: true });
            return;
        }
    });
}