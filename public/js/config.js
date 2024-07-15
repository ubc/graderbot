import { LocalStorageStrategy } from './modules/storage/localStorageStrategy.js';
import { StorageManager } from './modules/storage/storageManager.js';
import { Notifications } from './modules/notifications/notifications.js';

/**
 * Initialize the storage manager with the LocalStorage strategy.
 */
const storageManager = new StorageManager(new LocalStorageStrategy());

/**
 * Add event listener for DOM content loaded to initialize the form and event listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
    const llmUrlInput = document.getElementById('llm-url'); // Text input for LLM URL
    const debugModeCheckbox = document.getElementById('debug-mode'); // Checkbox for Debug Mode
    const saveButton = document.getElementById('save-button'); // Save button

    /**
     * Load saved values from local storage or use defaults.
     * @type {string}
     */
    const savedLlmUrl = storageManager.load('llm-url') || 'http://localhost:11434';
    const savedDebugMode = storageManager.load('debug-mode') || false;

    // Set the input fields to the saved values or defaults
    llmUrlInput.value = savedLlmUrl;
    debugModeCheckbox.checked = savedDebugMode;

    /**
     * Event listener for storage save events to show notifications.
     */
    storageManager.on('save', (key, value) => {
        Notifications.show(`Saved ${key}: ${value}`, 'info');
    });

    /**
     * Save the configuration when the save button is clicked.
     */
    saveButton.addEventListener('click', () => {
        const llmUrl = llmUrlInput.value;
        const debugMode = debugModeCheckbox.checked;

        // Save the LLM URL and Debug Mode to local storage
        storageManager.save('llm-url', llmUrl);
        storageManager.save('debug-mode', debugMode);

        // Show a toast notification for successful save
        Notifications.show('Configuration saved successfully!', 'info');
    });
});
