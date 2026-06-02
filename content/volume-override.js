// volume-override.js — Runs in the MAIN world (page context)
// This intercepts ALL media volume changes at the prototype level

(function () {
    if (window.__levelsOverrideInjected) return;
    window.__levelsOverrideInjected = true;

    // Check if settings were pre-injected by the background script
    // If so, use them. If not, start at full volume (no preset = no modification).
    const preloaded = window.__levelsPreload;
    let masterVolume = preloaded ? preloaded.volume : 1.0;
    let masterMuted = preloaded ? preloaded.muted : false;

    const originalVolumeDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype, 'volume'
    );

    const originalMutedDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype, 'muted'
    );

    const elementIntendedVolumes = new WeakMap();

    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
        get() {
            if (elementIntendedVolumes.has(this)) {
                return elementIntendedVolumes.get(this);
            }
            return originalVolumeDescriptor.get.call(this);
        },
        set(value) {
            elementIntendedVolumes.set(this, value);
            const adjusted = masterMuted ? 0 : value * masterVolume;
            originalVolumeDescriptor.set.call(this, Math.max(0, Math.min(1, adjusted)));
        },
        configurable: true,
        enumerable: true
    });

    function applyToAll() {
        const allMedia = document.querySelectorAll('video, audio');
        allMedia.forEach(el => {
            const intended = elementIntendedVolumes.get(el) ??
                originalVolumeDescriptor.get.call(el);
            elementIntendedVolumes.set(el, intended);
            const adjusted = masterMuted ? 0 : intended * masterVolume;
            originalVolumeDescriptor.set.call(el, Math.max(0, Math.min(1, adjusted)));
        });
        applyToShadowRoots(document);
    }

    function applyToShadowRoots(root) {
        root.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
                const shadowMedia = el.shadowRoot.querySelectorAll('video, audio');
                shadowMedia.forEach(media => {
                    const intended = elementIntendedVolumes.get(media) ??
                        originalVolumeDescriptor.get.call(media);
                    elementIntendedVolumes.set(media, intended);
                    const adjusted = masterMuted ? 0 : intended * masterVolume;
                    originalVolumeDescriptor.set.call(media, Math.max(0, Math.min(1, adjusted)));
                });
                applyToShadowRoots(el.shadowRoot);
            }
        });
    }

    // Listen for messages from the isolated content script
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (!event.data || event.data.direction !== 'levels-to-page') return;

        if (event.data.type === 'SET_VOLUME') {
            masterVolume = event.data.volume;
            applyToAll();
        }

        if (event.data.type === 'SET_MUTE') {
            masterMuted = event.data.muted;
            applyToAll();
        }

        if (event.data.type === 'INIT_SETTINGS') {
            masterVolume = event.data.volume;
            masterMuted = event.data.muted;
            applyToAll();
        }
    });

    // Watch for new media elements
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                const mediaElements = [];

                if (node.matches && node.matches('video, audio')) {
                    mediaElements.push(node);
                }

                if (node.querySelectorAll) {
                    mediaElements.push(...node.querySelectorAll('video, audio'));
                }

                mediaElements.forEach(el => {
                    const intended = elementIntendedVolumes.get(el) ??
                        originalVolumeDescriptor.get.call(el);
                    elementIntendedVolumes.set(el, intended);
                    const adjusted = masterMuted ? 0 : intended * masterVolume;
                    originalVolumeDescriptor.set.call(el, Math.max(0, Math.min(1, adjusted)));
                });
            }
        }
    });

    if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
        const docObserver = new MutationObserver(() => {
            if (document.documentElement) {
                observer.observe(document.documentElement, { childList: true, subtree: true });
                docObserver.disconnect();
            }
        });
        docObserver.observe(document, { childList: true });
    }
})();