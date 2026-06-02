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

    // Fetch saved settings and sync to the MAIN world
    // This handles cases where the manifest-injected override started at defaults
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
            }

            // Sync to MAIN world — reinforces or updates the preloaded value
            sendToPage('INIT_SETTINGS', {
                volume: currentVolume,
                muted: isMuted
            });
        } catch (e) {
            // On failure, ensure audio isn't stuck — set full volume
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
            sendResponse({ success: true });
            return;
        }

        if (message.type === "SET_MUTE") {
            isMuted = message.muted;
            sendToPage('SET_MUTE', { muted: isMuted });
            sendResponse({ success: true });
            return;
        }
    });
}