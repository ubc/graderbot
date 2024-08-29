import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import multer from 'multer';
import processCSV from './server_modules/csv/processCSV.js';

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
    const { debugMode, llmUrl, prompt } = req.body;
    const url = llmUrl || 'http://localhost:11434/api/generate';
    logger(debugMode, `Request received for /generate with URL: ${url}`); // Log when request is received

    const toSendToLLM = {
        model: 'llama3.1',
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
            temperature: 0,
            num_ctx: 16384
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toSendToLLM)
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        logger(debugMode, 'Response from external API received'); // Log when response is received

        const jsonResponse = await response.json();
        res.json(jsonResponse);

    } catch (error) {
        logger(debugMode, 'Error:', error); // Log any errors
        res.status(500).json({ error: error.message });
    }
});

app.post('/upload-csv', upload.fields([
    { name: 'csvFile1' }, 
    { name: 'csvFile2' }, 
    { name: 'csvFile3' }, 
    { name: 'rubricFile' }
]), (req, res) => {
    const debugMode = req.body.debugMode === 'true';
    const files = req.files;
    const jsonData = {};

    try {
        processCSV(files, jsonData, debugMode);

        logger(debugMode, 'CSV files processed:', jsonData);
        res.json(jsonData);
    } catch (error) {
        logger(debugMode, 'Error processing CSV files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
