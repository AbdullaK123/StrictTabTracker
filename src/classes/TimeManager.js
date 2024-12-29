class TimeManager {
    
    // constructor
    constructor(storageManager, timeLimit) {
        this.storageManager = storageManager;
        this.timeLimit = timeLimit;
        this.activeTab = null;
        this.currentTimer = null;
    }

    // method to start timer once tab is activated
    async startTimer(tabID, tabURL) {
        try {
            // Stop any existing timer first
            if (this.currentTimer) {
                await this.stopTimer(this.activeTab.id);
            }

            // Store active tab info
            this.activeTab = {
                id: tabID,
                url: tabURL,
                startTime: Date.now()
            };

            // Start interval to update time
            this.currentTimer = setInterval(async () => {
                const duration = Date.now() - this.activeTab.startTime;
                await this.updateTimeData(tabURL, duration);
            }, 1000);

            // Check for date rollover
            await this.checkDateRollover();

        } catch (error) {
            console.error('Error starting timer:', error);
            // Reset state in case of error
            this.activeTab = null;
            this.currentTimer = null;
        }
    }

    // method to stop timer once the user switches tabs or closes a tab
    async stopTimer(tabID) {
        try {
            if (this.activeTab && this.activeTab.id === tabID) {
                clearInterval(this.currentTimer);
                
                // Save final duration before clearing
                const finalDuration = Date.now() - this.activeTab.startTime;
                await this.updateTimeData(this.activeTab.url, finalDuration);

                // Reset state
                this.activeTab = null;
                this.currentTimer = null;
            }
        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    }

    // method to update time data in storage
    async updateTimeData(url, duration) {
        try {
            const today = new Date().toDateString();
            const timeData = await this.storageManager.get(url) || {};
            
            if (!timeData[today]) {
                timeData[today] = 0;
            }
            
            timeData[today] = duration;
            
            await this.storageManager.set({ [url]: timeData });

            // Check if we need to block after updating time
            await this.checkAndBlockIfNeeded(url);
        } catch (error) {
            console.error('Error updating time data:', error);
        }
    }

    // method to check for date rollover
    async checkDateRollover() {
        try {
            const lastUpdate = await this.storageManager.get('lastUpdate');
            const today = new Date().toDateString();

            if (lastUpdate !== today) {
                await this.resetDailyTimers();
                await this.storageManager.set({ lastUpdate: today });
            }
        } catch (error) {
            console.error('Error checking date rollover:', error);
        }
    }

    // method to reset daily timers
    async resetDailyTimers() {
        try {
            const data = await this.storageManager.get(null);
            const today = new Date().toDateString();

            // Reset each URL's daily timer
            for (const [url, timeData] of Object.entries(data)) {
                if (typeof timeData === 'object') {
                    timeData[today] = 0;
                    await this.storageManager.set({ [url]: timeData });
                }
            }
        } catch (error) {
            console.error('Error resetting daily timers:', error);
        }
    }

    // if the time limit is reached, send the block signal
    async checkTimeLimit(url) {
        try {
            const timeData = await this.storageManager.get(url);
            if (!timeData) return false;

            const today = new Date().toDateString();
            const dailyTime = timeData[today] || 0;

            return dailyTime >= this.timeLimit;
        } catch (error) {
            console.error('Error checking time limit:', error);
            return false;
        }
    }

    async checkAndBlockIfNeeded(url) {
        try {
            const isBlocked = await this.checkTimeLimit(url);

            if (isBlocked) {
                // send the block signal
                await chrome.runtime.sendMessage({
                    type: 'BLOCK_URL',
                    domain: url,
                    timeData: await this.getTabStats(url)
                })
                return true
            }
            return false
        } catch (error) {
            console.error('Error checking time limit:', error);
            return false;
        }
       
    }

    // method to get statistics for a specific URL
    async getTabStats(url) {
        try {
            const timeData = await this.storageManager.get(url);
            if (!timeData) return null;

            return {
                daily: this.getDailyTime(timeData),
                weekly: this.getWeeklyTime(timeData),
                average: this.getAverageTime(timeData)
            };
        } catch (error) {
            console.error('Error getting tab stats:', error);
            return null;
        }
    }

    // Helper method to get daily time
    getDailyTime(timeData) {
        const today = new Date().toDateString();
        return timeData[today] || 0;
    }

    // Helper method to get weekly time
    getWeeklyTime(timeData) {
        let weeklyTotal = 0;
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            weeklyTotal += timeData[dateString] || 0;
        }
        
        return weeklyTotal;
    }

    // Helper method to get average daily time
    getAverageTime(timeData) {
        const times = Object.values(timeData).filter(time => time > 0);
        if (times.length === 0) return 0;
        
        const total = times.reduce((sum, time) => sum + time, 0);
        return total / times.length;
    }

    // Helper method to format duration in ms to readable string
    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        return `${hours}h ${minutes}m ${seconds}s`;
    }
}

export default TimeManager;