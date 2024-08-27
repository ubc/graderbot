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

// Load and display onboarding information
const senate = storageManager.load('senate');
const department = storageManager.load('department');
const course = storageManager.load('course');

document.getElementById('senate-display').textContent = senate;
document.getElementById('department-display').textContent = department;
document.getElementById('course-display').textContent = course;

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const responseContainer = document.getElementById('response-container');
    const exportButton = document.getElementById('export-button');
    const progressContainer = document.getElementById('progress-container');
    const csvFile1 = document.getElementById('csvFile1');
    const csvFile2 = document.getElementById('csvFile2');
    const csvFile3 = document.getElementById('csvFile3');
    const rubricFile = document.getElementById('rubricFile');

    // File upload process elements
    const startUploadButton = document.getElementById('start-upload-process');
    const nextToGradingSchemeButton = document.getElementById('next-to-grading-scheme');
    const nextToRubricButton = document.getElementById('next-to-rubric');
    const skipToRubricButton = document.getElementById('skip-to-rubric');
    const nextToResponsesButton = document.getElementById('next-to-responses');
    const skipToResponsesButton = document.getElementById('skip-to-responses');
    const finishUploadButton = document.getElementById('finish-upload-process');

    let prompts = [];
    let studentNumbers = [];
    let allResponses = [];

    const steps = ['intro', 'questions', 'grading-scheme', 'rubric', 'responses'];
    let currentStep = 'intro';

    const showStep = (step) => {
        steps.forEach(s => {
            const element = document.getElementById(`upload-${s}`);
            if (element) {
                element.hidden = (s !== step);
            }
        });
    };

    const nextStep = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            currentStep = steps[currentIndex + 1];
            showStep(currentStep);
        }
    };

    startUploadButton.addEventListener('click', () => nextStep());
    nextToGradingSchemeButton.addEventListener('click', () => nextStep());
    nextToRubricButton.addEventListener('click', () => nextStep());
    nextToResponsesButton.addEventListener('click', () => nextStep());

    skipToRubricButton.addEventListener('click', () => {
        currentStep = 'rubric';
        showStep(currentStep);
    });

    skipToResponsesButton.addEventListener('click', () => {
        if (csvFile2.files.length > 0 || rubricFile.files.length > 0) {
            currentStep = 'responses';
            showStep(currentStep);
        } else {
            alert('You must upload either a grading scheme or a rubric before proceeding.');
        }
    });

    const checkFilesSelected = () => {
        nextToGradingSchemeButton.disabled = !(csvFile1.files.length > 0);
        finishUploadButton.disabled = !(csvFile1.files.length > 0 && csvFile3.files.length > 0 && (csvFile2.files.length > 0 || rubricFile.files.length > 0));
        skipToResponsesButton.hidden = !(csvFile2.files.length > 0 || rubricFile.files.length > 0);
    };

    csvFile1.addEventListener('change', checkFilesSelected);
    csvFile2.addEventListener('change', checkFilesSelected);
    csvFile3.addEventListener('change', checkFilesSelected);
    rubricFile.addEventListener('change', checkFilesSelected);

    finishUploadButton.addEventListener('click', async () => {
        const formData = new FormData();
        if (csvFile1.files[0]) formData.append('csvFile1', csvFile1.files[0]);
        if (csvFile2.files[0]) formData.append('csvFile2', csvFile2.files[0]);
        if (csvFile3.files[0]) formData.append('csvFile3', csvFile3.files[0]);
        if (rubricFile.files[0]) formData.append('rubricFile', rubricFile.files[0]);

        try {
            const response = await fetch('/upload-csv', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            logger.log('CSV files uploaded and processed:', result);
            console.log('Uploaded CSV result:', result);

            const questionsAndMaxScores = result.csvFile1;
            const gradingScheme = result.csvFile2 || result.rubricFile;
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
        progressContainer.classList.remove('hidden');
        updateProgressBar(0, prompts.length);

        try {
            const responses = await processAllPrompts(prompts, logger, studentNumbers);
            allResponses = responses;
            renderResponses(responses, responseContainer);
        } catch (error) {
            logger.error('Error fetching response', error);
            responseContainer.innerHTML = 'Error fetching response. Please try again.';
        } finally {
            generateButton.disabled = false;
            progressContainer.classList.add('hidden');
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
        setTimeout(() => {
            const progressContainer = document.getElementById('progress-container');
            progressContainer.classList.add('hidden');
        }, 2000);
    }
}

function renderResponse(response, studentNumber, container) {
    const responseElement = document.createElement('div');
    responseElement.classList.add('response');
    responseElement.innerHTML = `<h3>Response for student number: ${studentNumber}</h3><p>${response}</p>`;
    container.appendChild(responseElement);
}

function renderResponses(responses, container) {
    container.innerHTML = '';
    responses.forEach(({ response, studentNumber }) => {
        renderResponse(response, studentNumber, container);
    });
}

function exportToCSV(responses) {
    const headers = ['Student Number', 'Response'];
    const rows = responses.map(({ studentNumber, response }) => {
        const formattedResponse = JSON.stringify(response).replace(/"/g, '""');
        return `${studentNumber},"${formattedResponse}"`;
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'responses.csv');
    a.click();
}
