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
     * When the button is clicked, this function sends a POST request to the '/generate' endpoint
     * and updates the response container with the generated text.
     */
    generateButton.addEventListener('click', async () => {

        // Disable button to prevent multiple clicks. It's re-enabled after the response is received or an error occurs.
        generateButton.disabled = true;

        // Display loading message
        responseContainer.innerHTML = 'Loading Response...';

        try {
            const debugMode = storageManager.load('debug-mode');
            const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';
            const prompt = 'What is 2 + 2? respond in JSON';
            logger.log('Sending request to /generate'); // Log when request is sent

            // Send a POST request to the '/generate' endpoint
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugMode, llmUrl, prompt })
            });

            logger.log('Response received from /generate'); // Log when response is received

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // Display the response
            responseContainer.innerHTML = data.response;

        } catch (error) {

            // Log any errors that occurred during the fetch process
            logger.error('Error fetching response', error);
            responseContainer.innerHTML = 'Error fetching response. Please try again.';

        } finally {

            // Re-enable the button after the response is received or an error occurs
            generateButton.disabled = false;

        }

    });

    // Handle CSV file uploads
    const uploadButton = document.getElementById('uploadButton');
    const csvFile1 = document.getElementById('csvFile1');
    const csvFile2 = document.getElementById('csvFile2');
    const csvFile3 = document.getElementById('csvFile3');

    // Disable the upload button by default
    uploadButton.disabled = true;

    // Function to check if all files are selected
    const checkFilesSelected = () => {
        if (csvFile1.files.length > 0 && csvFile2.files.length > 0 && csvFile3.files.length > 0) {
            uploadButton.disabled = false;
        } else {
            uploadButton.disabled = true;
        }
    };

    // Add event listeners to check files when they are selected
    csvFile1.addEventListener('change', checkFilesSelected);
    csvFile2.addEventListener('change', checkFilesSelected);
    csvFile3.addEventListener('change', checkFilesSelected);

    uploadButton.addEventListener('click', async () => {
        const files = [
            csvFile1.files[0],
            csvFile2.files[0],
            csvFile3.files[0]
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

			let jsonDataFromCSVs = result;

			let questionsAndMaxScores = jsonDataFromCSVs.csvFile1;
			let gradingScheme         = jsonDataFromCSVs.csvFile2;
			let studentResponses      = jsonDataFromCSVs.csvFile3;

			let q1MaxScore      = questionsAndMaxScores[0].MaximumScore;
			let q1Question      = questionsAndMaxScores[0].Question;
			let q1GradingScheme = gradingScheme[0];
			let q1s1Response    = studentResponses[0].Question1Answer;

			console.log([q1Question, q1MaxScore, q1GradingScheme, q1s1Response]);

			let prompt = `
                You are tasked with grading student answers based on the provided grading rubric. Each entry in the grading rubric corresponds to a score. Some fields in the rubric are left blank, indicating that you should extrapolate what a response for that score might look like based on the provided examples.

                Guidelines for Grading:

                - Compare the student's response to the examples in the rubric.
                - Assess how well the response covers the key concepts mentioned in the question.
                - Evaluate the clarity, completeness, and accuracy of the explanation.
                - Consider the depth of detail provided about any examples or tools mentioned.
                - Assign the score that best matches the quality of the response according to the rubric.

                Question: ${q1Question}
                Rubric: ${JSON.stringify(q1GradingScheme, null, 2)}
                Answer: ${q1s1Response}

                The maximum score for this question is ${q1MaxScore}. Do not provide any reasoning. Answer in JSON like this:
                {score: '{YOUR SCORE}', maximumScore: ${q1MaxScore}}
            `;

			// Log the prompt to ensure it's correct
            console.log(prompt);

			const debugMode = storageManager.load('debug-mode');
            const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';

            // Send the prompt to the LLM endpoint
            const llmResponse = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugMode: debugMode, llmUrl: llmUrl, prompt: prompt.trim() }) // Trimming the prompt to remove any unnecessary whitespace
            });

            if (!llmResponse.ok) {
                throw new Error(`Server responded with ${llmResponse.status}`);
            }

            const llmData = await llmResponse.json();
            responseContainer.innerHTML = llmData.response;


        } catch (error) {
            logger.error('Error uploading CSV files:', error);
        }
    });

});
