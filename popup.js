// Initialize popup UI elements
document.addEventListener('DOMContentLoaded', () => {
    const autofillToggle = document.getElementById('autofillToggle');
    const generateButton = document.getElementById('generateResponse');
    const responsePreview = document.getElementById('responsePreview');
    const saveButton = document.getElementById('saveChanges');

    // Load saved preferences
    chrome.storage.sync.get(['autofillEnabled'], (result) => {
        autofillToggle.checked = result.autofillEnabled || false;
    });

    // Handle autofill toggle
    autofillToggle.addEventListener('change', () => {
        chrome.storage.sync.set({
            autofillEnabled: autofillToggle.checked
        });

        // Notify content script of toggle change
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'TOGGLE_AUTOFILL',
                enabled: autofillToggle.checked
            });
        });
    });

    // Handle generate response button
    generateButton.addEventListener('click', async () => {
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';

        try {
            // Get current tab's job description
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            const response = await chrome.tabs.sendMessage(tab.id, {
                type: 'GET_JOB_DESCRIPTION'
            });

            // Send to background script for AI processing
            chrome.runtime.sendMessage({
                type: 'GENERATE_RESPONSE',
                jobDescription: response.description
            }, (result) => {
                responsePreview.value = result.response;
                generateButton.disabled = false;
                generateButton.textContent = 'Generate AI Response';
            });
        } catch (error) {
            responsePreview.value = 'Error generating response. Please try again.';
            generateButton.disabled = false;
            generateButton.textContent = 'Generate AI Response';
        }
    });

    // Handle save changes
    saveButton.addEventListener('click', () => {
        chrome.storage.sync.set({
            customResponse: responsePreview.value
        }, () => {
            saveButton.textContent = 'Saved!';
            setTimeout(() => {
                saveButton.textContent = 'Save Changes';
            }, 2000);
        });
    });
});

