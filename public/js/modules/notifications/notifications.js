// notifications.js
export class Notifications {
    static show(message, type = 'info') {
        Toastify({
            text: message,
            duration: 3000, // Duration in milliseconds
            close: true, // Show a close button
            gravity: 'top', // Position
            position: 'right', // Position
            backgroundColor: type === 'info' ? 'blue' : 'red',
            stopOnFocus: true, // Stop when hovering
        }).showToast();
    }
}
