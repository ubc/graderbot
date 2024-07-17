/**
 * Handles the root route JavaScript for the GraderBot app.
 * It checks if onboarding is complete, handles generating responses, and updating the UI accordingly.
 */

import { LocalStorageStrategy } from '../modules/storage/localStorageStrategy.js';
import { StorageManager } from '../modules/storage/storageManager.js';
import { Notifications } from '../modules/notifications/notifications.js';
import { Logger } from '../modules/logger/logger.js';

// Initialize the storage manager with the LocalStorage strategy
const storageManager = new StorageManager(new LocalStorageStrategy());
const logger = new Logger(storageManager);

/**
 * Check if onboarding is complete. If not, redirect to the onboarding page.
 */
if (!storageManager.load('onboardingComplete')) {
    window.location.href = '/onboarding';
}

/**
 * Adds an event listener to the 'Generate Response' button to send a request to the server
 * and display the generated response.
 */
document.addEventListener('DOMContentLoaded', () => {

	// The button which triggers the example response.
    const generateButton = document.getElementById('generate-button');

	// The container for the generated response.
    const responseContainer = document.getElementById('response-container');

    /**
     * Event listener for the 'Generate Response' button click event.
     *
     * When the button is clicked, this function sends a POST request to the '/generate' endpoint,
     * reads the streaming response, and updates the response container with the generated text.
     */
    generateButton.addEventListener('click', async () => {

		// Disable button to prevent multuple clicks. It's re-enabled after the response stream is complete or an error occurs.
        generateButton.disabled = true;

        // Display loading message
        responseContainer.innerHTML = 'Loading Response...';

        try {
            const debugMode = storageManager.load('debug-mode');
            const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';
            logger.log('Sending request to /generate'); // Log when request is sent

            // Send a POST request to the '/generate' endpoint
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugMode, llmUrl })
            });

            logger.log('Response received from /generate'); // Log when response is received

            // Create a reader to read the response stream
            const reader = response.body.getReader();

            // Create a TextDecoder to decode the streamed text data
            const decoder = new TextDecoder('utf-8');

            // Variable to check if this is the first chunk of the response
            let firstChunk = true;

            while (true) {

                // Read the next chunk from the stream
                const { done, value } = await reader.read();

                // Exit the loop if there are no more chunks to read
                if (done) {
					break;
				}

				// Decode the chunk into a string
                const chunk = decoder.decode(value, { stream: true });

				// Split the chunk into individual lines
				const lines = chunk.split('\n');

				// Process each line separately
				for (const line of lines) {

					// Ignore empty or whitespace-only lines
                    if (line.trim()) {
                        try {
                            // Parse the JSON data from the line
                            const data = JSON.parse(line);

							// If this is the first chunk, clear the loading message
                            if (firstChunk) {
                                responseContainer.innerHTML = '';
                                firstChunk = false;
                            }

							// Append the 'response' property from the parsed data to the response container
                            responseContainer.innerHTML += data.response;

						} catch (error) {
                            // Log an error if the line could not be parsed
                            logger.error('Error parsing line', line, error);
                        }
                    }
                }
            }
        } catch (error) {

            // Log any errors that occurred during the fetch or streaming process
            logger.error('Error fetching or streaming response', error);
            responseContainer.innerHTML = 'Error fetching response. Please try again.';

		} finally {

			// Re-enable the button after the response stream is complete or an error occurs
            generateButton.disabled = false;

		}

	});

    // Handle CSV file uploads
    const uploadButton = document.getElementById('uploadButton');

    uploadButton.addEventListener('click', async () => {
        const files = [
            document.getElementById('csvFile1').files[0],
            document.getElementById('csvFile2').files[0],
            document.getElementById('csvFile3').files[0]
        ];

        const formData = new FormData();
        files.forEach((file, index) => {
            if (file) {
                formData.append(`csvFile${index + 1}`, file);
            }
        });

        try {
            const response = await fetch('/upload-csv', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            logger.log('CSV files uploaded and processed:', result);
        } catch (error) {
            logger.error('Error uploading CSV files:', error);
        }
    });

});
