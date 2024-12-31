class BackgroundService {
    constructor() {
        // Initialize managers
        this.storageManager = new StorageManager();
        this.timeManager = null;  // Will be initialized with time limit
        this.popupManager = new PopupManager(this.storageManager, this.timeManager);
        
        // Track current state
        this.isInitialized = false;
        
        // Initialize the service
        this.init();
    }

    async init() {
        try {
            // Load saved time limit if exists
            const timeLimit = await this.storageManager.get('timeLimit');
            if (timeLimit) {
                this.timeManager = new TimeManager(this.storageManager, timeLimit);
                this.isInitialized = true;
            }

            // Set up all event listeners
            this.setupListeners();
        } catch (error) {
            console.error('Error initializing background service:', error);
        }
    }

    setupListeners() {
        // Tab events
        chrome.tabs.onActivated.addListener(this.handleTabChange.bind(this));
        chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
        
        // Runtime messages
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;  // Required for async response
        });
    }

    async handleTabChange(activeInfo) {
        try {
            if (!this.isInitialized) return;

            const tab = await chrome.tabs.get(activeInfo.tabId);
            
            // Stop timer on previous tab if exists
            if (this.timeManager.activeTab) {
                await this.timeManager.stopTimer(this.timeManager.activeTab.id);
            }

            // Start timer on new tab
            await this.timeManager.startTimer(tab.id, new URL(tab.url).hostname);
        } catch (error) {
            console.error('Error handling tab change:', error);
        }
    }

    async handleTabUpdate(tabId, changeInfo, tab) {
        try {
            if (!this.isInitialized || !changeInfo.url) return;

            const domain = new URL(changeInfo.url).hostname;
            
            // If this is the active tab, update timer
            if (this.timeManager.activeTab?.id === tabId) {
                await this.timeManager.stopTimer(tabId);
                await this.timeManager.startTimer(tabId, domain);
            }
        } catch (error) {
            console.error('Error handling tab update:', error);
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'SET_TIME_LIMIT':
                    await this.handleSetTimeLimit(message.limit);
                    sendResponse({ success: true });
                    break;

                case 'START_TIMER':
                    if (!this.isInitialized) {
                        sendResponse({ error: 'Timer not initialized' });
                        return;
                    }
                    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
                    await this.timeManager.startTimer(tab[0].id, new URL(tab[0].url).hostname);
                    sendResponse({ success: true });
                    break;

                case 'GET_STATS':
                    if (!this.isInitialized) {
                        sendResponse({ error: 'Timer not initialized' });
                        return;
                    }
                    const stats = await this.timeManager.getTabStats(message.domain);
                    sendResponse({ stats });
                    break;

                case 'BLOCK_SITE':
                    await this.handleBlockSite(sender.tab.id, message.domain);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    async handleSetTimeLimit(limit) {
        try {
            // Initialize TimeManager with limit
            this.timeManager = new TimeManager(this.storageManager, limit);
            this.isInitialized = true;

            // Move to warning sequence
            await this.popupManager.handleTimeLimitSet(limit);
        } catch (error) {
            console.error('Error setting time limit:', error);
            throw error;
        }
    }

    async handleBlockSite(tabId, domain) {
        try {
            // Get stats before blocking
            const stats = await this.timeManager.getTabStats(domain);
            
            // Update popup manager
            await this.popupManager.logAttempt();
            
            // Replace tab with block page
            await chrome.tabs.update(tabId, {
                url: chrome.runtime.getURL('content/blockpage.html')
            });
        } catch (error) {
            console.error('Error handling site block:', error);
            throw error;
        }
    }

    // Utility methods
    getDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return null;
        }
    }
}

// Initialize the background service
const backgroundService = new BackgroundService();

export default backgroundService;