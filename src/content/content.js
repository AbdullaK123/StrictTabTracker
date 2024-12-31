// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BLOCK_SITE') {
        handleBlock(message.timeData);
        sendResponse({ success: true });
    }
    
    if (message.type === 'UPDATE_STATS') {
        updateStats(message.timeData);
        sendResponse({ success: true });
    }

    return true; // Keep message channel open for async response
});

// Handle site blocking
async function handleBlock(timeData) {
    try {
        const blockPage = await fetchBlockPage();
        replacePageContent(blockPage);
        updateStats(timeData);
        preventBypass();
    } catch (error) {
        console.error('Error blocking site:', error);
    }
}

// Fetch block page HTML
async function fetchBlockPage() {
    const response = await fetch(chrome.runtime.getURL('content/block-page.html'));
    return await response.text();
}

// Replace current page with block page
function replacePageContent(blockPage) {
    document.documentElement.innerHTML = blockPage;
}

// Update time statistics on block page
function updateStats(timeData) {
    const statsElement = document.getElementById('time-stats');
    if (statsElement && timeData) {
        statsElement.innerHTML = `
            <div class="stats">
                <p>Time spent today: ${formatTime(timeData.daily)}</p>
                <p>Weekly average: ${formatTime(timeData.weekly)}</p>
                <p>Disable attempts: ${timeData.attempts}</p>
            </div>
        `;
    }
}

// Format milliseconds to readable time
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours}h ${minutes}m ${seconds}s`;
}

// Prevent bypass attempts
function preventBypass() {
    // Prevent closing page
    window.onbeforeunload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
    };

    // Prevent right click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Prevent keyboard shortcuts
    document.addEventListener('keydown', e => {
        const shortcuts = [
            e.ctrlKey && e.key === 'w',  // Close tab
            e.ctrlKey && e.key === 'r',  // Refresh
            e.key === 'F5',              // Refresh
            e.altKey && e.key === 'left' // Back
        ];

        if (shortcuts.some(Boolean)) {
            e.preventDefault();
        }
    });
}