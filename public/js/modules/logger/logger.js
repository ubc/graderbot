export class Logger {
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    log(message, ...optionalParams) {
        if (this.storageManager.load('debug-mode')) {
            console.log(message, ...optionalParams);
        }
    }

    error(message, ...optionalParams) {
        if (this.storageManager.load('debug-mode')) {
            console.error(message, ...optionalParams);
        }
    }
}
