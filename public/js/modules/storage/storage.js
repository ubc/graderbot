/**
 * Storage class that serves as an interface for different storage strategies.
 * This class defines the methods that must be implemented by any storage strategy.
 */
export class Storage {
    /**
     * Saves a value to storage with the specified key.
     * This method must be implemented by subclasses.
     * @param {string} key - The key under which the value will be stored.
     * @param {*} value - The value to be stored.
     * @throws {Error} If the method is not implemented by a subclass.
     */
    save(key, value) {
        throw new Error("Method 'save()' must be implemented."); // Throws an error indicating that the method must be implemented.
    }

    /**
     * Loads a value from storage using the specified key.
     * This method must be implemented by subclasses.
     * @param {string} key - The key of the value to be loaded.
     * @returns {*} The loaded value, or null if not found.
     * @throws {Error} If the method is not implemented by a subclass.
     */
    load(key) {
        throw new Error("Method 'load()' must be implemented."); // Throws an error indicating that the method must be implemented.
    }

    /**
     * Deletes a value from storage using the specified key.
     * This method must be implemented by subclasses.
     * @param {string} key - The key of the value to be deleted.
     * @throws {Error} If the method is not implemented by a subclass.
     */
    delete(key) {
        throw new Error("Method 'delete()' must be implemented."); // Throws an error indicating that the method must be implemented.
    }
}
