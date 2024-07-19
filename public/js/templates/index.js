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

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const responseContainer = document.getElementById('response-container');
    const uploadButton = document.getElementById('uploadButton');
    const csvFile1 = document.getElementById('csvFile1');
    const csvFile2 = document.getElementById('csvFile2');
    const csvFile3 = document.getElementById('csvFile3');

    // Disable the upload button by default
    uploadButton.disabled = true;

    // Function to check if all files are selected
    const checkFilesSelected = () => {
        uploadButton.disabled = !(csvFile1.files.length > 0 && csvFile2.files.length > 0 && csvFile3.files.length > 0);
    };

    // Add event listeners to check files when they are selected
    csvFile1.addEventListener('change', checkFilesSelected);
    csvFile2.addEventListener('change', checkFilesSelected);
    csvFile3.addEventListener('change', checkFilesSelected);

    uploadButton.addEventListener('click', async () => {
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

            const processedData = await response.json();
            logger.log('CSV files uploaded and processed:', processedData);
            console.log('Processed CSV data:', processedData);

            // Extract context data from local storage
            let selectedSenate     = storageManager.load('senate') || 'UBC Vancouver';
            let selectedDepartment = storageManager.load('department') || 'Computer Science';
            let selectedCourse     = storageManager.load('course') || 'CPSC210';

            const contextData = {
                senate: selectedSenate,
                department: selectedDepartment,
                course: selectedCourse,
            };

            // Clear previous results
            responseContainer.innerHTML = '';

            // Process each question for each student
            processedData.questions.forEach((questionData, questionIndex) => {
                const question = questionData.question;
                const maxScore = questionData.maxScore;
                const gradingRubric = processedData.gradingRubrics[questionIndex]?.rubric || 'No rubric provided';

                processedData.studentAnswers.forEach((studentData) => {
                    const studentAnswer = studentData.answers[questionIndex + 1] || 'No answer provided';

                    // Generate the prompt dynamically
                    const prompt = {
                        context: {
                            ...contextData,
                            question: question,
                            max_score: maxScore
                        },
                        grading_rubric: gradingRubric,
                        student_response: {
                            answer: studentAnswer
                        },
                        instruction: `Provide the score out of ${maxScore}. Your answer should be only '{{score}}/${maxScore}'. Do not provide any reasoning or explanation, just the score.`
                    };

                    console.log(`Prompt for Student ${studentData.studentNumber}, Question ${questionIndex + 1}:`, JSON.stringify(prompt, null, 2));

                    // Send the generated prompt to /generate endpoint
                    fetch('/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ debugMode: true, prompt })
                    }).then(generateResponse => generateResponse.json())
                      .then(generateResult => {
                          responseContainer.innerHTML += `<p>Student ${studentData.studentNumber}, Question ${questionIndex + 1}: ${generateResult.response}</p>`;
                      }).catch(error => {
                          logger.error('Error generating response:', error);
                          responseContainer.innerHTML += `<p>Error grading Student ${studentData.studentNumber}, Question ${questionIndex + 1}: ${error.message}</p>`;
                      });
                });
            });

        } catch (error) {
            logger.error('Error uploading CSV files:', error);
            responseContainer.innerHTML = 'Error uploading and processing CSV files. Please try again.';
        }
    });

    generateButton.addEventListener('click', async () => {
        generateButton.disabled = true;
        responseContainer.innerHTML = 'Loading Response...';

        try {
            const debugMode = storageManager.load('debug-mode');
            const llmUrl = storageManager.load('llm-url') || 'http://localhost:11434/api/generate';
            logger.log('Sending request to /generate');

            let selectedSenate     = storageManager.load('senate') || 'UBC Vancouver';
            let selectedDepartment = storageManager.load('department') || 'Computer Science';
            let selectedCourse     = storageManager.load('course') || 'CPSC210';

            const contextData = {
                senate: selectedSenate,
                department: selectedDepartment,
                course: selectedCourse,
            };

            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debugMode, llmUrl, contextData })
            });

            logger.log('Response received from /generate');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let firstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (firstChunk) {
                                responseContainer.innerHTML = '';
                                firstChunk = false;
                            }
                            responseContainer.innerHTML += data.response;
                        } catch (error) {
                            logger.error('Error parsing line', line, error);
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('Error fetching or streaming response', error);
            responseContainer.innerHTML = 'Error fetching response. Please try again.';
        } finally {
            generateButton.disabled = false;
        }
    });
});
