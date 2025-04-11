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
function handleJobAnalysis(description, tabId) {
    try {
        // Basic keyword matching analysis
        const analysis = {
            skills: extractSkills(description),
            experience: extractExperience(description)
        };
        
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

// Handle response generation
function handleResponseGeneration(prompt, tabId) {
    try {
        // Generate a basic response template
        const generatedResponse = generateBasicResponse();
        
        // Send generated response back to content script
        chrome.tabs.sendMessage(tabId, {
            type: 'RESPONSE_GENERATED',
            data: generatedResponse
        });

    } catch (error) {
        console.error('Response generation failed:', error);
        handleError(tabId, 'Failed to generate response');
    }
}

// Helper function to extract skills from text
function extractSkills(text) {
    // Basic implementation - could be enhanced
    const commonSkills = ['python', 'javascript', 'sql', 'data analysis', 'project management'];
    return commonSkills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
}

// Helper function to extract experience requirements
function extractExperience(text) {
    // Basic implementation - could be enhanced
    const years = text.match(/\d+\+?\s*years?/g) || [];
    return years[0] || 'Not specified';
}

// Helper function to generate basic response
function generateBasicResponse() {
    return {
        response: "Thank you for considering my application. I am excited about this opportunity and believe my skills and experience align well with your requirements."
    };
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
