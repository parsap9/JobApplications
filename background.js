// Configuration for backend API
const API_CONFIG = {
    baseUrl: 'http://localhost:5000',
    endpoints: {
        analyze: '/analyze-job',
        generate: '/generate-response'
    }
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle different message types
    switch (message.type) {
        case 'ANALYZE_JOB':
            handleJobAnalysis(message.description, sender.tab.id);
            break;
        case 'GENERATE_RESPONSE':
            handleResponseGeneration(message.prompt, sender.tab.id);
            break;
        default:
            console.warn('Unknown message type:', message.type);
    }
    // Return true to indicate async response
    return true;
});

// Handle job description analysis
async function handleJobAnalysis(description, tabId) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analysis = await response.json();
        
        // Send analysis results back to content script
        chrome.tabs.sendMessage(tabId, {
            type: 'ANALYSIS_COMPLETE',
            data: analysis
        });

    } catch (error) {
        console.error('Job analysis failed:', error);
        handleError(tabId, 'Failed to analyze job description');
    }
}

// Handle AI response generation
async function handleResponseGeneration(prompt, tabId) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.generate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const generatedResponse = await response.json();
        
        // Send generated response back to content script
        chrome.tabs.sendMessage(tabId, {
            type: 'RESPONSE_GENERATED',
            data: generatedResponse
        });

    } catch (error) {
        console.error('Response generation failed:', error);
        handleError(tabId, 'Failed to generate AI response');
    }
}

// Error handler
function handleError(tabId, message) {
    chrome.tabs.sendMessage(tabId, {
        type: 'ERROR',
        error: message
    });
}

// Keep service worker alive
chrome.runtime.onInstalled.addListener(() => {
    console.log('Background service worker installed');
});
