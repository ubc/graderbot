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
    const generateButton = document.getElementById('generateButton');
    const responseContainer = document.getElementById('response-container');
    const exportButton = document.getElementById('export-button');
    const uploadButton = document.getElementById('uploadButton');
    const progressContainer = document.getElementById('progress-container');
    const csvFile1 = document.getElementById('csvFile1');
    const csvFile2 = document.getElementById('csvFile2');
    const csvFile3 = document.getElementById('csvFile3');

    let prompts = [];
    let studentNumbers = [];
    let allResponses = [];

    // Debugging logs to check if elements are correctly referenced
    console.log('generateButton:', generateButton);
    console.log('responseContainer:', responseContainer);
    console.log('exportButton:', exportButton);
    console.log('uploadButton:', uploadButton);
    console.log('progressContainer:', progressContainer);
    console.log('csvFile1:', csvFile1);
    console.log('csvFile2:', csvFile2);
    console.log('csvFile3:', csvFile3);
    
    if (!generateButton || !responseContainer || !exportButton || !uploadButton || !progressContainer || !csvFile1 || !csvFile2 || !csvFile3) {
        console.error("One or more elements are not properly referenced!");
        return;
    }
    
    // Disable the Upload button until all files are selected
    uploadButton.disabled = true;

    const checkFilesSelected = () => {
        uploadButton.disabled = !(csvFile1.files.length > 0 && csvFile2.files.length > 0 && csvFile3.files.length > 0);
    };

    csvFile1.addEventListener('change', checkFilesSelected);
    csvFile2.addEventListener('change', checkFilesSelected);
    csvFile3.addEventListener('change', checkFilesSelected);

    // Upload button event
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

            // Generate prompts here
            const promptData = createPrompts(questionsAndMaxScores, gradingScheme, studentResponses);
            prompts = promptData.prompts;
            studentNumbers = promptData.studentNumbers;

            console.log('Prompts created:', prompts);
            console.log('Student numbers:', studentNumbers);

            // Enable the Generate button after prompts are ready
            generateButton.disabled = false;

        } catch (error) {
            logger.error('Error uploading CSV files:', error);
        }
    });


// Generate button event
generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    //responseContainer.innerHTML = 'Loading Response...';

    // Ensure the progress bar is visible
    progressContainer.classList.remove('hidden');
    updateProgressBar(0, prompts.length); // Initialize progress bar

    try {
        const responses = await processAllPrompts(prompts, logger, studentNumbers);
        allResponses = responses;
        renderResponses(responses, responseContainer);

    } catch (error) {
        logger.error('Error fetching response', error);
        responseContainer.innerHTML = 'Error fetching response. Please try again.';
    } finally {
        generateButton.disabled = false;
        progressContainer.classList.add('hidden'); // Hide progress bar when done
    }
});


    // Export to CSV button event
    exportButton.addEventListener('click', () => {
        exportToCSV(allResponses);
    });
});

function createPrompts(questionsAndMaxScores, gradingScheme, studentResponses) {
    let prompts = [];
    let studentNumbers = [];

    for (let i = 0; i < questionsAndMaxScores.length; i++) {
        for (let j = 0; j < studentResponses.length; j++) {
            let question = questionsAndMaxScores[i].Question;
            let maxScore = questionsAndMaxScores[i].MaximumScore;
            let scheme = gradingScheme[i];
            let response = studentResponses[j][`Question${i + 1}Answer`];
            let studentNumber = studentResponses[j].StudentNumber;

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
            studentNumbers.push(studentNumber);
        }
    }

    console.log('Prompts:', prompts);
    return { prompts, studentNumbers };
}

function processAllPrompts(prompts, logger, studentNumbers) {
    const debugMode = storageManager.load('debug-mode');
    const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';
    let responses = [];
    const totalPrompts = prompts.length;

    return new Promise((resolve, reject) => {
        const processPrompt = async (index) => {
            if (index >= prompts.length) {
                console.log('All prompts processed. Displaying final message.');
                displayFinalMessage();
                resolve(responses);
                return;
            }

            const prompt = prompts[index];
            const studentNumber = studentNumbers[index];

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
                responses.push({ studentNumber, response: data.response });

                renderResponse(data.response, studentNumber, document.getElementById('response-container'));
                updateProgressBar(index + 1, totalPrompts);

                // Process the next prompt
                processPrompt(index + 1);
            } catch (error) {
                logger.error('Error processing prompt:', error);
                renderResponse(`Error processing response for student number: ${studentNumber}`, studentNumber, document.getElementById('response-container'));
                processPrompt(index + 1);
            }
        };

        // Start processing prompts
        processPrompt(0);
    });
}

function displayFinalMessage() {
    const modal = document.getElementById('finalMessageModal');
    const modalMessage = document.getElementById('modalMessage');
    const span = document.getElementsByClassName('close')[0];

    modalMessage.textContent = 'All responses have been processed successfully! You can now export the responses as a CSV file or review them in the interface.';
    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    console.log('Final message displayed');
}

function updateProgressBar(completed, total) {
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const percentage = Math.round((completed / total) * 100);

    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;

    if (completed === total) {
        // Hide the progress bar but keep the final message visible
        setTimeout(() => {
            const progressContainer = document.getElementById('progress-container');
            progressContainer.classList.add('hidden');
        }, 2000); // Hide after 2 seconds to allow users to see 100%
    }
}

function renderResponse(response, studentNumber, container) {
    const responseElement = document.createElement('div');
    responseElement.classList.add('response');
    responseElement.innerHTML = `<h3>Response for student number: ${studentNumber}</h3><p>${response}</p>`;
    container.appendChild(responseElement);
}

function renderResponses(responses, container) {
    container.innerHTML = ''; // Clear existing content
    responses.forEach(({ response, studentNumber }) => {
        renderResponse(response, studentNumber, container);
    });
}

function exportToCSV(responses) {
    // Create CSV headers
    const headers = ['Student Number', 'Response'];
    
    // Map over the responses array to create rows for each response
    const rows = responses.map(({ studentNumber, response }) => {
        // Here we assume that response is an object and we want to extract some specific fields
        // If response is a string or a simple data structure, you might need to adjust this
        const formattedResponse = JSON.stringify(response).replace(/"/g, '""'); // Escape double quotes for CSV format
        
        return `${studentNumber},"${formattedResponse}"`;
    });

    // Combine headers and rows into CSV content
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create a Blob and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'responses.csv');
    a.click();
}
