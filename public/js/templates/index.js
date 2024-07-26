import { LocalStorageStrategy } from '../modules/storage/localStorageStrategy.js';
import { StorageManager } from '../modules/storage/storageManager.js';
import { Notifications } from '../modules/notifications/notifications.js';
import { Logger } from '../modules/logger/logger.js';

// Initialize the storage manager with the LocalStorage strategy
const storageManager = new StorageManager(new LocalStorageStrategy());
const logger = new Logger(storageManager);

if (!storageManager.load('onboardingComplete')) {
    window.location.href = '/onboarding';
}

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const responseContainer = document.getElementById('response-container');
    const exportButton = document.getElementById('export-button');
    let allResponses = [];

    generateButton.addEventListener('click', async () => {
        generateButton.disabled = true;
        responseContainer.innerHTML = 'Loading Response...';

        try {
            const debugMode = storageManager.load('debug-mode');
            const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';
            logger.log('Sending request to /generate');

            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugMode, llmUrl, prompt })
            });

            logger.log('Response received from /generate');
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            allResponses = [data.response];
            renderResponses(allResponses, responseContainer);
        } catch (error) {
            logger.error('Error fetching response', error);
            responseContainer.innerHTML = 'Error fetching response. Please try again.';
        } finally {
            generateButton.disabled = false;
        }
    });

    const uploadButton = document.getElementById('uploadButton');
    const csvFile1 = document.getElementById('csvFile1');
    const csvFile2 = document.getElementById('csvFile2');
    const csvFile3 = document.getElementById('csvFile3');

    uploadButton.disabled = true;

    const checkFilesSelected = () => {
        uploadButton.disabled = !(csvFile1.files.length > 0 && csvFile2.files.length > 0 && csvFile3.files.length > 0);
    };

    csvFile1.addEventListener('change', checkFilesSelected);
    csvFile2.addEventListener('change', checkFilesSelected);
    csvFile3.addEventListener('change', checkFilesSelected);

    uploadButton.addEventListener('click', async () => {
        console.log('Upload button clicked');
        const files = [csvFile1.files[0], csvFile2.files[0], csvFile3.files[0]];
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
            console.log('Uploaded CSV result:', result);

            const questionsAndMaxScores = result.csvFile1;
            const gradingScheme = result.csvFile2;
            const studentResponses = result.csvFile3;

            const prompts = createPrompts(questionsAndMaxScores, gradingScheme, studentResponses);
            console.log('Prompts created:', prompts);
            const responses = await processAllPrompts(prompts, logger);
            allResponses = responses;
            renderResponses(responses, responseContainer);
        } catch (error) {
            logger.error('Error uploading CSV files:', error);
        }
    });

    exportButton.addEventListener('click', () => {
        exportToCSV(allResponses);
    });
});

function createPrompts(questionsAndMaxScores, gradingScheme, studentResponses) {
    let prompts = [];
    for (let i = 0; i < questionsAndMaxScores.length; i++) {
        for (let j = 0; j < studentResponses.length; j++) {
            let question = questionsAndMaxScores[i].Question;
            let maxScore = questionsAndMaxScores[i].MaximumScore;
            let scheme = gradingScheme[i];
            let response = studentResponses[j][`Question${i + 1}Answer`];

            let prompt = `
                You are tasked with grading student answers based on the provided grading rubric. Each entry in the grading rubric corresponds to a score. Some fields in the rubric are left blank, indicating that you should extrapolate what a response for that score might look like based on the provided examples.

                Guidelines for Grading:
                - Compare the student's response to the examples in the rubric.
                - Assess how well the response covers the key concepts mentioned in the question.
                - Evaluate the clarity, completeness, and accuracy of the explanation.
                - Consider the depth of detail provided about any examples or tools mentioned.
                - Assign the score that best matches the quality of the response according to the rubric.

                Question: ${question}
                Rubric: ${JSON.stringify(scheme, null, 2)}
                Answer: ${response}
                The maximum score for this question is ${maxScore}. Do not provide any reasoning. Answer in JSON like this:
                {score: '{YOUR SCORE}', maximumScore: ${maxScore}}
            `;
            prompts.push(prompt);
        }
    }
    console.log('Prompts:', prompts);
    return prompts;
}

async function processAllPrompts(prompts, logger) {
    const debugMode = storageManager.load('debug-mode');
    const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';
    let responses = [];

    for (let prompt of prompts) {
        try {
            console.log('Sending prompt:', prompt);
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugMode: debugMode, llmUrl: llmUrl, prompt: prompt.trim() })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data for prompt:', data);
            responses.push(data.response);
        } catch (error) {
            logger.error('Error processing prompt:', error);
        }
    }
    console.log('All responses:', responses);
    return responses;
}

function renderResponses(responses, container) {
    container.innerHTML = ''; // Clear existing content
    responses.forEach((response, index) => {
        const responseElement = document.createElement('div');
        responseElement.classList.add('response');
        responseElement.innerHTML = `<h3>Response ${index + 1}</h3><p>${response}</p>`;
        container.appendChild(responseElement);
    });
}

function exportToCSV(responses) {
    const csvContent = responses.map((response, index) => `Response ${index + 1},${response}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'responses.csv');
    a.click();
}
