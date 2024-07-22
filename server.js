import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import multer from 'multer';
import fs from 'fs';
import csvToJson from 'convert-csv-to-json';
import { cleanCSVData, restoreNewlinesInJSON } from './server_modules/csv/utils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2123;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle the /onboarding route
app.get('/onboarding', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'onboarding.html'));
});

// Handle the /config route
app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'config.html'));
});

// Logger function
const logger = (debugMode, message, ...optionalParams) => {
    if (debugMode) {
        console.log(message, ...optionalParams);
    }
};

// Example endpoint to generate a response
app.post('/generate', async (req, res) => {
    const { debugMode, llmUrl } = req.body;
    const url = llmUrl || 'http://localhost:11434/api/generate';
    logger(debugMode, `Request received for /generate with URL: ${url}`); // Log when request is received
    let prompt = `Prompt for Student 9289673441, Question 5: {
        "context": {
          "senate": "UBC Vancouver",
          "department": "Computer Science",
          "course": "CPSC210",
          "question": "Explain the difference between unit testing, integration testing, and system testing. Discuss the role of automated testing in software development and provide an example of a testing framework or tool used for automated testing.",
          "max_score": "15"
        },
        "grading_rubric": [
          {
            "score": 1,
            "answer": ""
          },
          {
            "score": 2,
            "answer": ""
          },
          {
            "score": 3,
            "answer": "Unit testing tests individual components. Integration testing checks if components work together. System testing tests the whole system. Automated testing runs tests automatically. JUnit is a tool for automated testing."
          },
          {
            "score": 4,
            "answer": ""
          },
          {
            "score": 5,
            "answer": ""
          },
          {
            "score": 6,
            "answer": "Unit testing tests individual components. Integration testing checks if components work together. System testing tests the whole system. Automated testing helps run tests automatically. JUnit is an automated testing tool used in Java."
          },
          {
            "score": 7,
            "answer": ""
          },
          {
            "score": 8,
            "answer": ""
          },
          {
            "score": 9,
            "answer": "Unit testing focuses on testing individual components or functions to ensure they work correctly. Integration testing checks if multiple components work together as expected. System testing evaluates the entire system's compliance with the requirements.\\n\\nAutomated testing is crucial in software development as it allows for frequent and consistent execution of tests, improving efficiency and reliability. For example, JUnit is a popular framework for automated testing in Java. It allows developers to write and run repeatable tests easily."
          },
          {
            "score": 10,
            "answer": ""
          },
          {
            "score": 11,
            "answer": ""
          },
          {
            "score": 12,
            "answer": "Unit testing involves testing individual components or functions in isolation to verify their correctness. Integration testing checks if different components of the system work together correctly. System testing evaluates the entire system's compliance with the specified requirements.\\n\\nAutomated testing plays a vital role in software development. It enables developers to run tests quickly and consistently, which helps catch bugs early and ensures that new code changes do not break existing functionality. Automated tests can be run frequently, such as after every code commit or in a continuous integration pipeline, improving the overall quality of the software.\\n\\nJUnit is a widely used framework for automated testing in Java. It provides annotations to identify test methods, setup and teardown processes for test environments, and assertions to check expected outcomes. This helps streamline the testing process and makes it easier to maintain a robust suite of tests."
          },
          {
            "score": 13,
            "answer": ""
          },
          {
            "score": 14,
            "answer": ""
          },
          {
            "score": 15,
            "answer": "Unit testing, integration testing, and system testing are essential components of a comprehensive testing strategy in software development.\\n\\nUnit Testing: This level of testing focuses on individual components or functions in isolation to ensure they work correctly. Each unit test verifies a small part of the application's functionality, usually in a single class or function. Unit tests are typically written by developers and run frequently to catch bugs early.\\n\\nIntegration Testing: Integration testing checks if different components of the system interact and work together correctly. This testing level ensures that interfaces between components are working as expected. It helps identify issues related to data flow and interactions between modules that might not be evident in unit testing.\\n\\nSystem Testing: System testing evaluates the entire system's compliance with the specified requirements. This level of testing validates the complete and integrated software product to ensure it meets the business needs and works as expected in a production-like environment.\\n\\nRole of Automated Testing:\\nAutomated testing is crucial in modern software development due to its ability to run tests quickly, frequently, and consistently. It enhances the efficiency of the development process by:\\n\\n    Reducing Manual Effort: Automated tests can run repeatedly without manual intervention, saving time and effort.\\n    Increasing Test Coverage: Automated tests can cover a wide range of scenarios and edge cases that might be missed in manual testing.\\n    Ensuring Continuous Quality: Automated testing is an integral part of continuous integration/continuous deployment (CI/CD) pipelines, ensuring that code changes do not introduce new bugs.\\n\\nExample Framework: JUnit\\nJUnit is a popular framework for automated testing in Java. It provides a structured and efficient way to write and run tests. Key features of JUnit include:\\n\\n    Annotations: Identify test methods (@Test), setup (@Before), and teardown (@After) methods.\\n    Assertions: Check expected outcomes using methods like assertEquals(), assertTrue(), and assertNotNull().\\n    Test Runners: Execute tests and report results."
          }
        ],
        "student_response": {
          "answer": "Unit testing involves testing individual components or functions in isolation to verify their correctness. Integration testing checks if different components of the system work together correctly. System testing evaluates the entire system's compliance with the specified requirements.\\n\\nAutomated testing plays a vital role in software development. It enables developers to run tests quickly and consistently, which helps catch bugs early and ensures that new code changes do not break existing functionality. Automated tests can be run frequently, such as after every code commit or in a continuous integration pipeline, improving the overall quality of the software.\\n\\nJUnit is a widely used framework for automated testing in Java. It provides annotations to identify test methods, setup and teardown processes for test environments, and assertions to check expected outcomes. This helps streamline the testing process and makes it easier to maintain a robust suite of tests."
        },
        "instruction": "Your answer should be only '{{score}}/{{max_score}}'. Do not provide any reasoning or explanation, just the score.\\nYou are tasked with grading student answers based on the provided grading rubric. Each entry in the grading rubric corresponds to a score. Some fields in the rubric are left blank, indicating that you should extrapolate what a response for that score might look like based on the provided examples.\\n\\nGuidelines for Grading:\\n\\nCompare the student's response to the examples in the rubric.\\nAssess how well the response covers the key concepts mentioned in the question.\\nEvaluate the clarity, completeness, and accuracy of the explanation.\\nConsider the depth of detail provided about any examples or tools mentioned.\\nAssign the score that best matches the quality of the response according to the rubric.\\nProvide the score out of {{max_score}}. Your answer should be only '{{score}}/{{max_score}}'. Do not provide any reasoning or explanation, just the score."
      }`;
      
      console.log(prompt);      
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model: 'llama3', prompt: prompt })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        logger(debugMode, 'Response from external API received'); // Log when response is received

        // Set headers to ensure the response is treated as streaming
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Use response.body directly as a stream
        response.body.pipe(res);

        response.body.on('data', chunk => {
            logger(debugMode, 'Chunk received:', chunk.toString()); // Log each chunk
        });

        response.body.on('end', () => {
            logger(debugMode, 'Response streaming completed'); // Log when response streaming is complete
        });

    } catch (error) {
        logger(debugMode, 'Error:', error); // Log any errors
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to handle CSV upload and conversion to JSON
// Endpoint to handle CSV upload and conversion to JSON
// Endpoint to handle CSV upload and conversion to JSON
app.post('/upload-csv', upload.fields([{ name: 'csvFile1' }, { name: 'csvFile2' }, { name: 'csvFile3' }]), (req, res) => {
    const debugMode = req.body.debugMode === 'true';
    const files = req.files;
    const jsonData = {};

    try {
        Object.keys(files).forEach((key) => {
            const file = files[key][0];
            const filePath = file.path;

            // Read the CSV file content
            const csvString = fs.readFileSync(filePath, 'utf-8');

            // Clean the CSV data
            const cleanedCSVString = cleanCSVData(csvString);

            // Save the cleaned CSV data to a temporary file
            const tempFilePath = filePath + '.tmp';
            fs.writeFileSync(tempFilePath, cleanedCSVString);

            // Convert cleaned CSV to JSON
            const json = csvToJson.fieldDelimiter(',').supportQuotedField(true).getJsonFromCsv(tempFilePath);

            // Restore newlines in JSON data
            jsonData[key] = restoreNewlinesInJSON(json);

            // Delete the original and temporary CSV files
            fs.unlinkSync(filePath);
            fs.unlinkSync(tempFilePath);
        });

        // Log the raw JSON data
        logger(debugMode, 'Raw JSON Data:', JSON.stringify(jsonData, null, 2));

        // Process the JSON data to extract required information
        const processedData = {
            questions: jsonData.csvFile1.map((item) => ({
                questionNumber: item['Question Number'],
                question: item.Question,
                maxScore: item.MaximumScore
            })),
            gradingRubrics: jsonData.csvFile2.map((item) => {
                const rubrics = [];
                Object.keys(item).forEach((key, index) => {
                    if (key.startsWith('Rubric')) {
                        const score = index; // Ensure the score matches the array index + 1
                        rubrics.push({
                            score: score,
                            answer: item[key]
                        });
                    }
                });
                return {
                    questionNumber: item['Question Number'],
                    rubric: rubrics
                };
            }),
            studentAnswers: jsonData.csvFile3.map((item) => {
                const answers = {};
                Object.keys(item).forEach((key) => {
                    if (key.startsWith('Question') && key.endsWith('Answer')) {
                        const questionNumber = key.replace('Question', '').replace('Answer', '');
                        answers[questionNumber] = item[key] || "No answer provided";
                    }
                });
                return {
                    studentNumber: item.StudentNumber || null,
                    answers: answers
                };
            })
        };

        logger(debugMode, 'Processed CSV Data:', JSON.stringify(processedData, null, 2));
        res.json(processedData);
    } catch (error) {
        logger(debugMode, 'Error processing CSV files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to save prompt to a file
app.post('/save-prompt', (req, res) => {
    const { prompt } = req.body;
    try {
        fs.writeFileSync(path.join(__dirname, 'storedPrompt.json'), JSON.stringify(prompt));
        res.status(200).json({ message: 'Prompt saved successfully' });
    } catch (error) {
        logger(true, 'Error saving prompt:', error);
        res.status(500).json({ error: 'Failed to save prompt' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
