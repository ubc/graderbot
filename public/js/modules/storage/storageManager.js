import { EventEmitter } from '../events/eventEmitter.js';
import { LocalStorageStrategy } from './localStorageStrategy.js';

/**
 * StorageManager class [that extends EventEmitter] to handle storage operations.
 * This class allows saving, loading, and deleting items from a storage strategy,
 * and emits events when these operations occur.
 */
export class StorageManager extends EventEmitter {
    /**
     * Creates an instance of StorageManager.
     * @param {Storage} strategy - The storage strategy to be used (e.g., LocalStorageStrategy).
     */
    constructor(strategy = null) {
        super();
        this.strategy = strategy || new LocalStorageStrategy(); // Assign the provided storage strategy to the instance.
    }

    /**
     * Saves a value to storage with the specified key and emits a 'save' event.
     * @param {string} key - The key under which the value will be stored.
     * @param {*} value - The value to be stored.
     */
    save(key, value) {
        this.strategy.save(key, value); // Use the storage strategy to save the value.
        this.emit('save', key, value); // Emit a 'save' event with the key and value.
    }

    /**
     * Loads a value from storage using the specified key and emits a 'load' event.
     * @param {string} key - The key of the value to be loaded.
     * @returns {*} The loaded value, or null if not found.
     */
    load(key) {
        const value = this.strategy.load(key); // Use the storage strategy to load the value.
        this.emit('load', key, value); // Emit a 'load' event with the key and value.
        return value; // Return the loaded value.
    }

    /**
     * Deletes a value from storage using the specified key and emits a 'delete' event.
     * @param {string} key - The key of the value to be deleted.
     */
    delete(key) {
        this.strategy.delete(key); // Use the storage strategy to delete the value.
        this.emit('delete', key); // Emit a 'delete' event with the key.
    }
}
