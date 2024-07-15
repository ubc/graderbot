import { Storage } from './storage.js';

/**
 * LocalStorageStrategy class that implements the Storage interface.
 * This class handles saving, loading, and deleting items using the browser's localStorage.
 */
export class LocalStorageStrategy extends Storage {
    /**
     * Saves a value to localStorage with the specified key.
     * @param {string} key - The key under which the value will be stored.
     * @param {*} value - The value to be stored.
     */
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value)); // Convert the value to a JSON string and save it to localStorage.
    }

    /**
     * Loads a value from localStorage using the specified key.
     * @param {string} key - The key of the value to be loaded.
     * @returns {*} The loaded value, or null if not found.
     */
    load(key) {
        const value = localStorage.getItem(key); // Retrieve the value from localStorage.
        return value ? JSON.parse(value) : null; // Parse the JSON string back to its original value or return null if not found.
    }

    /**
     * Deletes a value from localStorage using the specified key.
     * @param {string} key - The key of the value to be deleted.
     */
    delete(key) {
        localStorage.removeItem(key); // Remove the item from localStorage using the specified key.
    }
}
