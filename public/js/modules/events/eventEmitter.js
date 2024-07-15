/**
 * EventEmitter class that provides a simple event system.
 * This class allows for registering, emitting, and unregistering events and their listeners.
 */
export class EventEmitter {
    /**
     * Creates an instance of EventEmitter.
     * Initializes the events property to store event listeners.
     */
    constructor() {
        this.events = {}; // Object to store event listeners, keyed by event names.
    }

    /**
     * Registers a listener for a specific event.
     * @param {string} event - The name of the event.
     * @param {Function} listener - The callback function to be invoked when the event is emitted.
     */
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = []; // Initialize the event array if it doesn't exist.
        }
        this.events[event].push(listener); // Add the listener to the event array.
    }

    /**
     * Emits a specific event, calling all registered listeners with the provided arguments.
     * @param {string} event - The name of the event.
     * @param {...*} args - Arguments to be passed to the event listeners.
     */
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args)); // Call each listener with the provided arguments.
        }
    }

    /**
     * Unregisters a listener from a specific event.
     * @param {string} event - The name of the event.
     * @param {Function} listener - The callback function to be removed.
     */
    off(event, listener) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(l => l !== listener); // Remove the listener from the event array.
        }
    }
}
