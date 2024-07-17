/**
 * This script handles the onboarding process.
 * It saves the onboarding completion status to the chosen storage strategy and redirects the user to the main page.
 */

import { LocalStorageStrategy } from '../modules/storage/localStorageStrategy.js';
import { StorageManager }       from '../modules/storage/storageManager.js';

// Initialize the storage manager with the LocalStorage strategy
const storageManager = new StorageManager(new LocalStorageStrategy());

/**
 * Adds an event listener to the 'Get Started' button to save the onboarding completion status
 * and redirect the user to the main page.
 *
 * This function waits for the DOM content to be fully loaded before attaching the event listener.
 */
document.addEventListener('DOMContentLoaded', () => {
    const getStartedButton = document.getElementById('get-started-button');

    /**
     * Event listener for the 'Get Started' button click event.
     *
     * When the button is clicked, this function saves the onboarding completion status to local storage
     * using the StorageManager, then redirects the user to the main page ('/').
     */
    getStartedButton.addEventListener('click', () => {
        // Save the onboarding completion status in local storage
        storageManager.save('onboardingComplete', 'true');

        // Redirect the user to the main page
        window.location.href = '/';
    });
});
