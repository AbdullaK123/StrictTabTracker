class PopupManager {

    constructor(storageManager, timeManager) {
        this.storageManager = storageManager;
        this.timeManager = timeManager;
        this.currentStep = 'setup';  
        this.warningStep = 0;
        this.disableAttempts = 0;
        this.confirmationPhrase = "I want to indulge in distractions right now";
    }

    // Initial Setup Methods
    async showInitialSetup() {
        await chrome.windows.create({
            url: chrome.runtime.getURL('popup/setup.html'),
            type: 'popup',
            width: 500,
            height: 600
        });
    }

    async handleTimeLimitSet(minutes) {
        // Store the limit
        await this.storageManager.set({ 'timeLimit': minutes });
        
        // Update TimeManager
        this.timeManager.timeLimit = minutes * 60 * 1000; // Convert to ms
        
        // Move to warning sequence
        this.currentStep = 'warnings';
        await this.saveState();
        await this.startWarningSequence();
    }

    // Warning Sequence Methods
    async startWarningSequence() {
        this.warningStep = 0;
        await chrome.windows.create({
            url: chrome.runtime.getURL('popup/warning.html'),
            type: 'popup',
            width: 500,
            height: 600
        });
    }

    async showNextWarning() {
        this.warningStep++;
        await chrome.runtime.sendMessage({
            type: 'UPDATE_WARNING',
            step: this.warningStep
        });
    }

    getWarningMessage() {
        const warnings = [
            "⚠️ POINT OF NO RETURN ⚠️",
            "🚨 FINAL WARNING 🚨",
            "🔥 LAST CHANCE TO BACK OUT 🔥"
        ];
        return warnings[this.warningStep] || warnings[0];
    }

    // Validation Methods
    validateConfirmation(phrase) {
        return phrase === this.confirmationPhrase;
    }

    async completeWarnings() {
        this.currentStep = 'active';
        await this.saveState();
    }

    // State Management Methods
    async saveState() {
        await this.storageManager.set({
            'currentStep': this.currentStep,
            'warningStep': this.warningStep,
            'disableAttempts': this.disableAttempts
        });
    }

    async loadState() {
        const state = await this.storageManager.get(null);
        if (state) {
            this.currentStep = state.currentStep || 'setup';
            this.warningStep = state.warningStep || 0;
            this.disableAttempts = state.disableAttempts || 0;
        }
    }

    // Disable Attempt Tracking
    async logAttempt() {
        this.disableAttempts++;
        await this.saveState();
    }

    // Utility Methods
    getCurrentState() {
        return {
            currentStep: this.currentStep,
            warningStep: this.warningStep,
            disableAttempts: this.disableAttempts
        };
    }

    async getTimeLimit() {
        const data = await this.storageManager.get('timeLimit');
        return data?.timeLimit || null;
    }
}

export default PopupManager;